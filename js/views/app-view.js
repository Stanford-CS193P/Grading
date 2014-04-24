EventDispatcher = _.extend({}, Backbone.Events);


Router = Backbone.Router.extend({
    routes: {
        "grade/:assignment": "gradeAssignment",
        "overview/:assignment": "overviewAssignment",
        "late-days/:assignment": "lateDaysAssignment"
    }
});
var router = new Router();

AppView = Backbone.View.extend({
    el: "#app",

    appTemplate: _.template($('#app-template').html()),

    initialize: function () {
        this.setUpRoutes();
        this.grader = window.USER;

        this.gradeReports = new GradeReports();
        this.gradeReports.fetch({reset: true, success: _.bind(function() {
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

        this.renderContent = null;

        this.render();
    },

    setUpRoutes: function() {
        router.on("route:gradeAssignment", function(assignment) {
            this.assignment = parseInt(assignment, 10);
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
    },

    render: function() {
        this.$el.html(this.appTemplate({user: window.USER}));
        this.$container = this.$(".app-view-container");
        this.$saveIndicator = this.$(".save-indicator");
    },

    renderGradeReports: function () {
        this.$container.empty();
        this.addAllGradeReports();
    },

    addOneGradeReport: function (gradeReport) {
        if (gradeReport.get("assignment") !== this.assignment) return;
        if (gradeReport.get("gradedBySunetid") !== this.grader) return;

        var view = new GradeReportView({model: gradeReport});
        this.$container.append(view.render().el);
    },

    addAllGradeReports: function () {
        this.gradeReports.each(this.addOneGradeReport, this);
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

    onRequest: function() {
        this.$saveIndicator.text("Saving...");
    },

    onSync: function(model_or_collection, resp, options) {
        this.$saveIndicator.text("Saved!");
    }
});
