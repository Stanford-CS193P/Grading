GradeReport = Parse.Object.extend("GradeReport", {
    // Instance methods

    initialize: function (attrs, options) {
        this.comments = null;
    }

}, {
    // Class methods

    fetchGradeReports: function (equalTo, callback, context) {
        $(".loading-alert").show();

        var gradeReports = new GradeReports();
        var query = new Parse.Query(GradeReport);
        _.each(equalTo, function(filter) {
            query.equalTo(filter.key, filter.value);
        });
        query.ascending("gradedBySunetid");
        gradeReports.query = query;

        var gradeReportComments = new GradeReportComments();
        var gradeReportCommentQuery = new Parse.Query(GradeReportComment);
        gradeReportCommentQuery.matchesQuery("gradeReport", query);
        gradeReportCommentQuery.include("comment");
        gradeReportComments.query = gradeReportCommentQuery;

        var comments = new Comments();
        var commentQuery = new Parse.Query(Comment);
        var assignment = _.findWhere(equalTo, {key: "assignment"});
        if (assignment) {
            commentQuery.equalTo("assignment", assignment);
        }
        commentQuery.query = query;

        gradeReports.fetch().then(_.bind(function () {
            this.populateGradeReportsWithGradeReportComments(gradeReports, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });

        gradeReportComments.fetch().then(_.bind(function() {
            this.populateGradeReportsWithGradeReportComments(gradeReports, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });

        comments.fetch().then(_.bind(function() {
            this.populateGradeReportsWithGradeReportComments(gradeReports, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
    },

    populateGradeReportsWithGradeReportComments: function(gradeReports, gradeReportComments, comments, callback, context) {
        if (gradeReports.length == 0) return;
        if (gradeReportComments.length == 0) return;
        if (comments.length == 0) return;

        console.log("populateGradeReportsWithGradeReportComments");
        gradeReports.each(function(gradeReport) {
            var commentsForGradeReport = gradeReportComments.filter(function(gradeReportComment) {
                return gradeReportComment.get("gradeReport").id === gradeReport.id;
            });

            gradeReport.comments = new GradeReportComments();
            _.each(commentsForGradeReport, function(gradeReportComment) {
                gradeReport.comments.add(gradeReportComment);
            });

            comments.each(function(comment) {
                var isUsed = false;
                for (var i = 0; i < gradeReport.comments.length; i++) {
                    var gradeReportComment = gradeReport.comments.at(i);
                    if (gradeReportComment.get("comment").id === comment.id) {
                        isUsed = true;
                        break;
                    }
                }
                if (isUsed) return;

                var gradeReportComment = new GradeReportComment({
                    comment: comment,
                    gradeReport: gradeReport,
                    value: ""
                });
                gradeReport.comments.add(gradeReportComment);
            });
        });

        $(".loading-alert").hide();
        callback.call(context, gradeReports);
    }

});
