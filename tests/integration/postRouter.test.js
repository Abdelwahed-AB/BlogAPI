const { Post } = require("../../models/Post");
const request = require("supertest");
const mongoose = require("mongoose");

let server;
describe("Post router", ()=>{
    beforeEach(async ()=>{server = require("../../app");});
    afterEach(async ()=>{
        await server.close();
        await Post.deleteMany({}); // cleanup
    });
    afterAll(async ()=>{await mongoose.disconnect();});

    describe("Get /", ()=>{

        let testCase = ()=>{
            return request(server).get("/posts").send();
        };

        it("Should return a list of all posts in db.", async ()=>{
            await Post.insertMany([
               {title: "testTitle1", content:"testContent1", author: new mongoose.Types.ObjectId()},
               {title: "testTitle2", content:"testContent2", author: new mongoose.Types.ObjectId()},
               {title: "testTitle3", content:"testContent3", author: new mongoose.Types.ObjectId()},
            ]);

            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(3);
            expect(res.body.some(p => p.title == "testTitle1")).toBeTruthy();
            expect(res.body.some(p => p.title == "testTitle2")).toBeTruthy();
            expect(res.body.some(p => p.title == "testTitle3")).toBeTruthy();
        });
    });

    describe("Get /:id", ()=>{
        let testCase = async (validId = true)=>{
            let post = new Post({title: "testTitle", content:"testContent", author: new mongoose.Types.ObjectId()});
            await post.save();
            
            let wrongId = (new mongoose.Types.ObjectId()).toHexString();
            let url = "/posts/"+(validId ? post._id.toHexString(): wrongId);

            return request(server).get(url).send();
        }

        it("Should return 404 if post is not found.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return the selected post.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(Object.keys(res.body)).toEqual(expect.arrayContaining(["title", "content", "author", "creationDate"]));
        });
    });

    
});