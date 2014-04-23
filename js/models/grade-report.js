GradeReport = Backbone.JJRelationalModel.extend({
    relations: [
        {
            type: 'has_many',
            relatedModel: 'GradeReportComment',
            key: 'comments',
            reverseKey: 'gradeReport',
            collectionType: 'GradeReportComments',
            includeInJSON: ['id']
        }
    ],

    defaults: {
        lateDayCount: 0,
        grade: ''
    },

    parse: function (response) {
        response.comments = new GradeReportComments(response.comments);
        return response;
    },

    set: function (attributes, options) {
        if (attributes.comments !== undefined && !(attributes.comments instanceof GradeReportComments)) {
            attributes.comments = new GradeReportComments(attributes.comments);
        }
        return Backbone.JJRelationalModel.prototype.set.call(this, attributes, options);
    }
});
