GradeReportComments = Parse.Collection.extend({
    model: GradeReportComment,

    comparator: function (gradeReportComment) {
        var sortStr = "";

        var comment = gradeReportComment.get("comment");
        if (comment.get("type") === "REQUIRED_TASK")
            sortStr += "0";
        else if (comment.get("type") === "EVALUATION")
            sortStr += "1";
        else if (comment.get("type") === "EXTRA_CREDIT")
            sortStr += "2";
        else if (comment.get("type") === "OTHER")
            sortStr += "3";
        else
            sortStr += "4";

        sortStr += "-" + (typeof(comment.get("position")) === "undefined" ? "0" : comment.get("position"));
        sortStr += "-" + (typeof(comment.get("popularity")) === "undefined" ? "0" : comment.get("popularity"));

        return sortStr;
    }
});
