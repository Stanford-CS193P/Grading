INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 1,  3, 'REQUIRED_TASK', '1. Add a new MVC to your Matchismo solution from last week which plays a simple version of the card matching game Set.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 2,  3, 'REQUIRED_TASK', '1. A good solution to this assignment will use object-oriented programming techniques to share a lot of code with your Playing Card-based matching game.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 3,  3, 'REQUIRED_TASK', '2. The Set game only needs to allow users to pick sets and get points for doing so (e.g. it does not redeal new cards when sets are found). In other words, it works just like the Playing Card matching game. The only differences are that it is a 3-card matching game and uses different cards (deal your Set cards out of a complete Set deck).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 4,  3, 'REQUIRED_TASK', '3. Your Playing Card game must continue to work as required from last week except that it only needs to work as a 2-card matching game (you can remove the switch or segmented control from your UI, but keep your 3-card matching infrastructure because Set is a 3-card matching game).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 5,  3, 'REQUIRED_TASK', '4. Use a UITabBarController to present the two games in your UI in separate tabs.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 6,  3, 'REQUIRED_TASK', '5. Just to show that you know how to do this, your Set game should have a different number of cards on the table than your Playing Card game (either game can have however many cards of whatever aspect ratio you think is best for your UI).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 7,  3, 'REQUIRED_TASK', '6. Instead of drawing the Set cards in the classic form (we’ll do that next week), we’ll use these three characters ▲ ● ■  and use attributes in NSAttributedString to draw them appropriately (i.e. colors and shading).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 8,  3, 'REQUIRED_TASK', '7. Similarly, use NSAttributedString to make the cards in your Playing Card game show hearts and diamonds in red.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 9,  3, 'REQUIRED_TASK', '8. Both games must show the score somewhere and allow the user to re-deal.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 10, 3, 'REQUIRED_TASK', '9. Your Set game should also report (mis)matches like Required Task #5 in the last assignment, but you’ll have to enhance this feature (to use NSAttributedString) to make it capable of working for both the Set and Playing Card games.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 11, 3, 'REQUIRED_TASK', '10.Last week, there was an Extra Credit task to use a UISlider to show the history of the currently-being-played game. This week we’re going to make showing the history a Required Task, but instead of using a slider, you must invent yet another new MVC which displays the history in a UITextView and which is segued to inside a UINavigationController.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 12, 3, 'REQUIRED_TASK', '10. It should show the cards involved in every match or mismatch as well as how many points were earned or lost as a result (you are already showing this information in a UILabel for each card choosing, so this should be rather straightforward to implement).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 13, 3, 'REQUIRED_TASK', '10. Add a bar button item “History” on the right side of the navigation bar which performs the push segue.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 14, 3, 'REQUIRED_TASK', '10. This feature must work for both the Playing Card game and the Set game.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 15, 3, 'EVALUATION', 'Project does not build.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 16, 3, 'EVALUATION', 'Project does not build without warnings.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 17, 3, 'EVALUATION', 'One or more items in the Required Tasks section was not satisfied.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 18, 3, 'EVALUATION', 'Afundamentalconceptwasnotunderstood.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 19, 3, 'EVALUATION', 'Code is sloppy and hard to read (e.g. indentation is not consistent, etc.).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 20, 3, 'EVALUATION', 'Your solution is difficult (or impossible) for someone reading the code to understand due to lack of comments, poor variable/method names, poor solution structure, etc.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 21, 3, 'EVALUATION', 'Solution violates MVC.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 22, 3, 'EVALUATION', 'UI is a mess. Things should be lined up and appropriately spaced to “look nice.” Xcode gives you those dashed blue guidelines so there should be no excuse for things not being lined up, etc. Get in the habit of building aesthetically balanced UIs from the start of this course.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 23, 3, 'EVALUATION', 'Assignment was turned in late (you get 3 late days per quarter, so use them wisely).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 24, 3, 'EVALUATION', 'Incorrect or poor use of object-oriented design principles. For example, code should not be duplicated if it can be reused via inheritance or other object- oriented design methodologies.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 25, 3, 'EXTRA_CREDIT', '1. Create appropriate icons for your two tabs. The icons are 30x30 and are pure alpha channels (i.e. they are a “cutout”). Search the documentation for more on how to create icons like that and set them.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 26, 3, 'EXTRA_CREDIT', '2. Add another tab to track the user’s high scores. You will want to use NSUserDefaults to store the high scores permanently. The tab might want to show information like the time the game was played and the game’s duration. It must also be clear which scores were Playing Card matching games and which scores were Set card matching games. Use attributes to highlight certain information (shortest game, highest score, etc.).');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 27, 3, 'EXTRA_CREDIT', '3. Include the ability to sort the scores shown in the Extra Credit above by last played, score or game duration.');
INSERT INTO comments (isPublic, position, assignment, commentType, commentText) VALUES (1, 28, 3, 'EXTRA_CREDIT', '4. Add yet another tab for some “settings” in the game (match bonuses, etc.).');
