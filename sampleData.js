const images = [
    {
        id: 1,
        s3URIs: ["http//1a", "http//1b"],
        filename: "bla.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 2,
        s3URIs: ["http//2a", "http//2b"],
        filename: "ggggg.jpg",
        fileType: "jpg",
        width: 200,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 3,
        s3URIs: ["http//3a", "http//3b"],
        filename: "aaaaa.jpg",
        fileType: "jpg",
        width: 155,
        height: 150,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 4,
        s3URIs: ["http//4a", "http//4b"],
        filename: "blabbbbbb.jpg",
        fileType: "jpg",
        width: 1010,
        height: 1010,
        compressed: true,
        compressedPercent: 10,
    },
    {
        id: 5,
        s3URIs: ["http//5a", "http//5b"],
        filename: "nneen.jpg",
        fileType: "jpg",
        width: 200,
        height: 200,
        compressed: false,
        compressedPercent: null,
    },
    {
        id: 6,
        s3URIs: ["http//6a", "http//6b"],
        filename: "eeeee.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 7,
        s3URIs: ["http//7a", "http//7b"],
        filename: "pppppp.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 8,
        s3URIs: ["http//8a", "http//8b"],
        filename: "ggggg.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 9,
        s3URIs: ["http//9a", "http//9b"],
        filename: "bpppppla.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 10,
        s3URIs: ["http//10a", "http//10"],
        filename: "blcccccca.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
    {
        id: 11,
        s3URIs: ["http//11a", "http//1b"],
        filename: "11.jpg",
        fileType: "jpg",
        width: 100,
        height: 100,
        compressed: true,
        compressedPercent: 80,
    },
];
const users = [
    {
        id: 1,
        username: "Fred",
        email: "fred@fred.com",
        password: "blblbalba",
        date_created: "2023-06-06",
        images: [images[0], images[1], images[2]],
    },
    {
        id: 502,
        username: "Jeff",
        email: "jeff@jeff.com",
        password: "ngghghghclba",
        date_created: "2023-02-02",
        images: [4, 5, 6],
    },
    {
        id: 503,
        username: "Wilma",
        email: "Wilma@w.com",
        password: "qqqqqqq",
        date_created: "2021-01-06",
        images: [7, 8, 9],
    },
    {
        id: 504,
        username: "Gary",
        email: "gary@gary.com",
        password: "ppppppppppplba",
        date_created: "2023-12-12",
        images: [10, 11, 12],
    },
    {
        id: 505,
        username: "Mel",
        email: "mel@mel.com",
        password: "pepeeelfda",
        date_created: "2023-09-09",
        images: [13, 14, 15],
    },
];

module.exports = { users, images };
