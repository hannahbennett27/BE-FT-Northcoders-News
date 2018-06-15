const topicsRouter = require("express").Router();
const {
  getTopics,
  getArticlesByTopic,
  postArticleByTopic
} = require("../controllers");

topicsRouter.route("/").get(getTopics);

topicsRouter
  .route("/:topic_name/articles")
  .get(getArticlesByTopic)
  .post(postArticleByTopic);

module.exports = topicsRouter;
