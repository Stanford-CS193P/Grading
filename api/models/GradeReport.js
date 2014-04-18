/**
 * GradeReport
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    assignment: "int",
    gradedBySunetid: "string",
    gradedForSunetid: "string",
    lateDayCount: {
      type: "int",
      defaultsTo: 0
    },
    grade: "string",
    comments: "array",
    isEmailSent: {
      type: "boolean",
      defaultsTo: false
    }
  }

};
