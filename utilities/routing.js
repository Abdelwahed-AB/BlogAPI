var userRouter = require("../routes/userRouter");
var commentRouter = require("../routes/commentRouter");
var postRouter = require("../routes/postRouter");

/**
sets up the routes for the application
@param app Express app
*/
module.exports = (app)=>{
    app.use("/users", userRouter);
    app.use("/posts", commentRouter);
    app.use("/posts/comments", commentRouter);
};