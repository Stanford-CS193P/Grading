GradeReportRequiredTaskCommentView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($("#grade-report-required-task-comment-view-template").html()),

    events: {
        "change input[type=radio]": "onValueChange"
    },

    initialize: function () {
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    onValueChange: function (event) {
        var $elem = $(event.target || event.currentTarget);
        var val = $elem.val();
        this.model.save("value", val);
        this.render();
    }

});
