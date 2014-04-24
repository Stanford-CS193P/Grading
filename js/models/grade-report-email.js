GradeReportEmail = Backbone.Model.extend({
    urlRoot: "api/index.php/grade-report-emails",

    setPropertiesBasedOnGradeReport: function(gradeReport) {
        this.set("gradeReportID", gradeReport.id);
        this.set("isSent", gradeReport.get("isSent"));
        this.set("from", gradeReport.get("gradedBySunetid") + "@stanford.edu");
        this.set("to", gradeReport.get("gradedForSunetid") + "@stanford.edu");
        this.set("replyTo", gradeReport.get("gradedForSunetid") + "@stanford.edu");
        this.set("subject", "CS193P Grade Report - Assignment " + gradeReport.get("assignment"));

        var template = _.template($("#grade-report-email-template").html());
        var param = gradeReport.toJSON();
        if (param.comments) {
            param.comments = param.comments.map(function(comment) {
                var data = comment.toJSON();
                data.type = comment.formattedType();
                return data;
            });
        }
        this.set("body", template(param));
    }
});
