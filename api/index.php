<?php

include_once("stanford.email.php");

if ($_SERVER["SERVER_NAME"] == "localhost") {
    $_SERVER['WEBAUTH_USER'] = "bbunge";
}

$USER = $_SERVER['WEBAUTH_USER'];

class DB extends SQLite3
{
    function __construct()
    {
        $this->open('cs193p_grading.db');
    }
}

function commentCmp($comment1, $comment2)
{
    $val1 = -1;
    $val2 = -1;
    if ($comment1["type"] == "REQUIRED_TASK") $val1 = 1;
    else if ($comment1["type"] == "EVALUATION") $val1 = 2;
    else if ($comment1["type"] == "EXTRA_CREDIT") $val1 = 3;
    else if ($comment1["type"] == "OTHER") $val1 = 4;
    if ($comment2["type"] == "REQUIRED_TASK") $val2 = 1;
    else if ($comment2["type"] == "EVALUATION") $val2 = 2;
    else if ($comment2["type"] == "EXTRA_CREDIT") $val2 = 3;
    else if ($comment2["type"] == "OTHER") $val2 = 4;

    if ($val1 != $val2)
        return ($val1 < $val2) ? -1 : 1;

    if ($comment1["position"] != $comment2["position"])
        return ($comment1["position"] < $comment2["position"]) ? -1 : 1;

    if ($comment1["isPublic"] != $comment2["isPublic"])
        return ($comment1["isPublic"] < $comment2["isPublic"]) ? -1 : 1;

    return ($comment2["popularity"] < $comment1["popularity"]) ? -1 : 1;
}

$routes = array(
    'index' => function ($method, $params, $urlElements) {
            if ($method == "GET") {
                return;
            }

            if ($method == "POST") {
                return;
            }

            if ($method == "PUT") {
                return;
            }

            if ($method == "DELETE") {
                return;
            }
        },

    'user' => function () {
            global $USER;
            $response = array("user" => $USER);
            echo json_encode($response);
        },

    'grade-reports' => function ($method, $params, $urlElements) {

            if ($method == "GET") {
                if (count($urlElements) < 1) return;
                $assignment = SQLite3::escapeString($urlElements[0]);
                $grader = null;
                if (count($urlElements) >= 2)
                    $grader = SQLite3::escapeString($urlElements[1]);

                $db = new DB();

                if ($grader) {
                    $sql = "SELECT * FROM grade_reports WHERE assignment = $assignment AND gradedBySunetid = '$grader' ORDER BY gradedForSunetid ASC";
                } else {
                    $sql = "SELECT * FROM grade_reports WHERE assignment = $assignment ORDER BY gradedBySunetid ASC, gradedForSunetid ASC";
                }

                $result = $db->query($sql);

                $results = array();
                while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                    array_push($results, $row);
                }

                foreach ($results as &$result) {
                    $gradeReportID = $result["id"];
                    $assignment = $result["assignment"];
                    $sql = <<<SQL
SELECT id, isPublic, author, commentText as text, commentType as type, value, popularity, position
FROM grade_reports_comments JOIN comments ON comment_id = id
WHERE grade_report_id = $gradeReportID AND assignment = $assignment
UNION
SELECT id, isPublic, author, commentText as text, commentType as type, "", popularity, position
FROM comments
WHERE id not in (select comment_id from grade_reports_comments WHERE grade_report_id = $gradeReportID)
AND isPublic = 1 AND assignment = $assignment
ORDER BY position ASC, type ASC, isPublic ASC, popularity DESC
SQL;
                    $commentQuery = $db->query($sql);
                    $comments = array();
                    while ($row = $commentQuery->fetchArray(SQLITE3_ASSOC)) {
                        $row["gradeReportID"] = $gradeReportID;
                        $row["isPublic"] = $row["isPublic"] == 1 ? true : false;
                        $row["value"] = $row["value"] != null ? $row["value"] : "";
                        array_push($comments, $row);
                    }
                    usort($comments, "commentCmp");
                    $result["comments"] = $comments;
                }

                echo json_encode($results);
                return;
            }


            if ($method == "POST") {
                $assignment = SQLite3::escapeString($params["assignment"]);
                $gradedForSunetid = SQLite3::escapeString($params["gradedForSunetid"]);
                $gradedBySunetid = SQLite3::escapeString($params["gradedBySunetid"]);

                $sql = <<<SQL
INSERT INTO grade_reports (assignment, isSent, gradedForSunetid, gradedBySunetid)
VALUES ($assignment, 0, "$gradedForSunetid", "$gradedBySunetid")
SQL;
                $db = new DB();
                $success = $db->query($sql);
                if (!$success) {
                    http_response_code(500);
                    return;
                }

                $response = array();
                $response["id"] = $db->lastInsertRowID();

                $gradeReportID = $response["id"];
                $sql = <<<SQL
SELECT id, isPublic, author, commentText as text, commentType as type, popularity, position
FROM comments
WHERE id not in (select comment_id from grade_reports_comments WHERE grade_report_id = $gradeReportID)
AND isPublic = 1 AND assignment = $assignment
ORDER BY position ASC, type ASC, isPublic ASC, popularity DESC
SQL;
                $commentQuery = $db->query($sql);
                $comments = array();
                while ($row = $commentQuery->fetchArray(SQLITE3_ASSOC)) {
                    $row["gradeReportID"] = $gradeReportID;
                    $row["isPublic"] = $row["isPublic"] == 1 ? true : false;
                    $row["value"] = "";
                    array_push($comments, $row);
                }
                usort($comments, "commentCmp");
                $response["comments"] = $comments;

                echo json_encode($response);
                return;
            }


            if ($method == "PUT") {
                if (!$params["id"]) {
                  echo json_encode(array());
                  return;
                }
                $gradeReportID = SQLite3::escapeString($params["id"]);

                $db = new DB();
                $response = array();

                $setStr = "";

                if (array_key_exists("lateDayCount", $params) && $params["lateDayCount"] !== "") {
                    $lateDayCount = SQLite3::escapeString($params["lateDayCount"]);
                    $setStr .= "lateDayCount = $lateDayCount";
                    $response["lateDayCount"] = $lateDayCount;
                } else {
                    $setStr .= "lateDayCount = NULL";
                    $response["lateDayCount"] = "";
                }

                if (array_key_exists("grade", $params)) {
                    if (!is_string($params["grade"])) $params["grade"] = "";
                    $grade = SQLite3::escapeString($params["grade"]);
                    $setStr .= ", grade = '$grade'";
                    $response["grade"] = $grade;
                }

                $sql = "UPDATE grade_reports SET $setStr WHERE id = $gradeReportID";
                $success = $db->exec($sql);
                if ($success) {
                    echo json_encode($response);
                    return;
                }

                echo json_encode(array());
                return;
            }


            if ($method == "DELETE") {
                if (count($urlElements) < 1) return;
                // pop last element because we aren't sure whether the url is prefixed
                // with the assignment and or grader. but, we know the last element is the
                // grade report id.
                $gradeReportID = SQLite3::escapeString(array_pop($urlElements));
                $db = new DB();
                $db->exec("DELETE FROM grade_reports WHERE id = $gradeReportID");
                $db->exec("DELETE FROM grade_reports_comments WHERE grade_report_id = $gradeReportID");
            }
        },

    'grade-report-mark-as-not-submitted' => function($method, $params, $urlElements) {
            if (count($urlElements) < 1) return;

            $gradeReportID = SQLite3::escapeString($urlElements[0]);
            $sql = <<<SQL
INSERT INTO grade_reports_not_submitted
(assignment, gradedBySunetid, gradedForSunetid)
VALUES (
    (SELECT assignment FROM grade_reports WHERE id = $gradeReportID),
    (SELECT gradedBySunetid FROM grade_reports WHERE id = $gradeReportID),
    (SELECT gradedForSunetid FROM grade_reports WHERE id = $gradeReportID)
)
SQL;
            $db = new DB();
            $success = $db->exec($sql);
            $response = array();
            $response["success"] = $success;
            echo json_encode($response);
        },


    'grade-report-comments' => function ($method, $params, $urlElements) {
            if ($method == "GET") {
                return;
            }

            if ($method == "POST") {
                $assignment = SQLite3::escapeString($params["assignment"]);
                $isPublic = $params["isPublic"] == false ? 0 : ($params["isPublic"] == true ? 1 : null);
                $text = SQLite3::escapeString($params["text"]);
                $type = SQLite3::escapeString($params["type"]);
                $author = SQLite3::escapeString($params["author"]);
                $popularity = SQLite3::escapeString($params["popularity"]);

                $sql = "insert into comments " .
                    "(assignment, isPublic, commentText, commentType, author, popularity) " .
                    "VALUES ($assignment, $isPublic, '$text', '$type', '$author', $popularity)";
                $db = new DB();
                $success = $db->exec($sql);

                $response = array();
                if ($success) {
                    $response["id"] = $db->lastInsertRowID();
                }

                echo json_encode($response);
                return;
            }

            if ($method == "PUT") {
                $commentID = SQLite3::escapeString($urlElements[0]);
                $gradeReportID = SQLite3::escapeString($params["gradeReportID"]);
                $value = SQLite3::escapeString($params["value"]);
                $isPublic = $params["isPublic"] == false ? 0 : ($params["isPublic"] == true ? 1 : null);
                $text = SQLite3::escapeString($params["text"]);
                $type = SQLite3::escapeString($params["type"]);

                $sqlGradeReportComment = "insert or replace into grade_reports_comments " .
                    "(grade_report_id, comment_id, value) values ($gradeReportID, $commentID, '$value')";
                $sqlComment = "UPDATE comments SET " .
                    "isPublic = $isPublic, commentText = '$text', commentType = '$type' " .
                    "WHERE id = $commentID";

                $db = new DB();
                $response = array();
                $response["error"] = "";

                $successComment = $db->exec($sqlComment);
                if ($successComment) {
                    $response["isPublic"] = $isPublic;
                    $response["text"] = $params["text"];
                    $response["type"] = $type;
                } else {
                    http_response_code(500);
                    $response["error"] .= $db->lastErrorMsg();
                }

                $successGradeReportComment = $db->exec($sqlGradeReportComment);
                if ($successGradeReportComment) {
                    $response["value"] = $value;
                } else {
                    http_response_code(500);
                    $response["error"] .= $db->lastErrorMsg();
                }

                /* // TODO: make more effecient (only update this comment's popularity) */
                /* // Only consider popularity for "Other" comments */
                /* $sqlPopularity = "update comments set popularity = " . */
                /*     "(select count(*) from grade_reports_comments where comment_id = id and value = '1') " . */
                /*     "WHERE commentType = 'OTHER'"; */
                /* $db->exec($sqlPopularity); */

                echo json_encode($response);
                return;
            }

            if ($method == "DELETE") {
                return;
            }
        },

    'comments' => function ($method, $params, $urlElements) {
            if ($method == "GET") {
                $db = new DB();
                $result = $db->query('SELECT * FROM comments');
                $results = array();
                while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                    array_push($results, $row);
                }
                echo json_encode($results);
                return;
            }

            if ($method == "POST") {

            }

            if ($method == "PUT") {

            }

            if ($method == "DELETE") {

            }
        },

    'sendmail' => function ($method, $params, $urlElements) {
            // TODO: this was a quick hack
            $params = $_POST;

            $from = $params["from"];
            $to = $params["to"];
            $replyTo = $params["replyTo"];
            $subject = $params["subject"];
            $body = $params["body"];

            $email = new StanfordEmail();

            $email->set_sender($from, $from);
            $email->add_reply_to($replyTo, $replyTo);
            $email->add_bcc("bbunge@stanford.edu", "Brie");

            $to = explode(',', $to);
            foreach ($to as $recipient) {
                $email->add_recipient($recipient, $recipient);
            }

            $email->set_subject($subject);
            $email->set_body($body, $is_html = true);

            $response = array();
            if ($email->send()) {
                $response["success"] = true;
                $response["message"] = "Message sent successfully!";
                $response["recipient"] = $to;
            } else {
                $response["success"] = false;
                $response["errors"] = $email->get_errors();
            }

            echo json_encode($response);
        },

    'grade-report-emails' => function ($method, $params, $urlElements) {
            $isSent = SQLite3::escapeString($params["isSent"]);
            $gradeReportID = SQLite3::escapeString($params["gradeReportID"]);
            $sql = "UPDATE grade_reports SET isSent = $isSent where id = $gradeReportID";
            $db = new DB();
            $success = $db->exec($sql);
            $response = array();
            if ($success) {
                $response["isSent"] = $isSent;
            }
            echo json_encode($response);
        }
);

$method = $_SERVER['REQUEST_METHOD'];

$urlElements = explode('/', $_SERVER['PATH_INFO']);
array_shift($urlElements);
if (count($urlElements) == 0) $urlElements = array('index');

$params = array();
if ($method == "PUT" || $method == "POST") {
    $params = json_decode(file_get_contents('php://input'), true);
} else if ($method == "GET") {
    $params = $_GET;
}

header('Content-Type: application/json');
$route = $urlElements[0];
array_shift($urlElements);
$routes[$route]($method, $params, $urlElements);
