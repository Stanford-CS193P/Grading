SendEmailItemView = Parse.View.extend({
    tagName: 'tr',
    template: _.template($("#send-email-item-view-template").html()),

    events: {
      "click .send-email": "onClickSendEmail"
    },

    initialize: function() {
        this.email = this.createEmailFromGradeReport(this.model);
        EventDispatcher.on("email:send-if-unsent", this.sendEmailIfUnsent, this);
        this.model.on("change:isSent", this.render, this);
    },

    render: function() {
        this.email.isSent = this.model.get("isSent") || false;
        this.$el.html(this.template(this.email));
        return this;
    },

    onClickSendEmail: function() {
        var isSure = confirm("Are you sure?");
        if (!isSure) return;

        this.sendEmail();
    },

    sendEmail: function() {
        EventDispatcher.trigger("email", { status: "IN_PROGRESS", recipient: this.email.to });

        $.post("api/index.php/sendmail", this.email, _.bind(function(response) {
            if (!response.success) {
                EventDispatcher.trigger("email", { status: "FAIL", recipient: this.email.to });
                return;
            }

            EventDispatcher.trigger("email", { status: "SUCCESS", recipient: this.email.to });
            this.model.save("isSent", 1);
        }, this));
    },

    sendEmailIfUnsent: function() {
        if (this.model.get("isSent")) {
            console.log("Skipping for " + this.model.get("gradedForSunetid") + " because already sent.");
            return;
        }
        this.sendEmail();
    },

    createEmailFromGradeReport: function(gradeReport) {
        var email = {};

        email.gradeReportID = gradeReport.id;
        email.isSent = gradeReport.get("isSent");
        email.from = gradeReport.get("gradedBySunetid") + "@stanford.edu";
        email.replyTo = gradeReport.get("gradedBySunetid") + "@stanford.edu";
        email.to = gradeReport.get("gradedForSunetid") .split(",").map(function(e) { return e + "@stanford.edu"; }).join(",");
        email.subject = "CS193P Grade Report - Assignment " + gradeReport.get("assignment");

        var template = _.template($("#grade-report-email-template").html());
        var param = gradeReport.toJSON();
        if (gradeReport.comments.length) {
            param.comments = gradeReport.comments.map(function(gradeReportComment) {
                var comment = gradeReportComment.get("comment");
                var data = comment.toJSON();
                data.type = comment.formattedType();
                if (data.type === "Required Task") data.type = "Missing Required Tasks";
                if (data.type === "Other") data.type = "Other Comments";
                data.text = data.text || "";
                data.text = data.text.replace(/\n/g, '<br />');
                data.value = gradeReportComment.get("value");
                return data;
            });
        }

        email.body = template(param);

        return email;
    }
});

SendEmailView = Parse.View.extend({
    template: _.template($("#send-email-view-template").html()),

    events: {
      "click .send-all": "onClickSendAllUnsent"
    },

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
        this.$el.html(this.template({assignment: this.assignment}));
        this.$table = this.$(".send-email-table");

        this.gradeReports.each(_.bind(function(gradeReport) {
            var view = new SendEmailItemView({ model: gradeReport });
            this.$table.append(view.render().el);
            return view;
        }, this));

        return this;
    },

    onClickSendAllUnsent: function() {
        var isSure = confirm("Are you sure?");
        if (!isSure) return;

        EventDispatcher.trigger("email:send-if-unsent");
    }
});
