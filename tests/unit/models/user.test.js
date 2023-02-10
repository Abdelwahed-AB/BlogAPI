const { validateUser } = require("../../../models/User");

describe("User validator", ()=>{
    it("Should return a list of errors if user is not valid.", ()=>{
        let user = {username: "0", password:"0"};
        let err = validateUser(user);
        
        expect(err).toBeDefined();
        expect(Object.keys(err)).toEqual(expect.arrayContaining(["_original", "details"]));
        expect(Object.keys(err.details[0])).toEqual(expect.arrayContaining(["message", "path"]));
    });

    it("Should return null if user is valid.", ()=>{
        let user = {username: "testUser", password: "password"};
        let err = validateUser(user);

        expect(err).not.toBeDefined();
    });
});