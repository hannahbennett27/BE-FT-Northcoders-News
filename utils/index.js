const { Comment } = require("../models");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const endpointsJSON = require("./endpoints");

const createUserRef = userDocs => {
  return userDocs.reduce((acc, userObj) => {
    acc[userObj.username] = userObj._id;
    return acc;
  }, {});
};

const createArticleRef = articleDocs => {
  return articleDocs.reduce((acc, articleObj) => {
    acc[articleObj.title] = articleObj._id;
    return acc;
  }, {});
};

const formatArticleData = (articleData, userRef) => {
  return articleData.map(articleDatum => {
    return {
      ...articleDatum,
      belongs_to: articleDatum.topic,
      created_by: userRef[articleDatum.created_by]
    };
  });
};

const formatCommentData = (commentData, userRef, articleRef) => {
  return commentData.map(commentDatum => {
    return {
      ...commentDatum,
      belongs_to: articleRef[commentDatum.belongs_to],
      created_by: userRef[commentDatum.created_by]
    };
  });
};

const formatPostArticle = (req, userId) => {
  const { topic_name } = req.params;
  const { title, body } = req.body;
  return {
    title,
    body,
    belongs_to: topic_name,
    created_by: userId
  };
};

formatArticlesForClient = articleDocs => {
  return articleDocs.map(articleObj => {
    return Promise.all([
      Comment.find({
        belongs_to: new ObjectId(articleObj._id)
      }).count(),
      articleObj
    ]).then(([commentCount, articleObj]) => {
      return {
        ...articleObj,
        created_by: articleObj.created_by.username,
        comments: commentCount
      };
    });
  });
};

const formatCommentsForClient = commentDocs => {
  return commentDocs.map(commentObj => {
    return {
      ...commentObj,
      created_by: commentObj.created_by.username
    };
  });
};

const formatPostComment = (req, userId) => {
  const { article_id } = req.params;
  const { comment } = req.body;
  return {
    body: comment,
    belongs_to: article_id,
    created_by: userId
  };
};

module.exports = {
  endpointsJSON,
  createUserRef,
  createArticleRef,
  formatArticleData,
  formatCommentData,
  formatPostArticle,
  formatArticlesForClient,
  formatCommentsForClient,
  formatPostComment
};
