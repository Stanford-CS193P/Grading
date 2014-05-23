Comments = Parse.Collection.extend({
    model: Comment
}, {
    // Class methods

    fetchAllComments: function(assignment, onSuccess, context) {
        var queryAllComments = new Parse.Query(Comment);
        queryAllComments.equalTo("assignment", assignment);
        var allComments = new Comments();
        allComments.query = queryAllComments;
        allComments.fetch({
            success: function () {
                if (onSuccess) onSuccess.call(context, allComments);
            }, error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }

});
