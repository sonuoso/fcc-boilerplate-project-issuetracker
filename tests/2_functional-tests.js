const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let id;
  //#1
  test("Create an issue with every field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/project")
      .send({
        issue_title: "initial_title",
        issue_text: "initial_text",
        created_by: "Sonu",
        assigned_to: "Sonu",
        status_text: "Still not resolved",
      })
      .end(function (err, res) {
        id = res.body._id;
        assert.equal(res.status, 200);
        assert.equal(res.body.created_by, "Sonu");
        done();
      });
  });
  //#2
  test("Create an issue with only required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/project")
      .send({
        issue_title: "initial_title",
        issue_text: "initial_text",
        created_by: "Sonu",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.created_by, "Sonu");
        done();
      });
  });
  //#3
  test("Create an issue with missing required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/project")
      .send({ issue_text: "initial_text", created_by: "Sonu" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  //#4
  test("View issues on a project", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/project")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].project, "project");
        done();
      });
  });
  //#5
  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/project")
      .query({ created_by: "Sonu" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].created_by, "Sonu");
        done();
      });
  });
  //#6
  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/project")
      .query({ issue_title: "initial_title", issue_text: "initial_text" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].issue_title, "initial_title");
        assert.equal(res.body[0].issue_text, "initial_text");
        done();
      });
  });
  //#7
  test("Update one field on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/project")
      .send({ _id: id, issue_title: "changed_title" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, id);
        done();
      });
  });
  //#8
  test("Update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/project")
      .send({ _id: id, issue_title: "title", issue_text: "text" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, id);
        done();
      });
  });
  //#9
  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/project")
      .send({ _id: "" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
  //#10
  test("Update an issue with no fields to update", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/project")
      .send({ _id: id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, id);
        done();
      });
  });
  //#11
  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/project")
      .send({ _id: id + "O", issue_text: "text" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, res.body._id);
        done();
      });
  });
  //#12
  test("Delete an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/project")
      .send({ _id: id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
        done();
      });
  });
  //#13
  test("Delete an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/:project")
      .send({ _id: id + "O" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete");
        done();
      });
  });
  //#14
  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/:project")
      .send({ _id: "" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
