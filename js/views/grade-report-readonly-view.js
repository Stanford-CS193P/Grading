GradeReportReadonlyView = Parse.View.extend({
    template: _.template($("#grade-report-readonly-view-template").html()),

    initialize: function (args) {
        this.assignment = args.assignment;

        this.gradeReports = new GradeReports();
        GradeReport.fetchGradeReports([{ key: "assignment", value: this.assignment }], function(gradeReports) {
            this.gradeReports = gradeReports;
            this.render();
        }, this);
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
