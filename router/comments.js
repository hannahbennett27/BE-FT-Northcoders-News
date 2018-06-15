const commentsRouter = require("express").Router();
const {
  getComments,
  voteForCommentById,
  deleteCommentById
} = require("../controllers");

commentsRouter.route("/").get(getComments);

commentsRouter
  .route("/:comment_id")
  .put(voteForCommentById)
  .delete(deleteCommentById);

module.exports = commentsRouter;
