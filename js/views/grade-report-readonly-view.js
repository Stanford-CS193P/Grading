GradeReportReadonlyView = Parse.View.extend({
    template: _.template($("#grade-report-readonly-view-template").html()),

    initialize: function (args) {
        this.assignment = args.assignment;
        this.fetchGradeReports();
    },

    fetchGradeReports: function () {
        $(".loading-alert").show();


//        var query = new Parse.Query(GradeReportComment);
//        query.equalTo("assignment", this.assignment);
//        query.ascending("gradedBySunetid");
//        query.include(["gradeReport", "comment"]);
//        gradeReportComments.query = query;

        this.gradeReports = new GradeReports();
        var query = new Parse.Query(GradeReport);
        query.equalTo("assignment", this.assignment);
        query.ascending("gradedBySunetid");
        this.gradeReports.query = query;

        var gradeReportComments = new GradeReportComments();
        var commentQuery = new Parse.Query(GradeReportComment);
        commentQuery.matchesQuery("gradeReport", query);
        commentQuery.include("comment");
        gradeReportComments.query = commentQuery;

        this.gradeReports.fetch().then(_.bind(function () {
            console.log(this.gradeReports);
            this.populateGradeReportsWithGradeReportComments(this.gradeReports, gradeReportComments);




//            var count = this.gradeReports.length;
//            if (count === 0) {
//                this.render();
//                $(".loading-alert").hide();
//            }
//
//            this.gradeReports.each(_.bind(function (gradeReport) {
//                gradeReport.fetchComments(function() {
//                    count--;
//                    if (count === 0) {
//                        this.render();
//                        $(".loading-alert").hide();
//                    }
//                }, this);
//            }, this));
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });


        gradeReportComments.fetch().then(_.bind(function() {
                console.log(gradeReportComments);
                this.populateGradeReportsWithGradeReportComments(this.gradeReports, gradeReportComments);
            }, this));
    },

    populateGradeReportsWithGradeReportComments: function(gradeReports, gradeReportComments) {
        if (gradeReports.length == 0) return;
        if (gradeReportComments.length == 0) return;

        console.log("populateGradeReportsWithGradeReportComments");
        gradeReports.each(function(gradeReport) {
            var commentsForGradeReport = gradeReportComments.filter(function(gradeReportComment) {
                return gradeReportComments.get("gradeReport").id === gradeReport.id;
            });
            if (commentsForGradeReport == 0) return;

            gradeReport.comments = new GradeReportComments();

            commentsForGradeReport = commentsForGradeReport[0];
        });

//        gradeReportComments.each(_.bind(function (gradeReportComment) {
//            console.log(gradeReportComment.attributes, gradeReportComment.get("gradeReport"));
//
//            var gradeReport = gradeReportComment.get("gradeReport");
//            this.gradeReports.add(gradeReport)
//
//            gradeReport.comments = new GradeReportComments();
//            gradeReport.comments.add(gradeReportComment);
//        }, this));
//
//
//        this.render();
//        $(".loading-alert").hide();
    },

    render: function () {
        var gradeReportsForAssignment = this.gradeReports.map(function (gradeReport) {
            var obj = gradeReport.toJSON();

            obj.comments = gradeReport.comments.map(function (gradeReportComment) {
                var comment = gradeReportComment.get("comment");
                var commentObj = comment.toJSON();
                commentObj.type = comment.formattedType();
                commentObj.text = commentObj.text.replace(/\n/g, '<br />');
                commentObj.value = gradeReportComment.get("value");
                return commentObj;
            });

            return obj;
        });
        gradeReportsForAssignment = _.sortBy(gradeReportsForAssignment, function (report) {
            return report.gradedBySunetid + "||" + report.gradedForSunetid;
        });

        this.$el.html(this.template({
            gradeReports: gradeReportsForAssignment,
            assignment: this.assignment
        }));

        return this;
    }
});
