GradeReportView = Parse.View.extend({

    template: _.template($("#grade-report-view-template").html()),
    headerTemplate: _.template($("#grade-report-view-table-header-template").html()),

    events: {
        "change .grade": "onChangeGrade",
        "keyup .late-day-count": "onChangeLateDayCount",
        "click .delete-submission": "onClickDeleteSubmission"
    },


    initialize: function() {
        GradeReport.fetchOtherComments(this.model, function () {
            this.render();
        }, this);
    },


    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$table = this.$(".comment-table");
        this.$grade = this.$(".grade");
        this.$lateDayCount = this.$(".late-day-count");

        this.$grade.find("option").each(_.bind(function (ignored, elem) {
            elem = $(elem);
            if ((!this.model.get("grade") && elem.text() === "TODO") ||
                (this.model.get("grade") && elem.text() === this.model.get("grade"))) {
                elem.prop("selected", true);
            }
        }, this));

        var view = new GradeReportOtherCommentCreateView({
            assignment: this.model.get("assignment"),
            gradedBySunetid: this.model.get("gradedBySunetid"),
            gradedForSunetid: this.model.get("gradedForSunetid")
        });
        this.$addComment = $(view.render().el).appendTo(this.$table);
        view.on("add:grade-report-comment", this.onAddGradeReportComment, this);

        var curType = null;
        this.model.comments.each(_.bind(function (gradeReportComment) {
            var comment = gradeReportComment.get("comment");
            if (comment.get("type") !== curType) {
                curType = comment.get("type");
                this.$addComment.before(this.headerTemplate({header: comment.formattedType()}));
            }
            this.renderComment(gradeReportComment);
        }, this));

        return this;
    },

    renderComment: function (gradeReportComment) {
        var viewClass;
        var comment = gradeReportComment.get("comment");
        if (comment.get("type") === "REQUIRED_TASK")
            viewClass = GradeReportRequiredTaskCommentView;
        else if (comment.get("type") === "EVALUATION")
            viewClass = GradeReportEvaluationCommentView;
        else if (comment.get("type") === "EXTRA_CREDIT")
            viewClass = GradeReportExtraCreditCommentView;
        else if (comment.get("type") === "OTHER")
            viewClass = GradeReportOtherCommentView;
        if (!viewClass) return;

        var view = new viewClass({ model: gradeReportComment });
        this.$addComment.before(view.render().el);
    },

    onAddGradeReportComment: function (gradeReportComment) {
        gradeReportComment.set("gradeReport", this.model);

        EventDispatcher.trigger("request");
        gradeReportComment.save("value", "1").then(_.bind(function () {
            EventDispatcher.trigger("sync");
            this.model.comments.add(gradeReportComment);
        }, this), function (error) {
            alert("Error: " + error.code + " " + error.message);
        });

        this.renderComment(gradeReportComment);
    },

    onChangeGrade: function () {
        EventDispatcher.trigger("request");
        this.model.save("grade", this.$grade.val()).then(function() {
            EventDispatcher.trigger("sync");
        }, function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
    },

    onChangeLateDayCount: function (event) {
        if (event.which == 13) return;

        EventDispatcher.trigger("request");
        this.model.save("lateDayCount", parseInt(this.$lateDayCount.val(), 10)).then(function() {
            EventDispatcher.trigger("sync");
        }, function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
    },

    onClickDeleteSubmission: function () {
        var isSure = confirm("This will delete all entered data for this student and remove them from your list. " +
            "Are you sure?");
        if (!isSure) return;

        this.model.destroy();
    }

});
