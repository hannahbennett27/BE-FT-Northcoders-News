process.env.NODE_ENV = "test";
const app = require("../app");
const { expect } = require("chai");
const request = require("supertest")(app);
const rawData = require("../seed/testData");
const seedDB = require("../seed/seed");
const mongoose = require("mongoose");

describe("/northcoders-news", () => {
  let articleDocs;
  let commentDocs;
  let topicDocs;
  let userDocs;
  beforeEach(() => {
    return seedDB(rawData).then(docs => {
      [articleDocs, commentDocs, topicDocs, userDocs] = docs;
    });
  });
  describe("/api", () => {
    describe("/", () => {
      it("GET responds with status 200 and an object containing available endpoints", () => {
        return request
          .get("/api")
          .expect(200)
          .then(res => {
            expect(res.body).to.have.property("Northcoders News");
          });
      });
    });
    describe("/topics", () => {
      it("GET responds with status 200 and an object containing all the topics", () => {
        return request
          .get("/api/topics")
          .expect(200)
          .then(res => {
            expect(res.body.topics).to.have.lengthOf(topicDocs.length);
            expect(res.body.topics.map(topic => topic.slug)).to.eql(
              topicDocs.map(topic => topic.slug)
            );
          });
      });
      // it("GET responds with status 502 and an error message when the server fails to connect to the database", () => {
      //   const DB_URL = "mongodb://localhost:27017/database_error_test";
      //   return request
      //     .get("/api/topics")
      //     .expect(502)
      //     .then(res => {
      //       expect(res.body.msg).to.equal("INTERNAL ERROR");
      //     });
      // });
    });
    describe("/topics/:topic_name/articles", () => {
      it("GET responds with status 200 and an object containing all the articles for a certain topic", () => {
        return request
          .get(`/api/topics/${topicDocs[0].slug}/articles`)
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.have.lengthOf(
              articleDocs.filter(
                article => article.belongs_to === topicDocs[0].slug
              ).length
            );
          });
      });
      it("GET responds with status 200 and the articles contain all the required key values", () => {
        const requiredKeys = Object.keys(articleDocs[0]._doc);
        requiredKeys.push("comments");
        return request
          .get(`/api/topics/${topicDocs[0].slug}/articles`)
          .expect(200)
          .then(res => {
            expect(res.body.articles[0]).to.have.all.keys(requiredKeys);
          });
      });
      it("GET responods with status 200 and created_by key value listed as 'username', rather than mongo _id", () => {
        return request
          .get(`/api/topics/${topicDocs[0].slug}/articles`)
          .expect(200)
          .then(res => {
            expect(res.body.articles[0].created_by).to.equal(
              userDocs[0].username
            );
          });
      });
      it("GET responds with status 404 and an error message when passed a topic name not in the database", () => {
        return request
          .get("/api/topics/invalid/articles")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "articles not found: invalid topic name."
            );
          });
      });
      it("POST responds with status 201 and returns the article object saved to the database", () => {
        return request
          .post(`/api/topics/${topicDocs[0].slug}/articles`)
          .send({
            title: "new article",
            body: "This is my new article content"
          })
          .expect(201)
          .then(res => {
            expect(res.body.article).to.have.all.keys(
              Object.keys(articleDocs[0]._doc)
            );
          });
      });
      it("POST increments the database article count by one", () => {
        return request
          .post(`/api/topics/${topicDocs[0].slug}/articles`)
          .send({
            title: "new article",
            body: "This is my new article content"
          })
          .then(res => {
            return request.get(`/api/topics/${topicDocs[0].slug}/articles`);
          })
          .then(res => {
            expect(res.body.articles).to.have.lengthOf(
              articleDocs.filter(
                article => article.belongs_to === topicDocs[0].slug
              ).length + 1
            );
          });
      });
      it("POST responds with status 400 and an error message when passed an invalid body input", () => {
        return request
          .post(`/api/topics/${topicDocs[0].slug}/articles`)
          .send({})
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "articles validation failed: title: Path `title` is required."
            );
          });
      });
      it("POST responds with status 404 and an error message when passed a topic name not in the database", () => {
        return request
          .post("/api/topics/invalid/articles")
          .send({
            title: "new article",
            body: "This is my new article content"
          })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "topic not found: invalid topic name."
            );
          });
      });
    });
    describe("/articles", () => {
      it("GET responds with status 200 and an object containing all the articles", () => {
        return request
          .get("/api/articles")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.have.lengthOf(articleDocs.length);
          });
      });
      it("GET responds with status 200 and the articles contain all the required key values", () => {
        const requiredKeys = Object.keys(articleDocs[0]._doc);
        requiredKeys.push("comments");
        return request
          .get(`/api/articles`)
          .expect(200)
          .then(res => {
            expect(res.body.articles[0]).to.have.all.keys(requiredKeys);
          });
      });
      it("GET responods with status 200 and created_by key value listed as 'username', rather than mongo _id", () => {
        return request
          .get(`/api/articles`)
          .expect(200)
          .then(res => {
            expect(res.body.articles[0].created_by).to.equal(
              userDocs[0].username
            );
          });
      });
    });
    describe("/articles/:article:id", () => {
      it("GET responds with status 200 and an object containing an individual article", () => {
        return request
          .get(`/api/articles/${articleDocs[0]._id}`)
          .expect(200)
          .then(res => {
            expect(res.body.article.title).to.equal(articleDocs[0].title);
          });
      });
      it("GET responds with status 404 and an error message when passed a valid id not in the database", () => {
        return request
          .get(`/api/articles/${userDocs[0]._id}`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "article not found: invalid article id."
            );
          });
      });
      it("GET responds with status 400 and an error message when passed an invalid id", () => {
        return request
          .get("/api/articles/invalid")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "articles not found: invalid ObjectId."
            );
          });
      });
      it("PUT responds with status 202 and increments the votes of an article by one when passed query ?vote=up", () => {
        return request
          .put(`/api/articles/${articleDocs[0]._id}?vote=up`)
          .expect(202)
          .then(res => {
            expect(res.body.article.votes).to.equal(articleDocs[0].votes + 1);
          });
      });
      it("PUT responds with status 202 and decrements the votes of an article by one when passed query ?vote=down", () => {
        return request
          .put(`/api/articles/${articleDocs[0]._id}?vote=down`)
          .expect(202)
          .then(res => {
            expect(res.body.article.votes).to.equal(articleDocs[0].votes - 1);
          });
      });
      it("PUT responds with status 400 and an error message when passed an invalid vote option", () => {
        return request
          .put(`/api/articles/${articleDocs[0]._id}?vote=invalid`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "Cannot increment with non-numeric argument: {votes: null}"
            );
          });
      });
      it("PUT responds with status 404 and an error message when passed a valid id not in the database", () => {
        return request
          .put(`/api/articles/${topicDocs[0]._id}?vote=up`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "article not found: invalid article id."
            );
          });
      });
      it("PUT responds with status 400 and an error message when passed an invalid id", () => {
        return request
          .put("/api/articles/invalid?vote=up")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "articles not found: invalid ObjectId."
            );
          });
      });
    });
    describe("/articles/:article_id/comments", () => {
      it("GET responds with status 200 and an object containing all the comments for an individual article", () => {
        return request
          .get(`/api/articles/${articleDocs[0]._id}/comments`)
          .expect(200)
          .then(res => {
            expect(res.body.comments).to.have.lengthOf(
              commentDocs.filter(
                comment => comment.belongs_to === articleDocs[0]._id
              ).length
            );
          });
      });
      it("GET responods with status 200 and created_by key value listed as 'username', rather than mongo _id", () => {
        return request
          .get(`/api/articles/${articleDocs[0]._id}/comments`)
          .expect(200)
          .then(res => {
            expect(res.body.comments[0].created_by).to.equal(
              userDocs[1].username
            );
          });
      });
      it("GET responds with status 404 and an error message when passed a valid id not in the database", () => {
        return request
          .get(`/api/articles/${userDocs[0]._id}/comments`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "comments not found: invalid article id."
            );
          });
      });
      it("GET responds with status 400 and an error message with passed an invalid id", () => {
        return request
          .get("/api/articles/invalid/comments")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "comments not found: invalid ObjectId."
            );
          });
      });
      it("POST responds with status 201 and returns the comment object saved to the database", () => {
        return request
          .post(`/api/articles/${articleDocs[0]._id}/comments`)
          .send({ comment: "This is my new comment" })
          .expect(201)
          .then(res => {
            expect(res.body.comment).to.have.all.keys(
              Object.keys(commentDocs[0]._doc)
            );
          });
      });
      it("POST increments the database comment count by one", () => {
        return request
          .post(`/api/articles/${articleDocs[0]._id}/comments`)
          .send({ comment: "This is my new comment" })
          .then(() => {
            return request.get(`/api/articles/${articleDocs[0]._id}/comments`);
          })
          .then(res => {
            expect(res.body.comments).to.have.lengthOf(
              commentDocs.filter(
                comment => comment.belongs_to === articleDocs[0]._id
              ).length + 1
            );
          });
      });
      it("POST responds with status 400 and an error message when passed an invalid body input", () => {
        return request
          .post(`/api/articles/${articleDocs[0]._id}/comments`)
          .send({})
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "comments validation failed: body: Path `body` is required."
            );
          });
      });
      it("POST responds with status 404 and an error message when passed a valid id not in the database", () => {
        return request
          .post(`/api/articles/${topicDocs[0]._id}/comments`)
          .send({ comment: "This is my new comment" })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "article not found: invalid article id."
            );
          });
      });
      it("POST responds with status 400 and an error message when passed an invalid id", () => {
        return request
          .post("/api/articles/invalid/comments")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "articles not found: invalid ObjectId."
            );
          });
      });
    });
    describe("/comments", () => {
      it("GET responds with status 200 and an object containing all the comments", () => {
        return request
          .get("/api/comments")
          .expect(200)
          .then(res => {
            expect(res.body.comments).to.have.lengthOf(commentDocs.length);
            expect(res.body.comments.map(comment => comment.body)).to.eql(
              commentDocs.map(comment => comment.body)
            );
          });
      });
    });
    describe("/comments/:comment_id", () => {
      it("PUT responds with status 202 and increments the votes of a comment by one when passed query ? vote=up", () => {
        return request
          .put(`/api/comments/${commentDocs[0]._id}?vote=up`)
          .expect(202)
          .then(res => {
            expect(res.body.comment.votes).to.equal(commentDocs[0].votes + 1);
          });
      });
      it("PUT responds with status 202 and decrements the votes of a comment by one when passed query ? vote=down", () => {
        return request
          .put(`/api/comments/${commentDocs[0]._id}?vote=down`)
          .expect(202)
          .then(res => {
            expect(res.body.comment.votes).to.equal(commentDocs[0].votes - 1);
          });
      });
      it("PUT responds with status 400 and an error message when passed an invalid vote option", () => {
        return request
          .put(`/api/comments/${commentDocs[0]._id}?vote=invalid`)
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "Cannot increment with non-numeric argument: {votes: null}"
            );
          });
      });
      it("PUT responds with status 404 and an error message when passed a valid id not in the database", () => {
        return request
          .put(`/api/comments/${topicDocs[0]._id}?vote=up`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "comment not found: invalid comment id."
            );
          });
      });
      it("PUT responds with status 400 and an error message when passed an invalid id", () => {
        return request
          .put("/api/articles/invalid?vote=up")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "articles not found: invalid ObjectId."
            );
          });
      });
      it("DELETE responds with status 202 and removes comment from database", () => {
        //=> TO DO: only deletes IF comment belongs to Northcoders News user
        return request
          .delete(`/api/comments/${commentDocs[0]._id}`)
          .expect(202)
          .then(() => {
            return request.get(`/api/articles/${articleDocs[0]._id}/comments`);
          })
          .then(res => {
            expect(res.body.comments.length).to.equal(
              commentDocs.filter(
                comment => comment.belongs_to === articleDocs[0]._id
              ).length - 1
            );
          });
      });
      it("DELETE responds with status 404 and an error message when passed a valid id not in the database", () => {
        return request
          .delete(`/api/comments/${topicDocs[0]._id}`)
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "comment not found: invalid comment id."
            );
          });
      });
      it("DELETE responds with status 400 and an error message when passed an invalid id", () => {
        return request
          .delete("/api/comments/invalid")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal(
              "comments not found: invalid ObjectId."
            );
          });
      });
    });
    describe("/users", () => {
      it("GET responds with status 200 and an object containing all the users", () => {
        return request
          .get("/api/users")
          .expect(200)
          .then(res => {
            expect(res.body.users.map(user => user.username)).to.eql(
              userDocs.map(user => user.username)
            );
          });
      });
    });
    describe("/users/:username", () => {
      it("GET responds with status 200 and an object containing the profile data for the specified user", () => {
        return request
          .get(`/api/users/${userDocs[0].username}`)
          .expect(200)
          .then(res => {
            expect([
              res.body.user.username,
              res.body.user.name,
              res.body.user.avatar_url
            ]).to.eql([
              userDocs[0].username,
              userDocs[0].name,
              userDocs[0].avatar_url
            ]);
          });
      });
      it("GET responds with status 404 and an error message when passed a username not in the database", () => {
        return request
          .get("/api/users/invalid")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("user not found: invalid username.");
          });
      });
    });
  });
  describe("/*", () => {
    it("all requests respond with status 404 and an error message when passed a non-routed path", () => {
      return request
        .get("/invalidpathtest")
        .expect(404)
        .then(res => {
          expect(res.body.msg).to.equal("page not found.");
        });
    });
  });
  after(() => {
    mongoose.disconnect();
  });
});
