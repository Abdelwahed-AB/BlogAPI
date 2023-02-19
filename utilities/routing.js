var userRouter = require("../routes/userRouter");
var commentRouter = require("../routes/commentRouter");
var postRouter = require("../routes/postRouter");

/**
sets up the routes for the application
@param app Express app
*/
module.exports = (app)=>{
    postRouter.use("/:postId/comments", commentRouter);
    
    app.use("/users", userRouter);
    app.use("/posts", postRouter);
};