SendEmailItemView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#send-email-item-view-template").html()),

    events: {
      "click .send-email": "onClickSendEmail"
    },

    initialize: function() {
        this.listenTo(this.model, "change:isSent", this.render);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    onClickSendEmail: function() {
        var isSure = confirm("Are you sure?");
        if (!isSure) return;
        this.model.send();
    }
});

SendEmailView = Backbone.View.extend({
    template: _.template($("#send-email-view-template").html()),

    events: {
      "click .send-all": "onClickSendAllUnsent"
    },

    initialize: function(args) {
        this.assignment = args.assignment;
        this.gradeReports = args.gradeReports;
        this.grader = args.grader;
    },

    render: function() {
        this.$el.html(this.template({assignment: this.assignment}));
        this.$table = this.$(".send-email-table");

        var gradeReportsForAssignment = this.gradeReports.where({assignment: this.assignment});
        this.emailModels = _.map(gradeReportsForAssignment, function(model) {
            var emailModel = new GradeReportEmail();
            emailModel.setPropertiesBasedOnGradeReport(model);
            var view = new SendEmailItemView({model: emailModel});
            this.$table.append(view.render().el);
            return emailModel;
        }, this);

        return this;
    },

    onClickSendAllUnsent: function() {
        var isSure = confirm("Are you sure?");
        if (!isSure) return;

        _.each(this.emailModels, function(emailModel) {
            if (emailModel.get("isSent") === 1 ||
                    emailModel.get("isSent") === "1") {
                console.log("Skipping for " + emailModel.get("to") + " because already sent.");
                return;
            }

            console.log("Sending for " + emailModel.get("to") + " because not already sent.");
            // TODO: do we need to queue these up?
            emailModel.send();
        }, this);
    }
});
