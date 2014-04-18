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
    lateDayCount: "int",
    grade: "string",
    comments: "array"
  }

};
