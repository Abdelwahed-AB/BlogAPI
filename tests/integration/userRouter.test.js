const mongoose = require("mongoose");
const request = require("supertest");
const { User } = require("../../models/User");

let server;
describe("User router", ()=>{

    beforeEach(async ()=>{server = require("../../app");});
    afterEach(async ()=>{
        await server.close();
        await User.deleteMany({}); // cleanup
        await User.collection.dropIndex("*");
    });
    afterAll(async ()=>{await mongoose.disconnect();});

    describe("Get /", ()=>{
        /*
        * it should return 401 if user is not logged in
        * it should return 403 if user is not admin
        * it should return a list of all users if user is admin
        */

        /**
         * test case to run with different options
         * @param {Boolean} loggedIn 
         * @param {Boolean} isAdmin
         * @returns 
         */
        let testCase = async (loggedIn = false, isAdmin = false) => {
            if(!loggedIn)
                return request(server).get("/users").send();
            
            let user = new User({username:"testUser", password: "testPass", isAdmin: isAdmin});
            await user.save();
            return request(server).get("/users").set("x-auth-token", user.generateAuthToken()).send();
        };

        it("Should return 401 if user is not logged in.", async ()=>{
            let res = await testCase();
            expect(res.statusCode).toBe(401);
        });

        it("Should return 403 if user is not admin.", async ()=>{
            let res = await testCase(true, false);
            
            expect(res.statusCode).toBe(403);
        });

        it("Should return a list of all users if current user is admin.", async ()=>{
            User.insertMany([
                {username: "testUser1", password:"password"},
                {username: "testUser2", password:"password"},
                {username: "testUser3", password:"password"},
            ]);
            let res = await testCase(true, true);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(3);
            expect(res.body.some(u=>u.username == "testUser1")).toBeTruthy();
            expect(res.body.some(u=>u.username == "testUser2")).toBeTruthy();
        });
    });

    describe("Get /:id", ()=>{
        /*
        * it should return 401 if user is not logged in
        * it should return 403 if user is not admin
        * it should return 404 if user is not found
        * it should return selected user if current user is admin
        */

        /**
         * test case to run with different options
         * @param {Boolean} loggedIn 
         * @param {Boolean} isAdmin
         * @returns 
         */
        let testCase = async (loggedIn = false, isAdmin = false, noSave=false) => {
            let testUser = new User({username:"testUser", password: "testPass"});
            if(!noSave)
                await testUser.save();
            let url = "/users/"+testUser._id.toHexString();
            
            if(!loggedIn)
                return request(server).get(url).send();
            
            let user = new User({username:"testUser", password: "testPass", isAdmin: isAdmin});
            await user.save();
            return request(server).get(url).set("x-auth-token", user.generateAuthToken()).send();
        };

        it("Should return 401 if user is not logged in.", async ()=>{
            let res = await testCase();
            expect(res.statusCode).toBe(401);
        });

        it("Should return 403 if user is not admin.", async ()=>{
            let res = await testCase(true, false);
            
            expect(res.statusCode).toBe(403);
        });

        it("Should return 404 if specified user is not found.", async ()=>{
            let res = await testCase(true, true, true);
            
            expect(res.statusCode).toBe(404);
        });

        it("Should return specified user if current user is admin.", async ()=>{
            let res = await testCase(true, true);
            
            expect(res.statusCode).toBe(200);
            console.log(res.body);
            expect(Object.keys(res.body)).toEqual(expect.arrayContaining(["_id", "username", "password"]));
        });
    });

    describe("Post /", ()=>{
        /*
        * it should return 400 if user is invalid
        * it should create a user in the database
        * it should return a user object if it is created
        */
        let testCase = (validUser = true) => {
            let testUser;
            if(validUser)
                testUser = { username: "testUser", password: "testPass"};
            else
                testUser = { username:"ho", password: "0"};

            let url = "/users";
        
            return request(server).post(url).send(testUser);
        };

        it("Should return 400 if user is invalid.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(400);
        });

        it("Should create a user in the database if user is valid.", async ()=>{
            let res = await testCase();
            let user = User.findOne({username: "testUser"});

            expect(res.statusCode).toBe(200);
            expect(user).toBeDefined();
        });

        it("Should return a user object if it is created.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toEqual("testUser");
        });
    });

});