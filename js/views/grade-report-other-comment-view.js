GradeReportOtherCommentView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($("#grade-report-other-comment-view-template").html()),
    editTemplate: _.template($("#grade-report-other-comment-edit-view-template").html()),

    events: {
        "change .comment-applies": "onValueChange",
        "change .is-public": "onChangeIsPublic",
        "click .edit-comment": "editComment",
        "click .edit-comment-cancel": "editCommentCancel",
        "click .edit-comment-done": "editCommentDone"
    },

    initialize: function () {
        EventDispatcher.on("change:grade-report-comment:text", this.onChangeGradeReportCommentText, this);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    onValueChange: function (event) {
        var $elem = $(event.target || event.currentTarget);
        var val = $elem.prop("checked") ? "1" : "0";
        this.model.save("value", val);
        this.render();
    },

    onChangeIsPublic: function (event) {
        var $elem = $(event.target || event.currentTarget);
        var val = $elem.prop("checked");
        this.model.save("isPublic", val);
    },

    editComment: function (event) {
        this.$el.html(this.editTemplate(this.model.toJSON()));
    },

    editCommentCancel: function () {
        this.render();
    },

    editCommentDone: function() {
        var newText = this.$("textarea").val();
        this.model.save("text", newText);
        this.render();
    },

    onChangeGradeReportCommentText: function(commentID, oldText, newText) {
        if (commentID !== this.model.id) return;
        this.model.set("text", newText, {quiet: true});
        this.render();
    }

});
