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

            var requiredTasks = _.filter(comments, function(comment) {
              return comment.type === "REQUIRED_TASK";
            });
            var evaluation = _.filter(comments, function(comment) {
              return comment.type === "EVALUATION";
            });
            var extraCredit = _.filter(comments, function(comment) {
              return comment.type === "EXTRA_CREDIT";
            });
            var other = _.filter(comments, function(comment) {
              return comment.type === "OTHER";
            });

            return res.view({
              grader: grader,
              assignment: assignment,
              reports: reports,
              // Comments...
              requiredTasks: requiredTasks,
              evaluation: evaluation,
              extraCredit: extraCredit,
              other: other
            });
          });
      });
  },

  findByAssignmentAndGradedForSunetid: function(req, res) {
    var assignment = req.param("assignment");
    var gradedForSunetid = req.param("gradedForSunetid");
    GradeReport.find()
      .where({ assignment: assignment, gradedForSunetid: gradedForSunetid })
      .done(function(err, report) {
        if (err) return res.send(err, 500);
        if (report.length == 1) return res.json(report[0])
        return res.json(null);
      });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GradeReportController)
   */
  _config: {}

};
