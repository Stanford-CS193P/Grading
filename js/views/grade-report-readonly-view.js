GradeReportReadonlyView = Backbone.View.extend({
    template: _.template($("#grade-report-readonly-view-template").html()),

    initialize: function(args) {
        this.assignment = args.assignment;
        this.gradeReports = args.gradeReports;
    },

    render: function() {
        var gradeReportsForAssignment = this.gradeReports.where({assignment: this.assignment});
        gradeReportsForAssignment = _.map(gradeReportsForAssignment, function(model) {
            var obj = model.toJSON();
            if (obj.comments) {
                obj.comments = obj.comments.map(function(comment) {
                    var commentObj = comment.toJSON();
                    commentObj.type = comment.formattedType();
                    commentObj.text = commentObj.text.replace(/\n/g, '<br />');
                    return commentObj;
                });
            }
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
