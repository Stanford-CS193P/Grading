GradeReportView = Backbone.View.extend({

    template: _.template($("#grade-report-view-template").html()),
    headerTemplate: _.template($("#grade-report-view-table-header-template").html()),

    events: {
        "change .grade": "onChangeGrade",
        "keyup .late-day-count": "onChangeLateDayCount"
    },

    initialize: function () {
        EventDispatcher.on("add:grade-report-comment:public", this.onAddGradeReportComment, this);
    },

    render: function () {
        console.log(this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        this.$table = this.$(".comment-table");
        this.$grade = this.$(".grade");
        this.$lateDayCount = this.$(".late-day-count");

        this.$grade.find("option").each(_.bind(function(ignored, elem) {
            elem = $(elem);
            if ((!this.model.get("grade") && elem.text() === "TODO") ||
                   (this.model.get("grade") && elem.text() === this.model.get("grade"))) {
                elem.prop("selected", true);
            }
        }, this));

        var view = new GradeReportOtherCommentCreateView({assignment:this.model.get("assignment")});
        this.$addComment = $(view.render().el).appendTo(this.$table);
        view.on("add:grade-report-comment:non-public", this.onAddGradeReportCommentNonPublic, this);

        var comments = this.model.get("comments");
        var curType = null;
        comments.each(function (comment) {
            if (comment.get("type") !== curType) {
                curType = comment.get("type");
                this.$addComment.before(this.headerTemplate({header: comment.formattedType()}));
            }

            this.renderComment(comment);
        }, this);

        return this;
    },

    renderComment: function(comment) {
        var viewClass;
        if (comment.get("type") === "REQUIRED_TASK")
            viewClass = GradeReportRequiredTaskCommentView;
        else if (comment.get("type") === "EVALUATION")
            viewClass = GradeReportEvaluationCommentView;
        else if (comment.get("type") === "EXTRA_CREDIT")
            viewClass = GradeReportExtraCreditCommentView;
        else if (comment.get("type") === "OTHER")
            viewClass = GradeReportOtherCommentView;
        if (!viewClass) return;

        var view = new viewClass({ model: comment });
        this.$addComment.before(view.render().el);
    },

    onAddGradeReportComment: function(comment) {
        var myComment = comment.clone();
        myComment.set("gradeReportID", this.model.id);
        this.model.get("comments").add(myComment);
        this.renderComment(myComment);
    },

    onAddGradeReportCommentNonPublic: function(comment) {
        comment.set("gradeReportID", this.model.id);
        this.model.get("comments").add(comment);
        comment.save("value", "1");
        this.renderComment(comment);
    },

    onChangeGrade: function() {
        console.log(this.$grade.val());
        this.model.save("grade", this.$grade.val());
    },

    onChangeLateDayCount: function() {
        console.log(this.$lateDayCount.val());
        this.model.save("lateDayCount", this.$lateDayCount.val());
    }

});
