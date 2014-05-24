EventDispatcher = _.extend({}, Parse.Events);


Router = Parse.Router.extend({
    routes: {
        "grade/:assignment": "gradeAssignment",
        "grade/:assignment/:gradedForSunetid": "gradeAssignmentForSunetid",
        "overview/:assignment": "overviewAssignment",
        "late-days/:assignment": "lateDaysAssignment",
        "send-emails/:assignment": "sendEmailsAssignment"
    }
});
var router = new Router();


AppView = Parse.View.extend({
    el: "#app",

    appTemplate: _.template($('#app-template').html()),

    initialize: function () {
        this.grader = window.USER;
        this.renderContent = null;

        EventDispatcher.on("request", this.onRequest, this);
        EventDispatcher.on("sync", this.onSync, this);

        this.setUpRoutes();
        this.setUpEmailAlert();
        this.render();
    },

    setUpEmailAlert: function () {
        EventDispatcher.on("email", function (result) {
            if (!this.$emailAlerts) return;

            var alert = $("<div/>").addClass("alert");
            if (result.status === "IN_PROGRESS") {
                alert.addClass("alert-warning").text("Sending email to " + result.recipient + "...");
            } else if (result.status === "SUCCESS") {
                alert.addClass("alert-success").text("Email to " + result.recipient + " successfully sent.");
            } else if (result.status === "FAIL") {
                alert.addClass("alert-danger").text("Email to " + result.recipient + " failed to send.");
            }

            this.$emailAlerts.append(alert);
            _.delay(function (alert) {
                alert.fadeOut(300, function () {
                    alert.remove();
                });
            }, 2000, alert);
        }, this);
    },

    setUpRoutes: function () {
        router.on("route:gradeAssignment", function (assignment) {
            this.curGradedForSunetid = null;
            this.renderContent = this.renderGradeReports;
            this.handleAssignmentRoute(assignment);
        }, this);

        router.on("route:gradeAssignmentForSunetid", function (assignment, gradedForSunetid) {
            this.curGradedForSunetid = gradedForSunetid;
            if (this.renderContent !== this.renderGradeReports) {
                this.renderContent = this.renderGradeReports;
                this.handleAssignmentRoute(assignment);
            }
        }, this);

        router.on("route:overviewAssignment", function (assignment) {
            this.curGradedForSunetid = null;
            this.renderContent = this.renderOverview;
            this.handleAssignmentRoute(assignment);
        }, this);

        router.on("route:lateDaysAssignment", function (assignment) {
            this.curGradedForSunetid = null;
            this.renderContent = this.renderLateDays;
            this.handleAssignmentRoute(assignment);
        }, this);

        router.on("route:sendEmailsAssignment", function (assignment) {
            this.curGradedForSunetid = null;
            this.renderContent = this.renderSendEmails;
            this.handleAssignmentRoute(assignment);
        }, this);
    },

    handleAssignmentRoute: function (assignment) {
        assignment = parseInt(assignment, 10);
        this.assignment = assignment;
        this.renderContent();
    },

    render: function () {
        this.$el.html(this.appTemplate({user: this.grader}));
        this.$container = this.$(".app-view-container");
        this.$saveIndicator = this.$(".save-indicator");
    },

    renderGradeReports: function () {
        this.$container.empty();
        var view = new GradeReportsView({
            assignment: this.assignment,
            gradedBySunetid: this.grader,
            curGradedForSunetid: this.curGradedForSunetid
        });
        this.$container.append(view.render().el);
    },

    renderOverview: function () {
        this.$container.empty();
        var view = new GradeReportReadonlyView({
            assignment: this.assignment
        });
        this.$container.append(view.render().el);
    },

    renderLateDays: function () {
        this.$container.empty();
        var view = new LateDayView({
            assignment: this.assignment,
            gradedBySunetid: this.grader
        });
        this.$container.append(view.render().el);
    },

    renderSendEmails: function () {
        this.$container.empty();
        var view = new SendEmailView({
            assignment: this.assignment
        });
        this.$container.append(view.render().el);
        this.$emailAlerts = this.$(".email-alerts");
    },

    onRequest: function () {
        this.$saveIndicator.text("Saving...");
    },

    onSync: function () {
        this.$saveIndicator.text("Saved!");
    }

});
