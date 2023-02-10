let { validatePost } = require("../../../models/Post");

describe("Post validator", ()=>{
    it("Should return a list of errors if post is not valid.", ()=>{
        let post = {title: 0, content: 0};
        let err = validatePost(post);

        expect(err).toBeDefined();
        expect(Object.keys(err)).toEqual(expect.arrayContaining(["_original", "details"]));
        expect(Object.keys(err.details[0])).toEqual(expect.arrayContaining(["message", "path"]));
    });

    it("Should return null if post is valid", ()=>{
        let post = {title: "Test title", content: "No content"};
        let err = validatePost(post);

        expect(err).not.toBeDefined();
    });
});