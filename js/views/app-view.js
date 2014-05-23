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
    gradeReportsTemplate: _.template($('#grade-reports-view-template').html()),

    events: {
        'click .add-grade-report': 'onAddGradeReport'
    },

    initialize: function () {
        this.grader = window.USER;
        this.renderContent = null;

        EventDispatcher.on("request", this.onRequest, this);
        EventDispatcher.on("sync", this.onSync, this);

        this.setUpRoutes();
        this.render();
        this.setUpEmailAlert();
    },

    setUpEmailAlert: function () {
        EventDispatcher.on("email", function (result) {
            this.$emailAlerts = this.$(".email-alerts");
            if (!this.$emailAlerts) return;

            var alert = $("<div/>").addClass("alert");
            if (result.status === "IN_PROGRESS") {
                alert.addClass("alert-warning").text("Sending email to " + result.recipient + "...");
            } else if (result.status === "SUCCESS") {
                alert.addClass("alert-success").text("Email to " + result.recipient + " successfully sent.");
            } else if (result.status === "FAIL") {
                alert.addClass("alert-danger").text("Email to " + result.recipient + " failed to send.");
            }

            console.log("appending");
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
            this.renderContent = this.renderGradeReports;
            this.handleAssignmentRoute(assignment);
        }, this);

        router.on("route:overviewAssignment", function (assignment) {
            this.renderContent = this.renderOverview;
            this.handleAssignmentRoute(assignment);
        }, this);

        router.on("route:lateDaysAssignment", function (assignment) {
            this.renderContent = this.renderLateDays;
            this.handleAssignmentRoute(assignment);
        }, this);

        router.on("route:sendEmailsAssignment", function (assignment) {
            this.renderContent = this.renderSendEmails;
            this.handleAssignmentRoute(assignment);
        }, this);
    },

    handleAssignmentRoute: function (assignment) {
        assignment = parseInt(assignment, 10);
        if (assignment !== this.assignment) {
            this.assignment = assignment;
            this.fetchGradeReports(this.renderContent, this);
        } else {
            this.renderContent();
        }
    },

    render: function () {
        this.$el.html(this.appTemplate({user: this.grader}));
        this.$container = this.$(".app-view-container");
        this.$saveIndicator = this.$(".save-indicator");
        // TODO: remove this.$(".loading-alert").hide();
    },

    fetchGradeReports: function (onSuccess, context) {
        if (!this.assignment || !this.grader) return;

        this.$(".loading-alert").show();

        var query = new Parse.Query(GradeReport);
        query.equalTo("gradedBySunetid", this.grader);
        query.equalTo("assignment", this.assignment);
        this.gradeReports = new GradeReports();
        this.gradeReports.query = query;
        this.gradeReports.fetch({
            success: function () {
                this.$(".loading-alert").hide();
                if (onSuccess) {
                    onSuccess.call(context);
                }
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    },

    renderGradeReports: function () {
        if (!this.curGradedForSunetid && this.gradeReports.length > 0) {
            var url;
            if (this.gradeReports.length == 0) url = "grade/" + this.assignment;
            else url = "grade/" + this.assignment + "/" + this.gradeReports.at(0).get("gradedForSunetid");
            router.navigate(url, {trigger: true, replace: true});
            return;
        }

        this.$container.html(this.gradeReportsTemplate({
            gradeReports: this.gradeReports.map(function (gradeReport) {
                return gradeReport.toJSON();
            }),
            curGradedForSunetid: this.curGradedForSunetid
        }));

        var gradeReport = this.gradeReports.filter(function (gradeReport) {
            return gradeReport.get("gradedForSunetid") === this.curGradedForSunetid;
        }, this);
        if (gradeReport.length == 0) return;
        gradeReport = gradeReport[0];

        var $gradeReportContainer = this.$(".grade-report-container");
        var view = new GradeReportView({model: gradeReport});
        var $elem = view.render().el;
        $gradeReportContainer.append($elem);

        gradeReport.on("destroy", function () {
            $elem.remove();
            this.gradeReports.remove(gradeReport);

            var url;
            if (this.gradeReports.length == 0) url = "grade/" + this.assignment;
            else url = "grade/" + this.assignment + "/" + this.gradeReports.at(0).get("gradedForSunetid");
            router.navigate(url, {trigger: true, replace: true});
        }, this);
    },

    renderOverview: function () {
        this.$container.empty();
        var view = new GradeReportReadonlyView({ assignment: this.assignment });
        this.$container.append(view.render().el);
    },

    renderLateDays: function () {
        this.$container.empty();
        var view = new LateDayView({ gradeReports: this.gradeReports, assignment: this.assignment });
        this.$container.append(view.render().el);
    },

    renderSendEmails: function () {
        this.$container.empty();
        var view = new SendEmailView({ assignment: this.assignment });
        this.$container.append(view.render().el);
        this.$emailAlerts = this.$(".email-alerts");
    },

    onRequest: function () {
        this.$saveIndicator.text("Saving...");
    },

    onSync: function () {
        this.$saveIndicator.text("Saved!");
    },

    onAddGradeReport: function () {
        var promptVal = prompt("What is the sunetid of the student you want to add?\n" +
            "If this is a team, enter the sunetids separated by a comma (e.g. sunet1,sunet2)");
        if (promptVal === null || promptVal === "") return;

        // sanitize
        var sunetids = promptVal.split(",").map(function (e) {
            return e.trim()
        }).join(",");

        var gradeReport = new GradeReport();
        EventDispatcher.trigger("request");
        gradeReport.save({
            assignment: this.assignment,
            gradedForSunetid: sunetids,
            gradedBySunetid: this.grader
        }).then(_.bind(function () {
            EventDispatcher.trigger("sync");
            this.renderGradeReports();
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
        this.gradeReports.add(gradeReport);
    }
});
