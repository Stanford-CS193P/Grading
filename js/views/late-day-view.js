LateDayItemView = Parse.View.extend({
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
        EventDispatcher.trigger("request");
        this.model.save("lateDayCount", parseInt(this.$input.val(), 10)).then(function() {
            EventDispatcher.trigger("sync");
        }, function (error) {
            alert("Error: " + error.code + " " + error.message);
        });
    }
});

LateDayView = Parse.View.extend({
    template: _.template($("#late-day-view-template").html()),

    initialize: function (args) {
        this.assignment = args.assignment;
        this.gradeReports = args.gradeReports;
    },

    render: function () {
        this.$el.html(this.template({assignment: this.assignment}));
        this.$table = this.$(".late-day-table");

        this.gradeReports.each(function(gradeReport) {
            var view = new LateDayItemView({model: gradeReport});
            this.$table.append(view.render().el);
        }, this);

        return this;
    }
});
