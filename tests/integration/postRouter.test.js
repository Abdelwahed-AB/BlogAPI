const { Post } = require("../../models/Post");
const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../models/User");

let server;
describe("Post router", ()=>{
    beforeEach(async ()=>{server = require("../../app");});
    afterEach(async ()=>{
        await server.close();
        await Post.deleteMany({}); // cleanup
    });
    afterAll(async ()=>{await mongoose.disconnect();});

    describe("Get /", ()=>{

        /**
         * Test case for Get /posts
         * @returns { Promise } Response
         */
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
        /**
         * Test case for Get /posts/:id
         * @param {Boolean} validId determines wether the id sent in the req should be valid or not
         * @returns { Promise } Response
         */
        let testCase = async (validId = true)=>{
            let post = new Post({title: "testTitle", content:"testContent", author: new mongoose.Types.ObjectId()});
            await post.save();
            
            let wrongId = (new mongoose.Types.ObjectId()).toHexString();
            let url = "/posts/"+(validId ? post._id.toHexString(): wrongId);

            return request(server)
                    .get(url)
                    .send();
        }

        it("Should return 404 if post is not found.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return the selected post.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(Object.keys(res.body))
                .toEqual(expect.arrayContaining(["title", "content", "author", "creationDate"]));
        });
    });

    describe("Post /", ()=>{

        let post; //used to store the post sent in req, I should probbly add it in the return

        /**
         * testCase for Post /posts
         * @param {Boolean} loggedIn determines wether the request will be sent with an auth token
         * @param {Boolean} validPost determines wether the post sent in the request should be valid or not
         * @returns {Promise} Response
         */
        let testCase = async (loggedIn = true, validPost = true)=>{
            let user = new User({username: "testUser", password: "testPassword"});
            await user.save();

            let token = loggendIn ? user.generateAuthToken():"";

            post = validPost? {title: "testTitle", content: "testContent"}: {title: "0", content: "0"};

            return request(server)
                    .post("/posts")
                    .set("x-auth-token", token)
                    .send(post);
        };

        it("Should return 401 if user is not authenticated.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(401);
        });

        it("Should return 400 if post is invalid.", async()=>{
            let res = await testCase(true, false);

            expect(res.statusCode).toBe(400);
        });

        it("Should create the post in the database.", async()=>{
            let res = await testCase();
            let postInDb = await Post.findById(post._id);

            expect(res.statusCode).toBe(200);
            expect(postInDb).toBeDefined();
        });

        it("Should return the created post.", async()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(Object.keys(res.body))
                .toBe(expect.arrayContaining(["title", "content", "author", "creationDate"]));
        });

    });
});