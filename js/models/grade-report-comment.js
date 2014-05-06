GradeReportComment = Backbone.Model.extend({
    defaults: {
        value: ""
    },

    urlRoot: "api/index.php/grade-report-comments",

    initialize: function() {
        EventDispatcher.on("change:grade-report-comment:public", this.onChangeGradeReportComment, this);
    },

    set: function (attributes, options) {
        if (attributes.text && this.get("text") !== attributes.text) {
            EventDispatcher.trigger("change:grade-report-comment:text", this.id, this.get("text"), attributes.text);
        }
        return Backbone.Model.prototype.set.call(this, attributes, options);
    },

    formattedType: function () {
        return this.get("type").split("_")
            .map(function (e) {
                return e.length == 0 ? "" : e[0].toUpperCase() + e.substr(1).toLowerCase();
            }).join(" ");
    },

    onChangeGradeReportComment: function(params) {
        if (params.id != this.id) return;
        if (params.text === this.get("text")) return;
        this.set("text", params.text, {silent: true});
    }

});
