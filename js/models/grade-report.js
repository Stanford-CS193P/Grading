GradeReport = Parse.Object.extend("GradeReport", {
    // Instance methods

    initialize: function (attrs, options) {
        this.comments = null;
    },

    fetchComments: function(callback, context) {
        this.comments = new GradeReportComments();

        var query = new Parse.Query(GradeReportComment);
        query.equalTo("gradeReport", this);
        this.comments.query = query;

        this.comments.fetch().then(_.bind(function() {
            Comments.fetchAllComments(this.get("assignment"), function (allComments) {
                this.unusedComments = new Comments();

                allComments.each(_.bind(function (comment) {
                    var found = false;
                    this.comments.each(function(gradeReportComment) {
                        var myComment = gradeReportComment.get("comment");
                        if (myComment.id === comment.id) {
                            found = true;
                            gradeReportComment.set("comment", comment);
                        }
                    });
                    if (found) return;

                    if (comment.get("isPublic")) {
                        this.unusedComments.add(comment);
                    }
                }, this));

                this.unusedComments.each(_.bind(function(comment) {
                    var gradeReportComment = new GradeReportComment({
                        assignment: this.get("assignment"),
                        gradedBySunetid: this.get("gradedBySunetid"),
                        gradedForSunetid: this.get("gradedForSunetid"),
                        gradeReport: this,
                        comment: comment,
                        value: ""
                    });
                    this.comments.add(gradeReportComment);
                }, this));

                this.comments.sort();

                if (callback) {
                    callback.call(context);
                }

//                var count = this.comments.length;
//
//                if (count === 0) {
//                    if (callback) {
//                        callback.call(context);
//                    }
//                    return;
//                }
//
//                this.comments.each(_.bind(function(gradeReportComment) {
//                    var comment = gradeReportComment.get("comment");
//                    console.log(comment, comment.toJSON(), comment.toJSON().objectId);
//                    comment.fetch().then(_.bind(function(){
//                        count--;
//                        if (count === 0) {
//                            if (callback) {
//                                callback.call(context);
//                            }
//                        }
//                    }, this), function(error) {
//                        alert("Error: " + error.code + " " + error.message);
//                    });
//                }, this));

            }, this);

        }, this), function(error) {
            alert("Error: " + error.code + " " + error.message);
        });
    }

}, {
    // Class methods
});
