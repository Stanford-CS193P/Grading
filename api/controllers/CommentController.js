/**
 * CommentController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  readForAssignment: function(req, res) {
    var assignment = req.param("assignment");
    Comment.find()
      .where({assignment: assignment})
      .done(function(err, comments) {
        if (err) return res.send(err, 500);

        comments.sort(function(c1, c2) {
          var val1, val2;
          if (c1.type === "REQUIRED_TASK") val1 = 0;
          if (c1.type === "EVALUATION") val1 = 1;
          if (c1.type === "EXTRA_CREDIT") val1 = 2;
          if (c1.type === "OTHER") val1 = 3;
          if (c2.type === "REQUIRED_TASK") val2 = 0;
          if (c2.type === "EVALUATION") val2 = 1;
          if (c2.type === "EXTRA_CREDIT") val2 = 2;
          if (c2.type === "OTHER") val2 = 3;

          if (val1 === val2) {
            return c1.createdAt - c2.createdAt;
          }
          return val1 - val2;
        });

        return res.view({comments: comments, assignment: assignment});
      })
  },

  // create: function(req, res) {
  //   var assignment = req.param("assignment");
  //   var type = req.param("type");
  //   var text = req.param("text");

  //   Comment.create({
  //     assignment: assignment,
  //     type: type,
  //     text: text
  //   }).done(function(err, comment) {
  //     if (err) return res.send(err, 500);
  //     Comment.publishCreate(comment);
  //     res.json(comment);
  //   });
  // },

  // update: function(req, res) {
  //   var id = req.param("id");
  //   var type = req.param("type");
  //   var text = req.param("text");

  //   Comment.findOne(1).where({id: id})
  //     .done(function(err, comment) {
  //       if (err) return res.send(err, 500);

  //       if (type) comment.type = type;
  //       if (text) comment.text = text;

  //       comment.save(function(err) {
  //         // Comment.publishUpdate(comment);
  //         res.json(comment);
  //       });
  //     });
  // },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to CommentController)
   */
  _config: {}


};
