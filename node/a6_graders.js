var _ = require("underscore");
var Parse = require("parse").Parse;

Parse.initialize("DwL6Xc95EIQPSketONgcsaUOXD1HJ41Rgm8VBIeq", "7rhuu2liFvpYbiJ2Usu9L0U5oSNA9lpUk8ilWnaN");

var graders = [
    { gradedBySunetid: "bbunge", gradedForSunetid: "alexzam" },
    { gradedBySunetid: "bbunge", gradedForSunetid: "andymai" },
    { gradedBySunetid: "bbunge", gradedForSunetid: "auhong" },
    { gradedBySunetid: "jismael", gradedForSunetid: "aadam" },
    { gradedBySunetid: "jismael", gradedForSunetid: "abearman" },
    { gradedBySunetid: "jismael", gradedForSunetid: "ajay14" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "mduhamel" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "nadavh" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "pavitrar" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "kyang14" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "melj" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "naveenk1" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "pdbrandt" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "leighh1" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "mharkin" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "nicolez" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "pinnaree" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "lmartel" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "mjrials" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "potatoes" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "mlipman1" },
    { gradedBySunetid: "jreidy", gradedForSunetid: "pwbdoyle" },
    { gradedBySunetid: "jismael", gradedForSunetid: "rsternke" },
    { gradedBySunetid: "kzm", gradedForSunetid: "holmdahl" },
    { gradedBySunetid: "kzm", gradedForSunetid: "jbaena" },
    { gradedBySunetid: "kzm", gradedForSunetid: "feiyi" },
    { gradedBySunetid: "kzm", gradedForSunetid: "hramesh" },
    { gradedBySunetid: "kzm", gradedForSunetid: "jduan1" },
    { gradedBySunetid: "kzm", gradedForSunetid: "hwang9" },
    { gradedBySunetid: "kzm", gradedForSunetid: "jedtan" },
    { gradedBySunetid: "kzm", gradedForSunetid: "jtsegall" },
    { gradedBySunetid: "kzm", gradedForSunetid: "rhouliha" },
    { gradedBySunetid: "kzm", gradedForSunetid: "godima2" },
    { gradedBySunetid: "kzm", gradedForSunetid: "iholmes" },
    { gradedBySunetid: "kzm", gradedForSunetid: "jjcorona" },
    { gradedBySunetid: "kzm", gradedForSunetid: "jufeng" },

    { gradedBySunetid: "kzm", gradedForSunetid: "iproulx" },

    { gradedBySunetid: "kzm", gradedForSunetid: "johnwhit" },

    { gradedBySunetid: "kzm", gradedForSunetid: "jwomers" },

    { gradedBySunetid: "garylee", gradedForSunetid: "cjbillov" },

    { gradedBySunetid: "garylee", gradedForSunetid: "collinw" },

    { gradedBySunetid: "garylee", gradedForSunetid: "beb619" },

    { gradedBySunetid: "garylee", gradedForSunetid: "clavelli" },

    { gradedBySunetid: "garylee", gradedForSunetid: "dcocuzzo" },

    { gradedBySunetid: "garylee", gradedForSunetid: "bgott" },

    { gradedBySunetid: "garylee", gradedForSunetid: "claytons" },

    { gradedBySunetid: "garylee", gradedForSunetid: "crwong" },

    { gradedBySunetid: "garylee", gradedForSunetid: "dfrankl" },

    { gradedBySunetid: "garylee", gradedForSunetid: "eymyers" },

    { gradedBySunetid: "garylee", gradedForSunetid: "bmittl" },

    { gradedBySunetid: "garylee", gradedForSunetid: "cyrusrc" },

    { gradedBySunetid: "garylee", gradedForSunetid: "diannena" },

    { gradedBySunetid: "garylee", gradedForSunetid: "cmmills" },

    { gradedBySunetid: "garylee", gradedForSunetid: "daj17" },

    { gradedBySunetid: "garylee", gradedForSunetid: "dmelende" },

    { gradedBySunetid: "garylee", gradedForSunetid: "eefield" },

    { gradedBySunetid: "garylee", gradedForSunetid: "cooperl1" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "shaurya" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "tzhang54" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "yh3483" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "rtai1" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "shijial" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "vsjain" },

    { gradedBySunetid: "bbunge", gradedForSunetid: "kramdass" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "saamm" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "sjain2" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "tle16" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "whlui" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "samuelgr" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "ssaleh" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "tommyt" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "wretch" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "sananth2" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "sukolsak" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "trzhao" },

    { gradedBySunetid: "jkevin", gradedForSunetid: "yctsai" },

    { gradedBySunetid: "jismael", gradedForSunetid: "karchie" },

    { gradedBySunetid: "kzm", gradedForSunetid: "keenon" }
];

var assignment = 6;
var GradeReport = Parse.Object.extend("GradeReport");
_.each(graders, function(grader) {
    var gradeReport = new GradeReport();
    gradeReport.save({
        assignment: assignment,
        gradedBySunetid: grader.gradedBySunetid,
        gradedForSunetid: grader.gradedForSunetid,
        grade: "",
        isSent: 0
    });
});
