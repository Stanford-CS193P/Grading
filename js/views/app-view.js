AppView = Backbone.View.extend({
    el: "#app",

    appTemplate: _.template($('#app-template').html()),

    initialize: function () {
        this.gradeReports = new GradeReports();
        // TODO: think about how to do comments
        this.comments = new Comments();

        this.listenTo(this.gradeReports, 'add', this.addOne);
        this.listenTo(this.gradeReports, 'reset', this.addAll);

        this.gradeReports.fetch({reset: true});
        this.comments.fetch({reset: true});
        this.render();
    },

    render: function () {
        this.$el.html(this.appTemplate());

        this.$gradeReports = this.$(".grade-reports");
    },

    addOne: function (gradeReport) {
        var view = new GradeReportView({model: gradeReport});
        this.$gradeReports.append(view.render().el);
    },

    addAll: function () {
        console.log(this.gradeReports);
        this.gradeReports.each(this.addOne, this);
    }
});
