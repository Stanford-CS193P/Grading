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
        query.ascending("gradedBySunetid,gradedForSunetid");
        query.limit(1000);
        gradeReports.query = query;

        var gradeReportComments = new GradeReportComments();
        var gradeReportCommentQuery = new Parse.Query(GradeReportComment);
        gradeReportCommentQuery.matchesQuery("gradeReport", query);
        gradeReportCommentQuery.include("comment");

        var comments = new Comments();
        var commentQuery = new Parse.Query(Comment);
        var assignment = _.findWhere(equalTo, {key: "assignment"});
        if (assignment) {
            commentQuery.equalTo("assignment", assignment.value);
        }
        commentQuery.equalTo("isPublic", true);
        commentQuery.limit(1000);
        comments.query = commentQuery;

        var isGradeReportFetchComplete = false;
        var isCommentFetchComplete = false;
        var isGradeReportCommentFetchComplete = false;

        gradeReports.fetch().then(_.bind(function () {
            isGradeReportFetchComplete = true;
            if (isGradeReportFetchComplete && isCommentFetchComplete && isGradeReportCommentFetchComplete)
                this.populateGradeReportsWithGradeReportComments(gradeReports, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });

        var LIMIT = 1000; // 1000 is the max
        gradeReportCommentQuery.limit(LIMIT);
        var skip = 0;
        var fetchGradeReportComments = _.bind(function() {
            gradeReportCommentQuery.find().then(_.bind(function(response) {
                console.log(response.length);
                if (response.length === 0) {
                    isGradeReportCommentFetchComplete = true;
                    if (isGradeReportFetchComplete && isCommentFetchComplete && isGradeReportCommentFetchComplete)
                        this.populateGradeReportsWithGradeReportComments(gradeReports, gradeReportComments, comments, callback, context);
                    return;
                }

                gradeReportComments.add(response);
                skip += LIMIT;
                gradeReportCommentQuery.skip(skip);
                fetchGradeReportComments();
            }, this), function (error) {
                alert("Error: " + error.code + " " + error.message);
            });

        }, this);
        fetchGradeReportComments();

        comments.fetch().then(_.bind(function() {
            isCommentFetchComplete = true;
            if (isGradeReportFetchComplete && isCommentFetchComplete && isGradeReportCommentFetchComplete)
                this.populateGradeReportsWithGradeReportComments(gradeReports, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
    },

    populateGradeReportsWithGradeReportComments: function(gradeReports, gradeReportComments, comments, callback, context) {
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

                gradeReport.comments.add(new GradeReportComment({
                    comment: comment,
                    gradeReport: gradeReport,
                    value: ""
                }));
            });
        });

        $(".loading-alert").hide();
        callback.call(context, gradeReports);
    },

    fetchOtherComments: function (gradeReport, callback, context) {
        var gradeReportComments = new GradeReportComments();
        var gradeReportCommentQuery = new Parse.Query(GradeReportComment);
        gradeReportCommentQuery.equalTo("gradeReport", gradeReport);
        gradeReportCommentQuery.include("comment");
        gradeReportComments.query = gradeReportCommentQuery;

        var comments = new Comments();
        var commentQuery = new Parse.Query(Comment);
        commentQuery.equalTo("assignment", gradeReport.get("assignment"));
        commentQuery.equalTo("type", "OTHER");
        commentQuery.equalTo("isPublic", true);
        comments.query = commentQuery;

        var isCommentFetchComplete = false;
        var isGradeReportCommentFetchComplete = false;

        gradeReportComments.fetch().then(_.bind(function() {
            isGradeReportCommentFetchComplete = true;
            if (isCommentFetchComplete && isGradeReportCommentFetchComplete)
                this.refreshOtherComments(gradeReport, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });

        comments.fetch().then(_.bind(function() {
            isCommentFetchComplete = true;
            if (isCommentFetchComplete && isGradeReportCommentFetchComplete)
                this.refreshOtherComments(gradeReport, gradeReportComments, comments, callback, context);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
    },

    refreshOtherComments: function(gradeReport, gradeReportComments, comments, callback, context) {
        console.log("refreshOtherComments");

        var commentsToKeep = gradeReport.comments.filter(function(gradeReportComment) {
            return gradeReportComment.get("comment").get("type") !== "OTHER";
        });
        gradeReport.comments = new GradeReportComments();
        _.each(commentsToKeep, function(gradeReportComment) {
            gradeReport.comments.add(gradeReportComment);
        });

        gradeReportComments.each(function(gradeReportComment) {
            if (gradeReportComment.get("comment").get("type") === "OTHER")
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

        callback.call(context);
    }

});
