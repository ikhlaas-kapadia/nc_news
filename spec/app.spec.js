process.env.NODE_ENV = "test";

const app = require("../app");
const { expect } = require("chai");
const request = require("supertest");
const connection = require("../db/connection");

describe("/api", () => {
  //after: destroy connection to DB
  after(() => {
    return connection.destroy();
  });
  //before each: reseed database
  beforeEach(() => {
    return connection.seed.run();
  });
  describe("/topics", () => {
    it("GET - 200,responds with an array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(res => {
          res.body.topics.forEach(res => {
            expect(res).to.have.all.keys(["slug", "description"]);
          });
          expect(res.body.topics.length).to.equal(3);
        });
    });
    it("GET - 404 responds with route not found when specified invalid route", () => {
      return request(app)
        .get("/api/chickenwings")
        .expect(404)
        .then(res => {
          expect(res.body.msg).to.equal("Invalid Path");
        });
    });
  });
  describe("/users", () => {
    describe("/users:username", () => {
      it("GET - 200, responds with an array of specified username details with a key username", () => {
        return request(app)
          .get("/api/users/butter_bridge")
          .expect(200)
          .then(res => {
            expect(res.body.user).to.have.all.keys([
              "username",
              "avatar_url",
              "name"
            ]);
            expect(res.body.user).to.be.an("object");
          });
      });
      it("GET - 404 Reponds with Invalid username when username does not exist ", () => {
        return request(app)
          .get("/api/users/1")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Invalid Username");
          });
      });
    });
  });
  describe("/articles", () => {
    describe("/:article_id", () => {
      it("GET - 200, responds with an article object", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(res => {
            expect(res.body.article).to.have.all.keys([
              "article_id",
              "title",
              "body",
              "votes",
              "topic",
              "author",
              "created_at",
              "comment_count"
            ]);
          });
      });

      it("GET - 404, responds with Article ID does not exist", () => {
        return request(app)
          .get("/api/articles/999")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Article ID does not exist");
          });
      });
      it("GET - 400, responds with invalid data type", () => {
        return request(app)
          .get("/api/articles/jsjsjs")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Invalid Input");
          });
      });
      it("PATCH - 200, responds with updated article when passed request object with votes", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: 1 })
          .expect(200)
          .then(res => {
            expect(res.body.article).to.have.all.keys([
              "article_id",
              "title",
              "body",
              "votes",
              "topic",
              "author",
              "created_at"
            ]);
          });
      });
      it("PATCH - 404, responds with Article ID does not exist to update", () => {
        return request(app)
          .patch("/api/articles/999")
          .send({ inc_votes: 1 })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Article ID does not exist");
          });
      });
      it("PATCH - 400, responds with Invalid Input when user Id is a string", () => {
        return request(app)
          .patch("/api/articles/dhdhdh")
          .send({ inc_votes: 1 })
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Invalid Input");
          });
      });
      it("PATCH - 400, responds with Invalid request format when request is empty", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({})
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Invalid request format");
          });
      });
      it("PATCH - 400, responds with Invalid Input, when request object is not a number", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "cats" })
          .expect(400)
          .then(res => {
            //ask tutors as directing through same psql error
            expect(res.body.msg).to.equal("Invalid Input");
          });
      });
      it("PATCH - 400, responds with Invalid Input, when request object has extra keys", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "cats", name: "mitch" })
          .expect(400)
          .then(res => {
            //ask tutors as directing through same psql error
            expect(res.body.msg).to.equal("Invalid Input");
          });
      });
      it("POST - 201, responds with posted comment", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({ username: "butter_bridge", body: "test comment" })
          .expect(201)
          .then(res => {
            console.log(res.body.comment.body, "from test file");
            //ask tutors as directing through same psql error
            expect(res.body.comment.body).to.equal("test comment");
          });
      });
      it("POST - 404, responds with Invalid article ID when endpoint has invalid article id", () => {
        return request(app)
          .post("/api/articles/9999/comments")
          .send({ username: "butter_bridge", body: "test comment" })
          .expect(404)
          .then(res => {
            //ask tutors as directing through same psql error
            expect(res.body.msg).to.equal("ID not found");
          });
      });
      it("POST - 400, responds with Invalid input when request object to post in empty", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({})
          .expect(400)
          .then(res => {
            //ask tutors as directing through same psql error
            expect(res.body.msg).to.equal("Invalid Input");
          });
      });
      it("POST - 400, responds with Invalid input when article id is not valid", () => {
        return request(app)
          .post("/api/articles/chutya/comments")
          .send({ username: "butter_bridge", body: "test comment" })
          .expect(400)
          .then(res => {
            //ask tutors as directing through same psql error
            expect(res.body.msg).to.equal("Invalid Input");
          });
      });
    });
  });
});

// describe('/:treasure_id', () => {
//   it('PATCH: 200 Responds with updated item.', () => {
//       return request(app)
//           .patch('/api/treasures/20')
//           .send({ cost_at_auction: "999.00" })
//           .expect(200)
//           .then(res => {
//               expect(res.body.treasure).to.be.an('Array')
//               expect(res.body.treasure[0]).to.eql({
//                   treasure_id: 20,
//                   treasure_name: 'treasure-s',
//                   colour: 'silver',
//                   age: 9,
//                   cost_at_auction: '999.00',
//                   shop_id: 3
//               })
//           });
//   });
