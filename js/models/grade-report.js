GradeReport = Backbone.Model.extend({
    defaults: {
        lateDayCount: 0,
        grade: '',
        isSent: false
    },

    parse: function (response) {
        if (response.comments) {
            response.comments = new GradeReportComments(response.comments);
        }
        return response;
    },

    set: function (attributes, options) {
        if (attributes.comments !== undefined && !(attributes.comments instanceof GradeReportComments)) {
            attributes.comments = new GradeReportComments(attributes.comments);
        }
        return Backbone.Model.prototype.set.call(this, attributes, options);
    }
});
