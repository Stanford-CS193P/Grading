GradeReportEmail = Backbone.Model.extend({
    urlRoot: "api/index.php/grade-report-emails",

    setPropertiesBasedOnGradeReport: function(gradeReport) {
        this.set("gradeReportID", gradeReport.id);
        this.set("isSent", gradeReport.get("isSent"));
        this.set("from", gradeReport.get("gradedBySunetid") + "@stanford.edu");
        this.set("replyTo", gradeReport.get("gradedBySunetid") + "@stanford.edu");
        this.set("to", gradeReport.get("gradedForSunetid") .split(",").map(function(e) { return e + "@stanford.edu"; }).join(","));
        this.set("subject", "CS193P Grade Report - Assignment " + gradeReport.get("assignment"));

        var template = _.template($("#grade-report-email-template").html());
        var param = gradeReport.toJSON();
        if (param.comments) {
            param.comments = param.comments.map(function(comment) {
                var data = comment.toJSON();
                data.type = comment.formattedType();
                if (data.type === "Required Task") data.type = "Missing Required Tasks";
                if (data.type === "Other") data.type = "Other Comments";
                return data;
            });
        }
        this.set("body", template(param));
    },

    send: function() {
        EventDispatcher.trigger("email", { status: "IN_PROGRESS", recipient: this.get("to") });

        $.post("api/index.php/sendmail", this.toJSON(), _.bind(function(response) {
            if (!response.success) {
                EventDispatcher.trigger("email", { status: "FAIL", recipient: this.get("to") });
                return;
            }

            EventDispatcher.trigger("email", { status: "SUCCESS", recipient: this.get("to") });
            this.save("isSent", 1);
        }, this));
    }
});
