import Jimp from "jimp";
import "dotenv/config";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { resizeImage } from "../utils/resizeImage.js";
export const handler = async (event) => {
    let params = event.queryStringParameters;
    let filename = params.f;
    let externalImageURL = params.src;
    // requested dimensions
    let requestedWidth = params.w;
    let requestedHeight = params.h;
    let quality = params.q;
    let imageToRead;
    // resize external image
    if (externalImageURL) {
        imageToRead = externalImageURL;
    } else {
        imageToRead = `https://dino-image-library.s3.eu-west-2.amazonaws.com/${filename.replace(
            ".",
            "_s."
        )}`;
    }
    // measure small image first
    let imageToResize = await Jimp.read(imageToRead);

    // internal - select closest image size (s/m/l)
    // read image width
    if (!externalImageURL) {
        let smallImageWidth = imageToResize.bitmap.width;
        let smallImageHeight = imageToResize.bitmap.height;
        // calculate s3 image version to resize
        console.log(requestedWidth, requestedHeight);

        if (
            requestedWidth > smallImageWidth * 5 ||
            requestedHeight > smallImageHeight * 5
        ) {
            console.log("large image processed");
            imageToResize = await Jimp.read(
                `https://dino-image-library.s3.eu-west-2.amazonaws.com/${filename}`
            );
        } else if (
            requestedWidth > smallImageWidth * 2 ||
            requestedHeight > smallImageHeight * 2
        ) {
            console.log("medium image processed");
            imageToResize = await Jimp.read(
                `https://dino-image-library.s3.eu-west-2.amazonaws.com/${filename.replace(
                    ".",
                    "_m."
                )}`
            );
        } else {
            console.log("small image processed");
        }
    }

    let resizedImage = await resizeImage(
        imageToResize,
        parseInt(requestedWidth),
        parseInt(requestedHeight)
    );
    // .getBase64Async(Jimp.AUTO);
    // const resizedBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
    // Define the table name
    const tableName = "ResizeServiceTable";

    // Define the partition key and sort key values
    // const partitionKey = req.body.user; // Replace with actual partition key value
    // Create a DynamoDB client instance
    const dynamodbClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
    });

    // TODO - add dynamic username, however don't really wanna pass through query strings
    // Construct the update command
    const updateCommand = new UpdateItemCommand({
        TableName: tableName,
        Key: { USER: { S: "123" } },
        ExpressionAttributeValues: { ":inc": { N: "1" } },
        UpdateExpression: "ADD #fileResizeRequestCount :inc",
        ExpressionAttributeNames: {
            "#fileResizeRequestCount": "fileResizeRequestCount",
        },
    });

    try {
        const result = await dynamodbClient.send(updateCommand);
        //console.log("Item updated successfully:", result);
    } catch (error) {
        console.error("Error updating item:", error);
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": imageToResize._originalMime,
            "Content-Encoding": "base64",
        },
        body: resizedImage.toString("base64"),

        isBase64Encoded: true,
    };
};
