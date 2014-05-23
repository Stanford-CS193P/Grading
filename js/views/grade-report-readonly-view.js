GradeReportReadonlyView = Parse.View.extend({
    template: _.template($("#grade-report-readonly-view-template").html()),

    initialize: function(args) {
        this.assignment = args.assignment;
        this.fetchGradeReports();
    },

    fetchGradeReports: function () {
        this.gradeReports = new GradeReports();

        var query = new Parse.Query(GradeReport);
        query.equalTo("assignment", this.assignment);
        this.gradeReports.query = query;

        this.gradeReports.fetch().then(_.bind(function() {
            var count = this.gradeReports.length;
            if (count === 0) {
                this.render();
            }

            this.gradeReports.each(_.bind(function (gradeReport) {
                gradeReport.fetchComments(function() {
                    count--;
                    if (count === 0) {
                        this.render();
                    }
                }, this);
            }, this));
        }, this), function(error) {
            alert("Error: " + error.code + " " + error.message);
        });
    },

    render: function() {
        var gradeReportsForAssignment = this.gradeReports.map(function(gradeReport) {
            var obj = gradeReport.toJSON();

            obj.comments = gradeReport.comments.map(function(gradeReportComment) {
                var comment = gradeReportComment.get("comment");
                var commentObj = comment.toJSON();
                commentObj.type = comment.formattedType();
                commentObj.text = commentObj.text.replace(/\n/g, '<br />');
                commentObj.value = gradeReportComment.get("value");
                return commentObj;
            });

            return obj;
        });
        gradeReportsForAssignment = _.sortBy(gradeReportsForAssignment, function(report) {
           return report.gradedBySunetid + "||" + report.gradedForSunetid;
        });

        this.$el.html(this.template({
            gradeReports: gradeReportsForAssignment,
            assignment: this.assignment
        }));

        return this;
    }
});
