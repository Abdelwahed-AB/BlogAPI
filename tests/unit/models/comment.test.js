const mongoose = require("mongoose");
let { validateComment } = require("../../../models/Comment");

describe("Comment validator", ()=>{
    it("Should return a list of errors if comment is not valid.", ()=>{
        let comment = {content: 0, post: 0};
        let err = validateComment(comment);

        expect(err).toBeDefined();
        expect(Object.keys(err)).toEqual(expect.arrayContaining(["_original", "details"]));
        expect(Object.keys(err.details[0])).toEqual(expect.arrayContaining(["message", "path"]));
    });

    it("Should return null if comment is valid.", ()=>{
        let post = new mongoose.Types.ObjectId().toHexString();
        let comment = {content: "test content", post: post};
        let err = validateComment(comment);

        expect(err).not.toBeDefined();
    });
});