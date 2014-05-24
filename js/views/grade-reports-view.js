GradeReportsView = Parse.View.extend({

    template: _.template($('#grade-reports-view-template').html()),

    events: {
        'click .add-grade-report': 'onAddGradeReport'
    },

    initialize: function (args) {
        this.assignment = args.assignment;
        this.gradedBySunetid = args.gradedBySunetid;
        this.curGradedForSunetid = args.curGradedForSunetid;

        this.gradeReports = new GradeReports();
        GradeReport.fetchGradeReports([
            { key: "assignment", value: this.assignment },
            { key: "gradedBySunetid", value: this.gradedBySunetid }
        ], function (gradeReports) {
            this.gradeReports = gradeReports;

            if (!this.curGradedForSunetid) {
                this.rerouteToNextStudent();
                return;
            }

            this.render();
        }, this);

        router.on("route:gradeAssignmentForSunetid", _.bind(function (assignment, gradedForSunetid) {
            assignment = parseInt(assignment, 10);
            if (assignment === this.assignment && gradedForSunetid !== this.curGradedForSunetid) {
                this.curGradedForSunetid = gradedForSunetid;
                this.render();
            }
        }, this));
    },

    render: function () {
        this.$el.html(this.template({
            gradeReports: this.gradeReports.map(function (gradeReport) {
                return gradeReport.toJSON();
            }),
            curGradedForSunetid: this.curGradedForSunetid
        }));

        var gradeReport = this.gradeReports.filter(_.bind(function (gradeReport) {
            return gradeReport.get("gradedForSunetid") === this.curGradedForSunetid;
        }, this));
        if (gradeReport.length == 0) return this;
        gradeReport = gradeReport[0];

        var $gradeReportContainer = this.$(".grade-report-container");
        var view = new GradeReportView({model: gradeReport});
        var $elem = view.render().el;
        $gradeReportContainer.append($elem);

        gradeReport.on("destroy", function () {
            $elem.remove();
            this.gradeReports.remove(gradeReport);
            this.rerouteToNextStudent();
        }, this);

        return this;
    },

    rerouteToNextStudent: function() {
        var url;
        if (this.gradeReports.length == 0) url = "grade/" + this.assignment;
        else url = "grade/" + this.assignment + "/" + this.gradeReports.at(0).get("gradedForSunetid");
        router.navigate(url, {trigger: true, replace: true});
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
            gradedBySunetid: this.gradedBySunetid,
            isSent: 0
        }).then(_.bind(function () {
            var url = "grade/" + this.assignment + "/" + sunetids;
            router.navigate(url, {trigger: false, replace: true});
            location.reload();
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
        this.gradeReports.add(gradeReport);
    }
});