(function () {
    var base = {
        tagName: 'tr',

        getTemplateParams: function () {
            var params = this.model.toJSON();
            delete params.comment;
            delete params.gradeReport;
            var comment = this.model.get("comment").toJSON();
            for (var field in comment) {
                params[field] = comment[field];
            }
            params.id = this.model.get("comment").id;
            params.gradeReportID = this.model.get("gradeReport").id;
            return params;
        },

        render: function () {
            this.$el.html(this.template(this.getTemplateParams()));
            return this;
        }
    };

    var baseRadio = _.extend({
        events: {
            "change input[type=radio]": "onValueChange"
        },

        onValueChange: function (event) {
            var $elem = $(event.target || event.currentTarget);
            var val = $elem.val();

            EventDispatcher.trigger("request");
            this.model.save("value", val).then(function() {
                EventDispatcher.trigger("sync");
            }, function (error) {
                alert("Error: " + error.code + " " + error.message);
            });

            this.render();
        }
    }, base);

    window.GradeReportRequiredTaskCommentView = Parse.View.extend(_.extend({
        template: _.template($("#grade-report-required-task-comment-view-template").html())
    }, baseRadio));

    window.GradeReportEvaluationCommentView = Parse.View.extend(_.extend({
        template: _.template($("#grade-report-evaluation-comment-view-template").html())
    }, baseRadio));

    window.GradeReportExtraCreditCommentView = Parse.View.extend(_.extend({
        template: _.template($("#grade-report-extra-credit-comment-view-template").html())
    }, baseRadio));

    // === OTHER COMMENTS === //

    window.GradeReportOtherCommentView = Parse.View.extend(_.extend({
        template: _.template($("#grade-report-other-comment-view-template").html()),
        editTemplate: _.template($("#grade-report-other-comment-edit-view-template").html()),

        events: {
            "change .comment-applies": "onValueChange",
            "click .edit-comment": "editComment",
            "click .edit-comment-cancel": "editCommentCancel",
            "click .edit-comment-done": "editCommentDone"
        },

        onValueChange: function (event) {
            var $elem = $(event.target || event.currentTarget);
            var val = $elem.prop("checked") ? "1" : "0";

            EventDispatcher.trigger("request");
            this.model.save("value", val).then(function() {
                EventDispatcher.trigger("sync");
            }, function (error) {
                alert("Error: " + error.code + " " + error.message);
            });

            this.render();
        },

        editComment: function (event) {
            this.$el.html(this.editTemplate(this.getTemplateParams()));
        },

        editCommentCancel: function () {
            this.render();
        },

        editCommentDone: function () {
            var newText = this.$("textarea").val();
            var comment = this.model.get("comment");

            EventDispatcher.trigger("request");
            comment.save("text", newText).then(function() {
                EventDispatcher.trigger("sync");
            }, function (error) {
                alert("Error: " + error.code + " " + error.message);
            });

            this.render();
        }

    }, base));

    window.GradeReportOtherCommentCreateView = Parse.View.extend({
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

            var comment = new Comment({
                isPublic: isPublic,
                text: text,
                author: window.USER,
                type: "OTHER",
                popularity: 0,
                assignment: this.assignment
            });

            var gradeReportComment = new GradeReportComment({
                value: "0",
                comment: comment
            });

            EventDispatcher.trigger("request");
            comment.save().then(_.bind(function () {
                gradeReportComment.save().then(_.bind(function() {
                    EventDispatcher.trigger("sync");
                    this.trigger("add:grade-report-comment", gradeReportComment);

                }, this), function (error) {
                    alert("Error: " + error.code + " " + error.message);
                });
            }, this), function (error) {
                alert("Error: " + error.code + " " + error.message);
            });

            this.render();
        }

    });

})();