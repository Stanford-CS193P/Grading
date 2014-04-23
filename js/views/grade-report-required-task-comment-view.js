GradeReportRequiredTaskCommentView = Backbone.View.extend({
  tagName: 'tr',

  template: _.template($("#grade-report-required-task-comment-view-template").html()),

  events: {
  },

  initialize: function () {
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});
