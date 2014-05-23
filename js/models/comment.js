Comment = Parse.Object.extend("Comment", {
    // Instance methods

    formattedType: function () {
        if (!this.get("type")) return;
        return this.get("type").split("_").map(function (e) {
            return e.length == 0 ? "" : e[0].toUpperCase() + e.substr(1).toLowerCase();
        }).join(" ");
    }

}, {
    // Class methods
});
