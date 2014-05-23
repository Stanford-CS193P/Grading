GradeReportComments = Parse.Collection.extend({
    model: GradeReportComment,

    comparator: function (gradeReportComment) {
        var sortBy = 0;

        var comment = gradeReportComment.get("comment");
        if (comment.get("type") === "REQUIRED_TASK")
            sortBy += 1;
        else if (comment.get("type") === "EVALUATION")
            sortBy += 2;
        else if (comment.get("type") === "EXTRA_CREDIT")
            sortBy += 3;
        else if (comment.get("type") === "OTHER")
            sortBy += 4;
        else
            sortBy += 5;

        sortBy *= 10000;
        sortBy += (typeof(comment.get("position")) === "undefined" ? 1 : comment.get("position"));
        sortBy *= 10000;
        sortBy += (typeof(comment.get("popularity")) === "undefined" ? 1 : comment.get("popularity"));

        return sortBy;
    }
});
