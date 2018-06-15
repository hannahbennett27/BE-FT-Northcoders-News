const mongoose = require("mongoose");
mongoose.Promise = Promise;
const { User, Article, Comment, Topic } = require("../models");
const {
  createUserRef,
  createArticleRef,
  formatArticleData,
  formatCommentData
} = require("../utils");

const seedDB = ({ articleData, commentData, topicData, userData }) => {
  return mongoose.connection
    .dropDatabase()
    .then(() => {
      return Promise.all([
        Topic.insertMany(topicData),
        User.insertMany(userData)
      ]);
    })
    .then(([topicDocs, userDocs]) => {
      const userRef = createUserRef(userDocs);
      return Promise.all([
        Article.insertMany(formatArticleData(articleData, userRef)),
        topicDocs,
        userDocs,
        userRef
      ]);
    })
    .then(([articleDocs, topicDocs, userDocs, userRef]) => {
      const articleRef = createArticleRef(articleDocs);
      return Promise.all([
        articleDocs,
        Comment.insertMany(formatCommentData(commentData, userRef, articleRef)),
        topicDocs,
        userDocs
      ]);
    });
};

module.exports = seedDB;
