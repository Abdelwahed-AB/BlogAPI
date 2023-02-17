const mongoose = require("mongoose");
const request = require("supertest");
const { User } = require("../../models/User");

let server;
describe("User router", ()=>{

    beforeEach(async ()=>{server = require("../../app");});
    afterEach(async ()=>{
        await server.close();
        await User.deleteMany({}).exec();
        await User.collection.dropIndex("*"); // cleanup
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
         * @returns { Promise } request
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
            expect(Object.keys(res.body)).toEqual(expect.arrayContaining(["_id", "username"]));
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

    describe("Put /:id", ()=>{
        /*
        * it should return 401 if user in not Logged in
        * it should return 404 if user is not found
        * it should return 400 if user is invalid
        * it should update the user in the database
        * it should return a user object if it is created
        */
        let testCase = async (validUser = true, validId = true, loggedIn=true) => {
            let user = new User({username: "testUser", password: "testPass"});
            await user.encryptPassword();
            await user.save();

            let token = loggedIn? user.generateAuthToken() : "";

            let testUser;
            if(validUser)
                testUser = { username: "testUser1", password: "testPass1"};
            else
                testUser = { username:"ho", password: "0"};

            let url = "/users/"+ (validId? user._id: (new mongoose.Types.ObjectId()).toHexString());
        
            return request(server).put(url).set("x-auth-token", token).send(testUser);
        };

        it("Should return 401 if user is not logged in.", async ()=>{
            let res = await testCase(true, true, false);

            expect(res.statusCode).toBe(401);
        });

        it("Should return 404 if user is not found.", async ()=>{
            let res = await testCase(true, false);

            expect(res.statusCode).toBe(404);
        });

        it("Should return 400 if user is invalid.", async ()=>{
            let res = await testCase(false);

            expect(res.statusCode).toBe(400);
        });

        it("Should update the user in the database.", async ()=>{
            let res = await testCase();
            let user = await User.findOne({username: "testUser1"});

            let passwordChanged = await user.verifyPassword("testPass1");

            expect(res.statusCode).toBe(200);
            expect(user).toBeDefined();
            expect(passwordChanged).toBeTruthy();
        });

        it("Should return the updated user.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe("testUser1");
        });
    });

    describe("Delete /:id", ()=>{
        /*
        * it should return 401 if user is not logged in
        * it should return 403 if user is not admin
        * it should return 404 if user is not found
        * it should remove the user in the database
        * it should return a user object if it is deleted
        */

        let testCase = async (validId = true, loggedIn=true, isAdmin = true) => {
            let user = new User({username: "testUser", password: "testPass", isAdmin: isAdmin});
            await user.encryptPassword();
            await user.save();
            
            let token = loggedIn ? user.generateAuthToken() : "";
            let url = "/users/"+ (validId? user._id: (new mongoose.Types.ObjectId()).toHexString());

            return request(server).delete(url).set("x-auth-token", token).send();
        };
        
        it("Should return 401 if user is not logged in", async ()=>{
            let res = await testCase(true, false);
            
            expect(res.statusCode).toBe(401);
        });

        it("Should return 403 if user is not admin.", async ()=>{
            let res = await testCase(true, true, false);
            
            expect(res.statusCode).toBe(403);
        });

        it("Should return 404 if user is not found.", async ()=>{
            let res = await testCase(false);
            
            expect(res.statusCode).toBe(404);
        });

        it("Should remove the user from the database.", async ()=>{
            let res = await testCase();
            let user = await User.findOne({username: "testUser"});

            expect(res.statusCode).toBe(200);
            expect(user).toBeNull();
        });

        it("Should return the deleted user.", async ()=>{
            let res = await testCase();

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe("testUser");
        });
    });

    describe("Post /login", ()=>{
        /*
        * it should return 400 if username or password is invalid
        * it should return a valid jwtToken if user data is valid
        */
        let testCase = async (validUsername = true, validPassword = true) => {
            let user = new User({username: "testUser", password: "testPass"});
            await user.encryptPassword();
            await user.save();

            let payload = {
                username: validUsername ?"testUser":"ho",
                password: validPassword ?"testPass":"He",
            }
            let url = "/users/login";
        
            return request(server).post(url).send(payload);
        };

        it("Should return 400 if username is invalid", async ()=>{
            let res = await testCase(false);
            expect(res.statusCode).toBe(400);
        });

        it("Should return 400 if password is invalid", async ()=>{
            let res = await testCase(true, false);
            expect(res.statusCode).toBe(400);
        });

        it("Should return a valid jwtToken if user data is valid", async ()=>{
            let res = await testCase(true, true);
            
            expect(res.statusCode).toBe(200);
            
            let isValidToken = ((token)=>{
                let tokenHead = JSON.parse(atob(token.split(".")[0]));
                return tokenHead.typ == "JWT";
            })(res.body.token);
            
            expect(isValidToken).toBeTruthy(); 
        });
    });
});