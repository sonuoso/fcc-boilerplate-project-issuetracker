"use strict";

require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = function (app) {
  const issueSchema = new mongoose.Schema({
    project: {
      required: true,
      type: String,
    },
    issue_title: {
      required: true,
      type: String,
    },
    issue_text: {
      required: true,
      type: String,
    },
    created_on: {
      required: true,
      type: Date,
    },
    updated_on: {
      required: true,
      type: Date,
    },
    created_by: {
      required: true,
      type: String,
    },
    assigned_to: {
      type: String,
    },
    open: {
      type: Boolean,
      default: true,
    },
    status_text: {
      type: String,
    },
  });

  //Creating Issue collection
  let Issue = mongoose.model("Issue", issueSchema);

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      let issueQuery = { project: project };

      //Check if string query parameters are available
      if (req.query.issue_title) {
        issueQuery.issue_title = req.query.issue_title;
      }
      if (req.query.issue_text) {
        issueQuery.issue_text = req.query.issue_text;
      }
      if (req.query.created_on) {
        issueQuery.created_on = req.query.created_on;
      }
      if (req.query.updated_on) {
        issueQuery.updated_on = req.query.updated_on;
      }
      if (req.query.created_by) {
        issueQuery.created_by = req.query.created_by;
      }
      if (req.query.assigned_to) {
        issueQuery.assigned_to = req.query.assigned_to;
      }
      if (req.query.open) {
        issueQuery.open = req.query.open;
      }
      if (req.query.status_text) {
        issueQuery.status_text = req.query.status_text;
      }

      Issue.find(issueQuery).then(function (data) {
        for (let i = 0; i < data.length; i++) {
          data[i].updated_on = new Date();
        }
        res.send(data);
      });
    })

    .post(function (req, res) {
      let project = req.params.project;

      //Check if required fields contain data
      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
        let issue = new Issue({
          project: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || "",
          open: true,
          status_text: req.body.status_text || "",
        });
        issue.save().then((data) => res.send(data));
      } else {
        res.send({ error: "required field(s) missing" });
      }
    })

    .put(function (req, res) {
      let issueId;
      let updateQuery = {};

      if (req.body.open) {
        updateQuery.open = req.body.open;
      }
      if (req.body.issue_title) {
        updateQuery.issue_title = req.body.issue_title;
      }
      if (req.body.issue_text) {
        updateQuery.issue_text = req.body.issue_text;
      }
      if (req.body.created_by) {
        updateQuery.created_by = req.body.created_by;
      }

      updateQuery.updated_on = new Date();

      if (req.body.assigned_to) {
        updateQuery.assigned_to = req.body.assigned_to;
      }
      if (req.body.status_text) {
        updateQuery.status_text = req.body.status_text;
      }

      //Check if updateQuery contains data along with updated_on value
      let nullInc = 0;
      for (let i in updateQuery) {
        if (updateQuery[i]) {
          nullInc++;
        }
      }

      if (req.body._id) {
        issueId = req.body._id;

        //nullInc value > 1, then fields are available to update
        if (nullInc > 1) {
          Issue.findByIdAndUpdate(issueId, updateQuery, { new: true })
            .then((data) =>
              res.send({ result: "successfully updated", _id: data._id })
            )
            .catch((err) =>
              res.send({ error: "could not update", _id: issueId })
            );
        } else {
          res.send({ error: "no update field(s) sent", _id: issueId });
        }
      } else {
        res.send({ error: "missing _id" });
      }
    })

    .delete(function (req, res) {
      let issueId = req.body._id;

      if (issueId) {
        Issue.findByIdAndDelete(issueId)
          .then((data) =>
            res.send({ result: "successfully deleted", _id: data._id })
          )
          .catch((err) =>
            res.send({ error: "could not delete", _id: issueId })
          );
      } else {
        res.send({ error: "missing _id" });
      }
    });
};
