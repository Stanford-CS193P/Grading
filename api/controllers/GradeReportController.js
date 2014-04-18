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

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradeReportController)
   */
  _config: {}

};
