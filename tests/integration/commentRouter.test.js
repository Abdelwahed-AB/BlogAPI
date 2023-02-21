const request = require("supertest");
const mongoose = require("mongoose");
const { Post } = require("../../models/Post");
const { User } = require("../../models/User");
const { Comment } = require("../../models/Comment");

//*Utility functions
let createUser = async (username)=>{
    let user = new User({username: username? username:"testUser", password: "testPassword"});
    await user.encryptPassword();
    await user.save();

    return user;
};

let createPost = async (user)=>{
    let post = new Post({title: "testTitle", content: "testContent", author: user._id});

    await post.save();
    return post;
};

let createComment = async (post, user) => {
    let comment = new Comment({content: "commentTestContent", author: user._id, post: post._id});
    post.comments.push(comment._id);

    await comment.save(); //*Probably need to add transaction here
    await post.save();

    return comment;
}


let server;
describe("Comment router", ()=>{
    beforeEach(async ()=>{server = require("../../app");});
    afterEach(async ()=>{
        await server.close();
        await Post.deleteMany({}); // cleanup
        await Comment.deleteMany({});
        await User.deleteMany({}).exec();
        await User.collection.dropIndex("*");
    });
    afterAll(async ()=>{await mongoose.disconnect();});

    describe("Get /", ()=>{

        /**
         * test case for get /posts/:postId/comments
         * @param {Boolean} validPostId 
         * @returns {Promise}
         */
        let testCase = async (validPostId=true) => {
            let user = await createUser();
            let post = await createPost(user);

            await createComment(post, user);
            await createComment(post, user);

            let pid = validPostId? post._id.toHexString(): (new mongoose.Types.ObjectId()).toHexString();
            let url = `/posts/${pid}/comments`;

            return request(server)
                    .get(url)
                    .send();
        };

        it("Should return 404 if post id is invalid.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return a list of all comments.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.every(c => c.content == "commentTestContent")).toBeTruthy();
        });
    });

    describe("Get /:id", ()=>{
        /**
         * test case for get /posts/:postId/comments/:commentId
         * @param {Boolean} validPostId 
         * @returns {Promise}
         */
        let testCase = async (validPostId=true, validCommentId=true) => {
            let user = await createUser();
            let post = await createPost(user);

            let comment = await createComment(post, user);

            let pid = validPostId? post._id.toHexString(): (new mongoose.Types.ObjectId()).toHexString();
            let cid = validCommentId? comment._id.toHexString() : (new mongoose.Types.ObjectId()).toHexString();

            let url = `/posts/${pid}/comments/${cid}`;

            return request(server)
                    .get(url)
                    .send();
        };

        it("Should return 404 if post id is invalid.", async ()=>{
            let res = await testCase(false, true);

            expect(res.statusCode).toBe(404);
        });

        it("Should return 404 if comment id is invalid.", async ()=>{
            let res = await testCase(true, false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return the selected comment.", async ()=>{
            let res = await testCase(true, true);

            expect(res.statusCode).toBe(200);
            expect(Object.keys(res.body)).toEqual(expect.arrayContaining(["_id", "content", "author"]));
        });
    });

    describe("Post /", ()=>{

        let post;
        /**
         * Test case for Post /posts/id/comments
         * @param {Boolean} validPostId 
         * @param {Boolean} validComment 
         * @param {Boolean} loggedIn 
         * @returns Promise
         */
        let testCase = async (validPostId=true, validComment=true, loggedIn=true) => {
            let user = await createUser();
            post = await createPost(user);

            let pid = validPostId? post._id.toHexString(): (new mongoose.Types.ObjectId()).toHexString();
            let token = loggedIn ? user.generateAuthToken() : "";
            let comment = {
                content: validComment? "validTestContent":""
            };

            let url = `/posts/${pid}/comments`;

            return request(server)
                    .post(url)
                    .set("x-auth-token", token)
                    .send(comment);
        };

        it("Should return 401 if user is not logged in.", async ()=>{
            let res = await testCase(true, true, false);

            expect(res.statusCode).toBe(401);
        });

        it("Should return 404 if post id is not valid.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return 400 if comment is not valid.", async ()=>{
            let res = await testCase(true, false);

            expect(res.statusCode).toBe(400);
        });

        it("Should create a comment in db.", async ()=>{
            let res = await testCase();
            let postInDb = await Post.findById(post._id);
            let commentsInDb = postInDb.comments;

            expect(res.statusCode).toBe(200);
            expect(commentsInDb).toBeDefined();
            expect(commentsInDb.length).toBe(1);
        });

        it("Should return the created comment.", async ()=>{
            let res = await testCase();
            
            expect(res.statusCode).toBe(200);
            expect(Object.keys(res.body))
                .toEqual(expect.arrayContaining(["_id", "content", "author"]));
        });
    });

    describe("Put /", ()=>{
        let post;
        let comment;
        /**
         * Test case for put /posts/postid/comments/commentid
         * @param {Boolean} loggedIn 
         * @param {Boolean} authorized
         * @param {Boolean} validPostId 
         * @param {Boolean} validComment
         * @param {Boolean} validCommentId 
         * @returns Promise
         */
        let testCase = async (loggedIn=true, authorized=true, validPostId=true, validCommentId=true, validComment=true) => {
            let user = await createUser();
            let unAuthorizedUser = await createUser("unAuthorizedUser");

            post = await createPost(user);
            comment = await createComment(post, user);

            let pid = validPostId? post._id.toHexString(): (new mongoose.Types.ObjectId()).toHexString();
            let cid = validCommentId? comment._id.toHexString() : (new mongoose.Types.ObjectId()).toHexString();

            let token = "";
            let payload = {
                content: validComment? "validPutTestContent":""
            };
            let url = `/posts/${pid}/comments/${cid}`;

            if(loggedIn){
                token = authorized ? user.generateAuthToken() : unAuthorizedUser.generateAuthToken();
            }

            return request(server)
                    .put(url)
                    .set("x-auth-token", token)
                    .send(payload);
        };

        it("Should return 401 if user is not loggedIn.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(401);
        });

        it("Should return 403 if user is not authorized.", async()=>{
            let res = await testCase(true, false);

            expect(res.statusCode).toBe(403);
        });

        it("Should return 404 if post id is not valid.", async()=>{
            let res = await testCase(true, true, false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return 404 if comment id is not valid.", async()=>{
            let res = await testCase(true, true, true, false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return 400 if comment is not valid.", async ()=>{
            let res = await testCase(true, true, true, true, false); //! need to pass an options object for a cleaner implementation

            expect(res.statusCode).toBe(400);
        });

        it("Should update the comment in db.", async ()=>{
            let res = await testCase();
            let commentInDb = await Comment.findById(comment._id);

            expect(res.statusCode).toBe(200);
            expect(commentInDb).toBeDefined();
            expect(commentInDb.content).toBe("validPutTestContent");
        });

        it("Should return the updated comment.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(Object.keys(res.body))
                .toEqual(expect.arrayContaining(["_id", "content", "author"]));
            expect(res.body.content).toBe("validPutTestContent");
        });
    });
}); 