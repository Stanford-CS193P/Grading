SendEmailItemView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#send-email-item-view-template").html()),

    events: {
      "click .send-email": "onClickSendEmail"
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    onClickSendEmail: function() {
        var isSure = confirm("Are you sure?");
        if (!isSure) return;

        $.get("api/index.php/sendmail", this.model.toJSON(), _.bind(function() {
            this.model.save("isSent", 1);
            this.render();
        }, this));
    }
});

SendEmailView = Backbone.View.extend({
    template: _.template($("#send-email-view-template").html()),

    initialize: function(args) {
        this.assignment = args.assignment;
        this.gradeReports = args.gradeReports;
        this.grader = args.grader;
    },

    render: function() {
        this.$el.html(this.template({assignment: this.assignment}));
        this.$table = this.$(".send-email-table");

        var gradeReportsForAssignment = this.gradeReports.where({assignment: this.assignment});
        _.each(gradeReportsForAssignment, function(model) {
            var emailModel = new GradeReportEmail();
            emailModel.setPropertiesBasedOnGradeReport(model);
            var view = new SendEmailItemView({model: emailModel});
            this.$table.append(view.render().el);
        }, this);

        return this;
    }
});