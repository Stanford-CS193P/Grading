EventDispatcher = _.extend({}, Backbone.Events);


Router = Backbone.Router.extend({
    routes: {
        "grade/:assignment": "gradeAssignment",
        "grade/:assignment/:gradedForSunetid": "gradeAssignmentForSunetid",
        "overview/:assignment": "overviewAssignment",
        "late-days/:assignment": "lateDaysAssignment",
        "send-emails/:assignment": "sendEmailsAssignment"
    }
});
var router = new Router();

AppView = Backbone.View.extend({
    el: "#app",

    appTemplate: _.template($('#app-template').html()),
    gradeReportsTemplate: _.template($('#grade-reports-view-template').html()),

    events: {
        'click .add-grade-report': 'onAddGradeReport'
    },

    initialize: function () {
        this.setUpRoutes();
        this.grader = window.USER;
        this.renderContent = null;
        this.render();

        this.gradeReports = new GradeReports();
        this.gradeReports.fetch({reset: true, success: _.bind(function() {
            this.$(".loading-alert").remove();
            if (this.renderContent) this.renderContent();

            this.gradeReports.each(function(report) {
                var comments = report.get("comments");
                if (!comments) return;
                this.listenTo(comments, "request", this.onRequest);
                this.listenTo(comments, "sync", this.onSync);
                this.listenTo(comments, "error", this.onError);
                this.listenTo(comments, "change", this.onCommentChange);
            }, this);
        }, this)});

        this.listenTo(this.gradeReports, "request", this.onRequest);
        this.listenTo(this.gradeReports, "sync", this.onSync);
        this.listenTo(this.gradeReports, "error", this.onError);

        EventDispatcher.on("email", function(result) {
            if (!this.$emailAlerts) return;

            var alert = $("<div/>").addClass("alert");
            if (result.success) {
                alert.addClass("alert-success").text("Email to " + result.recipient + " successfully sent.");
            } else {
                alert.addClass("alert-danger").text("Email to " + result.recipient + " failed to send.");
            }

            this.$emailAlerts.append(alert);
            _.delay(function(alert) { alert.fadeOut(300, function() { alert.remove(); }); }, 2000, alert);
        }, this);
    },

    setUpRoutes: function() {
        router.on("route:gradeAssignment", function(assignment) {
            this.assignment = parseInt(assignment, 10);
            this.curGradedForSunetid = null;
            this.renderContent = this.renderGradeReports;
            this.renderContent();
        }, this);

        router.on("route:gradeAssignmentForSunetid", function(assignment, gradedForSunetid) {
            this.assignment = parseInt(assignment, 10);
            this.curGradedForSunetid = gradedForSunetid;
            this.renderContent = this.renderGradeReports;
            this.renderContent();
        }, this);

        router.on("route:overviewAssignment", function(assignment) {
            this.assignment = parseInt(assignment, 10);
            this.renderContent = this.renderOverview;
            this.renderContent();
        }, this);

        router.on("route:lateDaysAssignment", function(assignment) {
            this.assignment = parseInt(assignment, 10);
            this.renderContent = this.renderLateDays;
            this.renderContent();
        }, this);

        router.on("route:sendEmailsAssignment", function(assignment) {
            this.assignment = parseInt(assignment, 10);
            this.renderContent = this.renderSendEmails;
            this.renderContent();
        }, this);
    },

    render: function() {
        this.$el.html(this.appTemplate({user: this.grader}));
        this.$container = this.$(".app-view-container");
        this.$saveIndicator = this.$(".save-indicator");
    },

    renderGradeReports: function () {
        this.$container.empty();
        var gradeReports = this.gradeReports.where({assignment: this.assignment, gradedBySunetid: this.grader});
        gradeReports = _.map(gradeReports, function(gradeReport) { return gradeReport.toJSON(); });
        this.$container.html(this.gradeReportsTemplate({
            gradeReports: gradeReports,
            curGradedForSunetid: this.curGradedForSunetid
        }));

        var $gradeReportsContainer = this.$(".grade-report-container");
        if (!this.curGradedForSunetid) {
            var url;
            if (gradeReports.length == 0) url = "grade/" + this.assignment;
            else url = "grade/" + this.assignment + "/" + gradeReports[0].gradedForSunetid;
            router.navigate(url, {trigger: true, replace: true});
            return;
        }

        var gradeReport = this.gradeReports.findWhere({
            assignment: this.assignment,
            gradedBySunetid: this.grader,
            gradedForSunetid: this.curGradedForSunetid
        });
        if (!gradeReport) return;

        var $gradeReportContainer = this.$(".grade-report-container");
        var view = new GradeReportView({model: gradeReport});
        var $elem = view.render().el;
        $gradeReportContainer.append($elem);
        gradeReport.on("destroy", function() {
            $elem.remove();
            this.gradeReports.remove(gradeReport);
            var remainingGradeReports = this.gradeReports.where({assignment: this.assignment, gradedBySunetid: this.grader});

            var url;
            if (remainingGradeReports.length == 0) url = "grade/" + this.assignment;
            else url = "grade/" + this.assignment + "/" + remainingGradeReports[0].get("gradedForSunetid");
            router.navigate(url, {trigger: true, replace: true});
        }, this);
    },

    renderOverview: function() {
        this.$container.empty();
        var view = new GradeReportReadonlyView({ gradeReports: this.gradeReports, assignment: this.assignment });
        this.$container.append(view.render().el);
    },

    renderLateDays: function() {
        this.$container.empty();
        var view = new LateDayView({
            gradeReports: this.gradeReports,
            assignment: this.assignment,
            grader: this.grader
        });
        this.$container.append(view.render().el);
    },

    renderSendEmails: function() {
        this.$container.empty();
        var view = new SendEmailView({
            gradeReports: this.gradeReports,
            assignment: this.assignment,
            grader: this.grader
        });
        this.$container.append(view.render().el);
        this.$emailAlerts = this.$(".email-alerts");
    },

    onRequest: function(model_or_collection, xhr, options) {
        this.$saveIndicator.text("Saving...");
    },

    onSync: function(model_or_collection, resp, options) {
        this.$saveIndicator.text("Saved!");
    },

    onError: function(model_or_collection, resp, options)  {
        this.$saveIndicator.text("ERROR! Not saved.");

        message = "Server error! Not saved.\n"+
            "Try again, making sure that 'Saving...' turns into 'Saved!' in the navbar.\n"+
            "Or, if you see 'Access forbidden' in the message from the server below, "+
            "try refreshing the page - might need to log in to WebAuth again.\n";
        if (model_or_collection && model_or_collection.attributes)
          message += "\nObject that was not saved:\n" + JSON.stringify(model_or_collection.attributes) + "\n";
        if (resp && resp.responseText)
          message += "\nMessage from server:\n" + resp.responseText + "\n";

        alert(message);
    },

    onAddGradeReport: function() {
        var promptVal = prompt("What is the sunetid of the student you want to add?\n"+
            "If this is a team, enter the sunetids separated by a comma (e.g. sunet1,sunet2)");
        if (promptVal === null || promptVal === "") return;

        // sanitize
        var sunetids = promptVal.split(",").map(function(e) { return e.trim() }).join(",");

        var gradeReport = new GradeReport({
            assignment: this.assignment,
            gradedForSunetid: sunetids,
            gradedBySunetid: this.grader });
        this.gradeReports.add(gradeReport);
        gradeReport.save({}, {success: _.bind(function(){ this.renderGradeReports(); }, this)});
    },

    onCommentChange: function(model) {
        if (!model.get("isPublic")) return;
        EventDispatcher.trigger("change:grade-report-comment:public", { id: model.id, text: model.get("text") });
    }
});
