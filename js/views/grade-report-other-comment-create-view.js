GradeReportOtherCommentCreateView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($("#grade-report-other-comment-create-view-template").html()),

    events: {
        "click .add-comment": "addComment"
    },

    initialize: function (args) {
        this.assignment = args.assignment;
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    addComment: function () {
        var isPublic = this.$(".is-public").prop("checked");
        var text = this.$("textarea").val();
        var model = new GradeReportComment({
            isPublic:isPublic,
            text:text,
            author: window.USER,
            type: "OTHER",
            popularity: 0,
            assignment: this.assignment
        });

        model.save({}, {success: _.bind(function(model, response, options) {
            if (model.get("isPublic"))
                EventDispatcher.trigger("add:grade-report-comment:public", model);
            else
                this.trigger("add:grade-report-comment:non-public", model);
        }, this)});

        this.render();
    }

});
