var _ = require("underscore");
var Parse = require("parse").Parse;

Parse.initialize("DwL6Xc95EIQPSketONgcsaUOXD1HJ41Rgm8VBIeq", "7rhuu2liFvpYbiJ2Usu9L0U5oSNA9lpUk8ilWnaN");

var assignment = 6;
var required_tasks = [
    "1. Your application must work identically to last week except that where you are displaying the “top places” (as reported by Flickr), you are going to display the “top regions” in which photos have been taken.",
    "1. You will calculate the most popular regions from the data you gather periodically from the URLforRecentGeoreferencedPhotos.",
    "2. The popularity of a region is determined by how many different photographers have taken a photo in that region among the photos you’ve downloaded from Flickr.",
    "2. Only show the 50 most popular regions in your UI (it is okay if the table temporarily shows more than 50 as data is loaded into the database, but re-set it to 50 occasionally).",
    "3. The list of top regions must be sorted first by popularity (most popular first, of course) and secondarily by the name of the region.",
    "3. Display the number of different photographers who have taken a photo in that region as a subtitle in each row.",
    "4. When a region is chosen, all the photos in your database that were taken in that region should be displayed (no sections are required).",
    "4. When a photo is then chosen, it should be displayed in the same way photos were displayed in last week’s assignment.",
    "5. All of your table views everywhere in your application (including the Recents tab) must be driven by Core Data (i.e. not NSUserDefaults nor Flickr dictionaries).",
    "6. Users should be able to pull down to refresh in the Top Regions table.",
    "7. Fetch the URL for Recent Georeferenced Photos from Flickr periodically (a few times an hour when your application is in the foreground and whenever the system will allow when it is in the background (but already launched) using the background fetching API in iOS).",
    "8. Display a thumbnail image of a photo in any table view row that shows Flickr photo information.",
    "8. You must download thumbnails on demand only (i.e. do not ask for a thumbnail until the user tries to display that photo in a row).",
    "8. Once a thumbnail has been downloaded, you must store the thumbnail’s data in Core Data (i.e. don’t ask Flickr for it again).",
    "8. Don’t forget that table view cells are reused!",
    "9. Do not store Flickr photos themselves (i.e. any image other than a thumbnail) in your Core Data database. Fetch them from Flickr on demand each time.",
    "10. Your application’s main thread should never be blocked (e.g. all Flickr fetches must happen in a different thread). You can assume Core Data will not significantly block the main thread.",
    "11. Your application must work in both portrait and landscape orientations on both the iPhone and the iPad and it must work on a real iOS device (not just the simulator)."
];
var evaluation = [
    "Project does not build.",
    "Project does not build without warnings.",
    "A fundamental concept was not understood.",
    "Code is sloppy and hard to read (e.g. indentation is not consistent, etc.).",
    "Your solution is difficult (or impossible) for someone reading the code to understand due to lack of comments, poor variable/method names, poor solution structure, etc.",
    "UI is a mess. Things should be lined up and appropriately spaced to “look nice.” Xcode gives you those dashed blue guidelines so there should be no excuse for things not being lined up, etc. Get in the habit of building aesthetically balanced UIs from the start of this course.",
    "Incorrect or poor use of object-oriented design principles. For example, code should not be duplicated if it can be reused via inheritance or other object- oriented design methodologies.",
    "Main thread blocked waiting for network I/O.",
    "Bad database schema design leading to tortuous code."
];
var extra_credit = [
    "1. Loading Flickr information into your database can be ridiculously inefficient if, for each photo you download, you query to see if it is already in the database, add it if it is not (and maybe update it if it is). Enhance your application to make this download much more efficient, preferably only doing two or three queries total in the database for each “batch” of Flickr photos you download (instead of hundreds, which is what Photomania does). The predicate operator IN might be of value here.",
    "2. If you were to use your application for weeks, your database would start to get huge! Implement a mechanism for pruning your database over time. For example, you might want to delete photos a week after you download them?",
    "3. Teach yourself how to use NSFileManager and use it along with NSData’s writeToURL:atomically: method to cache image data from Flickr (the photos themselves) into files in your application’s sandbox (you’ll probably want to use the NSCachesDirectory to store them). Maybe you keep the last 20 photos the user looks at or all the photos in Recents or maybe 50MB’s worth of photos? Up to you.",
    "4. Background fetching is a little trickier in this assignment than it was in the demo in class because updating your database requires multiple fetches. How will you know when the database is fully updated from a given fetch (and thus the UI is ready to update the app-switcher)? You can fulfill the Required Task for this by doing something fairly dumb that won’t update the UI in the app-switcher properly, but this EC is to “do the right thing.” (Possible hint: You might find the NSURLSession method getTasksWithCompletionHandler: useful since it will tell you if there are any outstanding download tasks out there.)",
    "5. Furthermore, if your application is launched automatically by the system due to a background fetch event, it almost certainly will not update the app switcher properly. (maybe even if you do EC 4 above). Can you figure out why that is? Fix that too."
];

var Comment = Parse.Object.extend("Comment");

_.each(required_tasks, function(text, i) {
    var comment = new Comment();
    comment.save({
        assignment: assignment,
        position: i+1,
        type: "REQUIRED_TASK",
        text: text,
        isPublic: true
    }).then(function(object) {
        console.log("Created REQUIRED_TASK " + i);
    });
});

_.each(evaluation, function(text, i) {
    var comment = new Comment();
    comment.save({
        assignment: assignment,
        position: i+1,
        type: "EVALUATION",
        text: text,
        isPublic: true
    }).then(function(object) {
        console.log("Created EVALUATION " + i);
    });
});

_.each(extra_credit, function(text, i) {
    var comment = new Comment();
    comment.save({
        assignment: assignment,
        position: i+1,
        type: "EXTRA_CREDIT",
        text: text,
        isPublic: true
    }).then(function(object) {
        console.log("Created EXTRA_CREDIT " + i);
    });
});
