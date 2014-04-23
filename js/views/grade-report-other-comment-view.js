GradeReportOtherCommentView = Backbone.View.extend({
  tagName: 'tr',

  template: _.template($("#grade-report-other-comment-view-template").html()),
  editTemplate: _.template($("#grade-report-other-comment-edit-view-template").html()),

  events: {
  },

  initialize: function () {
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});
