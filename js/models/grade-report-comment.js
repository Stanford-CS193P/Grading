GradeReportComment = Backbone.JJRelationalModel.extend({
    relations: [
        {
            type: 'has_one',
            relatedModel: 'Comment',
            key: 'comment',
            reverseKey: 'gradeComments',
            includeInJSON: ['id']
        }
    ]
});
