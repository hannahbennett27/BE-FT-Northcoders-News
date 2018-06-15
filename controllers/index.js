const { Topic, Article, User, Comment } = require("../models");
const mongoose = require("mongoose");
const {
  endpointsJSON,
  formatPostArticle,
  formatArticlesForClient,
  createArticleRef,
  formatCommentsForClient,
  formatPostComment
} = require("../utils");

const getEndpoints = (req, res, next) => {
  res.send(endpointsJSON);
};

const getTopics = (req, res, next) => {
  Topic.find()
    .then(topics => {
      res.send({ topics });
    })
    .catch(next);
};

const getArticlesByTopic = (req, res, next) => {
  const { topic_name } = req.params;
  Article.find({ belongs_to: topic_name })
    .lean()
    .populate("created_by", "username")
    .then(articleDocs => {
      return Promise.all(formatArticlesForClient(articleDocs));
    })
    .then(articles => {
      if (articles.length === 0)
        return next({
          status: 404,
          msg: "articles not found: invalid topic name."
        });
      res.send({ articles });
    })
    .catch(next);
};

const postArticleByTopic = (req, res, next) => {
  return Topic.find({ slug: req.params.topic_name })
    .then(topic => {
      if (topic.length === 0)
        throw next({
          status: 404,
          msg: "topic not found: invalid topic name."
        });
      return Promise.all([req, User.aggregate([{ $sample: { size: 1 } }])]);
    })
    .then(([req, userArr]) => {
      const userId = userArr[0]._id;
      const newArticle = new Article(formatPostArticle(req, userId));
      return newArticle.save();
    })
    .then(article => {
      res.status(201).send({ article });
    })
    .catch(next);
};

const getArticles = (req, res, next) => {
  Article.find()
    .lean()
    .populate("created_by", "username")
    .then(articleDocs => {
      return Promise.all(formatArticlesForClient(articleDocs));
    })
    .then(articles => {
      res.send({ articles });
    })
    .catch(next);
};

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  Article.findById(article_id)
    .lean()
    .populate("created_by", "username")
    .then(articleDoc => {
      if (articleDoc === null)
        throw next({
          status: 404,
          msg: "article not found: invalid article id."
        });
      return Promise.all(formatArticlesForClient([articleDoc]));
    })
    .then(([article]) => {
      res.send({ article });
    })
    .catch(next);
};

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Comment.find({ belongs_to: article_id })
    .lean()
    .populate("created_by", "username")
    .then(commentDocs => {
      if (commentDocs.length === 0)
        throw next({
          status: 404,
          msg: "comments not found: invalid article id."
        });
      return Promise.all(formatCommentsForClient(commentDocs));
    })
    .then(comments => {
      res.send({ comments });
    })
    .catch(next);
};

const postCommentByArticleId = (req, res, next) => {
  return Article.findById(req.params.article_id)
    .then(article => {
      if (article === null)
        throw next({
          status: 404,
          msg: "article not found: invalid article id."
        });
      return Promise.all([req, User.aggregate([{ $sample: { size: 1 } }])]);
    })
    .then(([req, userArr]) => {
      const userId = userArr[0]._id;
      const newComment = new Comment(formatPostComment(req, userId));
      return newComment.save();
    })
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

const voteForArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { vote } = req.query;
  const voteRef = { up: 1, down: -1 };
  Article.findByIdAndUpdate(
    article_id,
    { $inc: { votes: voteRef[vote] } },
    { new: true }
  )
    .then(article => {
      if (article === null)
        return next({
          status: 404,
          msg: "article not found: invalid article id."
        });
      res.status(202).send({ article });
    })
    .catch(next);
};

const getComments = (req, res, next) => {
  Comment.find()
    .then(comments => {
      res.send({ comments });
    })
    .catch(next);
};

const voteForCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { vote } = req.query;
  const voteRef = { up: 1, down: -1 };
  Comment.findByIdAndUpdate(
    comment_id,
    { $inc: { votes: voteRef[vote] } },
    { new: true }
  )
    .then(comment => {
      if (comment === null)
        return next({
          status: 404,
          msg: "comment not found: invalid comment id."
        });
      res.status(202).send({ comment });
    })
    .catch(next);
};

const deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  Comment.findByIdAndRemove(comment_id)
    .then(comment => {
      if (comment === null)
        return next({
          status: 404,
          msg: "comment not found: invalid comment id."
        });
      res.status(202).send(comment);
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find()
    .then(users => {
      res.send({ users });
    })
    .catch(next);
};

const getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  User.find({ username: username })
    .then(([user]) => {
      if (user === undefined)
        return next({ status: 404, msg: "user not found: invalid username." });
      res.send({ user });
    })
    .catch(next);
};

module.exports = {
  getEndpoints,
  getTopics,
  getArticlesByTopic,
  postArticleByTopic,
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  voteForArticleById,
  getComments,
  voteForCommentById,
  deleteCommentById,
  getUsers,
  getUserByUsername
};
