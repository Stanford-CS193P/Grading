GradeReportExtraCreditCommentView = Backbone.View.extend({
  tagName: 'tr',

  template: _.template($("#grade-report-extra-credit-comment-view-template").html()),

  events: {
  },

  initialize: function () {
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});
