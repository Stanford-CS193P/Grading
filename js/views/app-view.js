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
            }, this);
        }, this)});

        this.listenTo(this.gradeReports, "request", this.onRequest);
        this.listenTo(this.gradeReports, "sync", this.onSync);
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
            console.log("no this.curGradedForSunetid");
            if (this.gradeReports.length == 0) return;
            var nextGradedForSunetid = this.gradeReports.at(0).get("gradedForSunetid");
            router.navigate("grade/" + this.assignment + "/" + nextGradedForSunetid,
                {trigger: true, replace: true});
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
            if (this.gradeReports.length == 0) return;
            var nextGradedForSunetid = this.gradeReports.at(0).get("gradedForSunetid");
            router.navigate("grade/" + this.assignment + "/" + nextGradedForSunetid,
                {trigger: true, replace: false});
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
    },

    onRequest: function(model_or_collection, xhr, options) {
        this.$saveIndicator.text("Saving...");
    },

    onSync: function(model_or_collection, resp, options) {
        this.$saveIndicator.text("Saved!");
    },

    onError: function(model_or_collection, resp, options)  {
        this.$saveIndicator.text("ERROR! Not saved. Try refreshing the page - might need to log in again...");
    }
});
