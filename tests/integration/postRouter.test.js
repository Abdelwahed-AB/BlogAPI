
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
        await User.deleteMany({}).exec();
        await User.collection.dropIndex("*");
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
            await user.encryptPassword();
            await user.save();

            let token = loggedIn ? user.generateAuthToken():"";

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
                .toEqual(expect.arrayContaining(["title", "content", "author", "creationDate", "_id"]));
        });
    });

    describe("Put /:id", ()=>{
        /**
         * @typedef {Object} TestCaseParameters
         * @property {Boolean} loggedIn send token in request
         * @property {Boolean} authorized test with an authorized user
         * @property {Boolean} validId send requests with a valid (existing) id
         * @property {Boolean} validPost send request with a valid post
         */


        let post;
        /**
         * test case for put /posts/:id
         * @param { TestCaseParameters } options options for testing
         * @returns { Promise } Response
         */
        let testCase = async (options)=>{
            let user = new User({username: "testUser", password: "testPassword"});
            await user.encryptPassword();
            await user.save();

            let unAuthorizedUser = new User({username: "unAuthorized", password: "testPassword"});
            await unAuthorizedUser.encryptPassword();
            await unAuthorizedUser.save();


            post = new Post({title: "testTitle", content:"testContent", author: user._id});
            await post.save();

            let invalidPostId = (new mongoose.Types.ObjectId()).toHexString();
            let url = "/posts/"+ (options.validId ? post._id.toHexString() : invalidPostId );

            let token = "";
            if(options.loggedIn)
                token = options.authorized ? user.generateAuthToken(): unAuthorizedUser.generateAuthToken();

            let reqPost = options.validPost? {title: "ModifiedTitle", content: "ModifiedContent"}: {title: "0", content: "0"};

            return request(server)
                    .put(url)
                    .set("x-auth-token", token)
                    .send(reqPost);
        }

        it("Should return 401 if user is not authenticated.", async()=>{
            let options = {
                loggedIn: false,
                authorized: true,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(401);
        });
        it("Should return 403 if user is unAuthorized (doesnt own post).", async()=>{
            let options = {
                loggedIn: true,
                authorized: false,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(403);
        });
        it("Should return 404 if postId is not valid.", async()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: false,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(404);
        });
        it("Should return 400 if post is not valid.", async()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: true,
                validPost: false,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(400);
        });
        it("Should update the post in the database.", async()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            let postInDb = await Post.findById(post._id);

            expect(res.statusCode).toBe(200);
            expect(postInDb).toBeDefined();
            expect(postInDb.title).toBe("ModifiedTitle");
            expect(postInDb.content).toBe("ModifiedContent");
        });
        it("Should return the updated post.", async()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe("ModifiedTitle");
            expect(res.body.content).toBe("ModifiedContent");
        });
    });

    describe("Delete /:id", ()=>{
        /**
         * @typedef {Object} TestCaseParameters
         * @property {Boolean} loggedIn send token in request
         * @property {Boolean} authorized test with an authorized user
         * @property {Boolean} validId send requests with a valid (existing) id
         */

        let post;

        /**
         * test case for Delete /posts/:id
         * @param { TestCaseParameters } options options for testing
         * @returns { Promise } Response
         */
        let testCase = async (options)=>{
            let user = new User({username: "testUser", password: "testPassword"});
            await user.encryptPassword();
            await user.save();

            let unAuthorizedUser = new User({username: "unAuthorized", password: "testPassword"});
            await unAuthorizedUser.encryptPassword();
            await unAuthorizedUser.save();


            post = new Post({title: "testTitle", content:"testContent", author: user._id});
            await post.save();

            let invalidPostId = (new mongoose.Types.ObjectId()).toHexString();
            let url = "/posts/"+ (options.validId ? post._id.toHexString() : invalidPostId );

            let token = "";
            if(options.loggedIn)
                token = options.authorized ? user.generateAuthToken(): unAuthorizedUser.generateAuthToken();
            
            return request(server)
                .delete(url)
                .set("x-auth-token", token)
                .send();
        };

        it("Should return 401 if user is not authenticated.", async()=>{
            let options = {
                loggedIn: false,
                authorized: true,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(401);
        });
        it("Should return 403 if user is unAuthorized (doesnt own post).", async()=>{
            let options = {
                loggedIn: true,
                authorized: false,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(403);
        });
        it("Should return 404 if postId is not valid.", async()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: false,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(404);
        });
        
        it("Should remove the post from database.", async ()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            let postInDb = await Post.findById(post._id);

            expect(res.statusCode).toBe(200);
            expect(postInDb).toBeNull();
        });

        it("Should return the deleted post.", async ()=>{
            let options = {
                loggedIn: true,
                authorized: true,
                validId: true,
                validPost: true,
            };
            let res = await testCase(options);

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe("testTitle");
            expect(res.body.content).toBe("testContent");
        });

        //TODO check if post comments have been deleted
    });
});