const request = require("supertest");
const mongoose = require("mongoose");
const { Post } = require("../../models/Post");
const { User } = require("../../models/User");
const { Comment } = require("../../models/Comment");

//*Utility functions
let createUser = async ()=>{
    let user = new User({username: "testUser", password: "testPassword"});
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
}); 