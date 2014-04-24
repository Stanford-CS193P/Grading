LateDayItemView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($("#late-day-item-view-template").html()),

    events: {
        "keyup input": "onChangeLateDayCount"
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$input = this.$("input");
        return this;
    },

    onChangeLateDayCount: function() {
        this.model.save("lateDayCount", this.$input.val());
    }
});

LateDayView = Backbone.View.extend({
    template: _.template($("#late-day-view-template").html()),

    initialize: function (args) {
        this.assignment = args.assignment;
        this.gradeReports = args.gradeReports;
        this.grader = args.grader;
    },

    render: function () {
        this.$el.html(this.template({assignment: this.assignment}));
        this.$table = this.$(".late-day-table");

        this.gradeReports.each(function(gradeReport) {
            if (gradeReport.get("assignment") !== this.assignment) return;
            if (gradeReport.get("gradedBySunetid") !== this.grader) return;

            var view = new LateDayItemView({model: gradeReport});
            this.$table.append(view.render().el);
        }, this);

        return this;
    }
});
