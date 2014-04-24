<?php

// Include StanfordEmail
include_once("stanford.email.php");

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

    if ($val1 == $val2) {
        if ($comment1["position"] != $comment2["position"]) {
            return ($comment1["position"] < $comment2["position"]) ? -1 : 1;
        }
        return ($comment2["popularity"] < $comment1["popularity"]) ? -1 : 1;
    }
    return ($val1 < $val2) ? -1 : 1;
}

$USER = "bbunge"; //$_SERVER['WEBAUTH_USER'];

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
                $db = new DB();

                $result = $db->query('SELECT * FROM grade_reports');
                $results = array();
                while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                    array_push($results, $row);
                }

                foreach ($results as &$result) {
                    $gradeReportID = $result["id"];
                    global $USER;
                    $sql = <<<SQL
SELECT id, isPublic, author, commentText as text, commentType as type, value, popularity, position
FROM grade_reports_comments JOIN comments ON comment_id = id
WHERE grade_report_id = $gradeReportID
UNION
SELECT id, isPublic, author, commentText as text, commentType as type, "", popularity, position
FROM comments
WHERE id not in (select comment_id from grade_reports_comments WHERE grade_report_id = $gradeReportID)
AND isPublic = 1
ORDER BY position ASC, type ASC, popularity DESC
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

            }

            if ($method == "PUT") {
                $gradeReportID = SQLite3::escapeString($params["id"]);
                $lateDayCount = SQLite3::escapeString($params["lateDayCount"]);
                $grade = SQLite3::escapeString($params["grade"]);
                $sql = "UPDATE grade_reports SET grade = '$grade', lateDayCount = $lateDayCount WHERE id = $gradeReportID";
                $db = new DB();
                $success = $db->exec($sql);
                $response = array();
                if ($success) {
                    $response["lateDayCount"] = $lateDayCount;
                    $response["grade"] = $grade;
                }
                echo json_encode($response);
                return;
            }

            if ($method == "DELETE") {

            }
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
                $successGradeReportComment = $db->exec($sqlGradeReportComment);
                $successComment = $db->exec($sqlComment);

                // TODO: make more effecient (only update this comment's popularity)
                // Only consider popularity for "Other" comments
                $sqlPopularity = "update comments set popularity = " .
                    "(select count(*) from grade_reports_comments where comment_id = id and value = '1') " .
                    "WHERE commentType = 'OTHER'";
                $db->exec($sqlPopularity);

                $response = array();
                if ($successComment) {
                    $response["isPublic"] = $isPublic;
                    $response["text"] = $text;
                    $response["type"] = $type;
                }
                if ($successGradeReportComment) {
                    $response["value"] = $value;
                }

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
            $from = $params["from"];
            // TODO: make real
            $to = "bbunge@stanford.edu";//$params["to"];
            $replyTo = $params["replyTo"];
            $subject = $params["subject"];
            $body = $params["body"];

            $email = new StanfordEmail();
            $email->set_sender($from, $from);
            $email->set_recipient($to, $to);
            $email->set_subject($subject);
            $email->add_bcc("bbunge@stanford.edu", "Brie Bunge");
            $email->add_reply_to($replyTo, $replyTo);

            $email->set_body($body, $is_html = true);

            $response = array();
            if ($email->send()) {
                $response["success"] = true;
                $response["message"] = "Message sent successfully!";
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
