/**
 * GradeReportController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  showGradeReportsForAssignmentAndGrader: function(req, res) {
    var assignment = req.param("assignment");
    var grader = req.param("grader");

    GradeReport.find()
      .where({
        gradedBySunetid: grader,
        assignment: assignment
      })
      .sort("gradedForSunetid")
      .done(function(err, reports) {
        if (err) return res.send(err, 500);

        Comment.find()
          .where({ assignment: assignment })
          .done(function(err, comments) {
            if (err) return res.send(err, 500);

            return res.view({
              grader: grader,
              assignment: assignment,
              reports: reports,
              comments: comments
            });
          });
      });
  },

  generateGradeReportsForAssignmentAndGrader: function(req, res) {
    var assignment = req.param("assignment");
    var grader = req.param("grader");

    if (req.method === "GET") {
      GradeReport.find()
        .where({
          gradedBySunetid: grader,
          assignment: assignment
        })
        .done(function(err, reports) {
          if (err) return res.send(err, 500);

          res.view({ reports: reports });
        });
    } else if (req.method === "POST") {
      var students = req.param("students");
      students = students.split("\n");
      students = _.map(students, function(student) {
        return student.trim();
      });
      students = _.filter(students, function(student) {
        return student !== "";
      });

      var removed = "";
      GradeReport.find()
        .where({
          gradedBySunetid: grader,
          assignment: assignment
        })
        .done(function(err, reports) {
          _.each(reports, function(report) {
            var student = _.find(students, function(student) {
              return report.gradedForSunetid === student });
            if (!student) {
              removed += report.gradedForSunetid + ",";
              report.destroy(function(err) {});
            }
          });
        });

      var numToCreate = students.length;
      var added = "";
      _.each(students, function(student) {
        var data = {
          gradedForSunetid: student,
          gradedBySunetid: grader,
          assignment: assignment
        };
        GradeReport.findOne(data, function(err, report) {
          if (report) {
            numToCreate--;
            if (numToCreate === 0) {
              res.send("UPDATED. Added:" + added + " Removed:" + removed, 200);
            }
            return;
          }

          GradeReport.create(data).done(function(err, reports) {
            numToCreate--;
            added += student + ",";
            if (numToCreate === 0) {
              res.send("UPDATED. Added:" + added + " Removed:" + removed, 200);
            }
          });
        });
      });
    }
  },

  genEmailsForAssignment: function(req, res) {
    var assignment = req.param("assignment");

    GradeReport.find()
      .where({assignment: assignment})
      .sort("gradedBySunetid")
      .done(function(err, reports) {
        if (err) return res.send(err, 500);

        Comment.find()
          .where({ assignment: assignment })
          .sort("createdAt")
          .done(function(err, comments) {
            if (err) return res.send(err, 500);

            var emailReports = [];
            _.each(reports, function(report) {
              var mailOptions = {
                reportID: report.id,
                isEmailSent: report.isEmailSent ? true : false,
                from: "bbunge@stanford.edu",
                to: "livelifeinspired@gmail.com",
                replyTo: report.gradedBySunetid + "@stanford.edu",
                subject: "CS193P - Grade Report - Assignment " + report.assignment,
                text: ""
              };

              var emailText = "";
              emailText += "Assignment: " + report.assignment + "\n";
              emailText += "Graded for: " + report.gradedForSunetid + "\n";
              emailText += "Graded by: " + report.gradedBySunetid + "\n";
              emailText += "Grade: " + report.grade + "\n";
              emailText += "Late Days: " + report.lateDayCount + "\n";

              var requiredTasks = [];
              var evaluation = [];
              var extraCredit = [];
              var otherComments = [];

              _.each(comments, function(comment) {
                var value = _.findWhere(report.comments, {id: comment.id});
                if (!value) return;
                value = value.value;

                if (comment.type === "REQUIRED_TASK") {
                  if (value === "-1") {
                    requiredTasks.push(comment.text);
                  }
                }
                if (comment.type === "EVALUATION") {
                  if (value === "-1") {
                    evaluation.push(comment.text);
                  }
                }
                if (comment.type === "EXTRA_CREDIT") {
                  if (value === "1") {
                    extraCredit.push(comment.text);
                  }
                }
                if (comment.type === "OTHER") {
                  if (value === "1") {
                    otherComments.push(comment.text);
                  }
                }
              });

              if (requiredTasks.length > 0) {
                emailText += "\n\nMissing Required Tasks:\n";
                emailText += "* " + requiredTasks.join("\n* ");
              }
              if (evaluation.length > 0) {
                emailText += "\n\nEvaluation:\n";
                emailText += "* " + evaluation.join("\n* ");
              }
              if (extraCredit.length > 0) {
                emailText += "\n\nExtra Credit:\n";
                emailText += "* " + extraCredit.join("\n* ");
              }
              if (otherComments.length > 0) {
                emailText += "\n\nOther Comments:\n";
                emailText += "* " + otherComments.join("\n* ");
              }

              emailText += "\n\nPlease let us know if you believe there was an " +
                "error with your assignment grade. Thank you! :)\n";

              mailOptions.text = emailText;

              emailReports.push(mailOptions);
            });

            res.view({ emailReports: emailReports });
          });
      });
  },

  sendAsEmail: function(req, res) {
    var reportID = req.param("reportID");
    var mailOptions = {
      from: req.param("from"),
      to: req.param("to"),
      replyTo: req.param("replyTo"),
      subject: req.param("subject"),
      text: req.param("text")
    };

    GradeReport.findOne(reportID).done(function(err, report) {
      if (err) return res.send(err, 500);

      var nodemailer = require("nodemailer");

      var transport = nodemailer.createTransport("SMTP", {
        host: "smtp.stanford.edu",
        secureConnection: true,
        port: 465,
        auth: { user:"bbunge", pass:process.env.EMAIL_PASSWORD }
      });

      transport.sendMail(mailOptions, function(error, response){
        if(error){
          console.log(error);
          res.send(error, 500);
        } else{
          console.log("Message sent: " + response.message);
          report.isEmailSent = true;
          report.save(function(err) {
            if (err) return res.send(err, 500);
            res.json(report);
          });
        }
      });

      transport.close();
    });
  },

  showOverview: function(req, res) {
    var assignment = req.param("assignment");

    GradeReport.find()
      .where({assignment: assignment})
      .sort("gradedBySunetid")
      .sort("gradedForSunetid")
      .done(function(err, reports) {
        if (err) return res.send(err, 500);

        Comment.find()
          .where({ assignment: assignment })
          .sort("createdAt")
          .done(function(err, comments) {
            if (err) return res.send(err, 500);

            var reportsFormatted = [];
            _.each(reports, function(report) {
              var curReportData = {
                gradedBySunetid: report.gradedBySunetid,
                gradedForSunetid: report.gradedForSunetid,
                lateDayCount: report.lateDayCount,
                grade: report.grade
              };

              var requiredTasks = [];
              var evaluation = [];
              var extraCredit = [];
              var otherComments = [];

              _.each(comments, function(comment) {
                var value = _.findWhere(report.comments, {id: comment.id});
                if (!value) return;
                value = value.value;

                if (comment.type === "REQUIRED_TASK") {
                  if (value === "-1") {
                    requiredTasks.push(comment.text);
                  }
                }
                if (comment.type === "EVALUATION") {
                  if (value === "-1") {
                    evaluation.push(comment.text);
                  }
                }
                if (comment.type === "EXTRA_CREDIT") {
                  if (value === "1") {
                    extraCredit.push(comment.text);
                  }
                }
                if (comment.type === "OTHER") {
                  if (value === "1") {
                    otherComments.push(comment.text);
                  }
                }
              });

              curReportData.missingRequiredTasks = "";
              if (requiredTasks.length > 0) {
                curReportData.missingRequiredTasks = "* " + requiredTasks.join("\n* ");
              }

              curReportData.evaluation = "";
              if (evaluation.length > 0) {
                curReportData.evaluation = "* " + evaluation.join("\n* ");
              }

              curReportData.extraCredit = "";
              if (extraCredit.length > 0) {
                curReportData.extraCredit = "* " + extraCredit.join("\n* ");
              }

              curReportData.otherComments = "";
              if (otherComments.length > 0) {
                curReportData.otherComments = "* " + otherComments.join("\n* ");
              }

              reportsFormatted.push(curReportData);
            });

            res.view({ reports: reportsFormatted, assignment: assignment });
          });
      });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradeReportController)
   */
  _config: {}

};
