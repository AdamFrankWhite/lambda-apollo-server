import { ApolloServer } from "@apollo/server";
import {
    startServerAndCreateLambdaHandler,
    handlers,
} from "@as-integrations/aws-lambda";
import { startStandaloneServer } from "@apollo/server/standalone";
import "dotenv/config";
import bcrypt from "bcrypt";
import {
    DynamoDBClient,
    UpdateItemCommand,
    GetItemCommand,
    PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { GraphQLString } from "graphql";

const port = process.env.PORT;
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});
const dynamoDBClient = new DynamoDBClient({ region: "eu-west-2" });
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  
    type Query {
        user(id: String!): User
      }
    
      type User {
          id: String
          username: String
          email: String
          password: String
          date_created: String
          images: [Image]
          fileResizeRequestCount: Int
      }
    
      type Image {
          imageID: String
          imageUrl: String
          filename: String
          fileType: String
          width: Int
          height: Int
          compressed: Boolean
          compressedPercent: Int
    
      }

      type Mutation {
        deleteImage(id: String!, filename: String!): User
      }

      type Mutation {
        createUser(username: String!, password: String!): User
      }
     

      
    
     
`;

// mutation deleteImage($id: String!, $filename: String!) {
//     delete(id: $id, filename: $filename) {
//       images {
//         filename
//       }
//     }
//   }
const resolvers = {
    Query: {
        async user(parent, args, contextValue, info) {
            console.log("ID: " + args.id);

            const params = {
                TableName: "ResizeServiceTable",
                Key: {
                    USER: { S: "123" },
                    // SortKey: { S: "some-sort-value" }
                },
            };

            // create command
            const command = new GetItemCommand(params);

            // execute command/handle response
            return dynamoDBClient
                .send(command)
                .then((data) => {
                    console.log("Item retrieved:", data.Item);

                    // MAP ITEM TODO - extract out
                    let userObj = {
                        id: parseInt(data.Item.USER.S),
                        username: data.Item.username.S,
                        email: data.Item.email.S,
                        password: "bla",
                        date_created: "meh",
                        images: data.Item.images.L,
                        filesUploadCount: data.Item.filesUploadCount.N,
                        fileResizeRequestCount:
                            data.Item.fileResizeRequestCount.N,
                    };
                    let userImages = data.Item.images.L;
                    userObj.images = userImages.map((img) => {
                        return {
                            filename: img.M.filename.S,
                            imageUrl: img.M.imageUrl.S,
                            fileType: img.M.fileType.S,
                        };
                    });
                    let user = userObj;
                    console.log(user);
                    return user;
                })
                .catch((error) => {
                    console.error("Error retrieving item:", error);
                });
        },
    },
    Mutation: {
        async deleteImage(parent, args, contextValue, info) {
            let id = args.id;
            let filename = args.filename;
            const params = {
                TableName: "ResizeServiceTable",
                Key: {
                    USER: { S: id },
                    // SortKey: { S: "some-sort-value" }
                },
            };

            //DELETE FROM S3 BUCKET
            try {
                const bucketParams = {
                    Bucket: "dino-image-library",
                    Key: filename,
                };
                const data = await s3.send(
                    new DeleteObjectCommand(bucketParams)
                );
                console.log("Success. Object deleted.", data);
                // return data; // For unit tests.
            } catch (err) {
                console.log("Error", err);
            }

            // DELETE FROM DYNAMODB
            // create command
            const command = new GetItemCommand(params);

            // execute command/handle response
            let filteredArray = await dynamoDBClient
                .send(command)
                .then((data) => {
                    // console.log("Item retrieved:", data.Item);

                    // MAP ITEM TODO - extract out
                    let imagesArray = data.Item.images.L;

                    return imagesArray.filter(
                        (item) => item.M.filename.S != filename
                    );
                })
                .catch((error) => {
                    console.error("Error retrieving item:", error);
                });

            const updateCommand = new UpdateItemCommand({
                TableName: "ResizeServiceTable",
                Key: { USER: { S: id } },
                UpdateExpression: "SET images = :updatedList",

                ExpressionAttributeValues: {
                    ":updatedList": { L: filteredArray },
                },
            });

            try {
                const result = await dynamoDBClient.send(updateCommand);

                console.log("Item updated successfully:", result);
                return filteredArray;
            } catch (error) {
                console.error("Error updating item:", error);
            }

            // let userObj = {
            //     id,
            //     username: id,
            //     email: "bleh",
            //     password: "bla",
            //     date_created: "meh",
            //     images: [{ filename }],
            //     filesUploadCount: 5,
            //     fileResizeRequestCount: 5,
            // };
            // return userObj;
        },
        async createUser(parent, args, contextValue, info) {
            let username = args.username;
            let password = args.password;
            console.log("user added: " + username);
            // hash password

            await bcrypt.hash(password, 10, function (err, hash) {
                // save to dynamoDb
                const item = {
                    TableName: "ResizeServiceTable",
                    Item: {
                        // Specify the attributes of the item
                        USER: { S: username },
                        password: { S: hash },
                    },
                };

                const putItemCommand = new PutItemCommand(item);
                // separate function for async/await
                async function putItem() {
                    try {
                        const response = await dynamoDBClient.send(
                            putItemCommand
                        );
                        console.log("Item added:", response);
                    } catch (error) {
                        console.error("Error adding item:", error);
                    }
                }

                // Call the putItem function
                putItem();
                // return user
                // res.json(insertResult);
            });
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
// const { url } = await startStandaloneServer(server, {
//     listen: { port: 5000 },
// });

// console.log(`🚀  Server ready at: ${url}`);
export const graphqlHandler = startServerAndCreateLambdaHandler(
    server,
    // We will be using the Proxy V2 handler
    handlers.createAPIGatewayProxyEventV2RequestHandler()
);
