GradeReportView = Backbone.View.extend({

  template: _.template($("#grade-report-view-template").html()),
  headerTemplate: _.template($("#grade-report-view-table-header-template").html()),

  events: {
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.$table = this.$(".comment-table");

    var comments = this.model.get("comments");
    var curType = null;
    comments.each(function (comment) {
      if (comment.get("type") !== curType) {
        curType = comment.get("type");
        var formatted = curType.split("_")
          .map(function(e) { return e[0].toUpperCase() + e.substr(1).toLowerCase(); }).join(" ");
        this.$table.append(this.headerTemplate({header:formatted}));
      }

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
      this.$table.append(view.render().el);
    }, this);

    return this;
  }

});
