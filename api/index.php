<?php

class DB extends SQLite3
{
    function __construct()
    {
        $this->open('cs193p_grading.db');
    }
}

// TODO
$USER = "bbunge";//$_SERVER['WEBAUTH_USER'];

$routes = array(
    'index' => function ($method, $params) {
        },
    'user' => function($method, $params) {
            global $USER;
            $response = array("user" => $USER);
            echo json_encode($response);
        },
    'grade-reports' => function ($method, $params) {
            if ($method == "GET") {
                $db = new DB();

                $result = $db->query('SELECT * FROM grade_reports');
                $results = array();
                while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                    array_push($results, $row);
                }

                foreach ($results as &$result) {
                    $sql = "SELECT id, commentText, commentType, value from grade_reports_comments " .
                        "JOIN comments ON comment_id = comments.id " .
                        "WHERE grade_report_id = " . $result["id"];
                    $commentQuery = $db->query($sql);
                    $comments = array();
                    while ($row = $commentQuery->fetchArray(SQLITE3_ASSOC)) {
                        array_push($comments, array(
                            "id" => $row["id"],
                            "type" => $row["commentType"],
                            "text" => $row["commentText"]
                        ));
                    }
                    $result["comments"] = $comments;
                }

                echo json_encode($results);
                return;
            }

            if ($method == "POST") {
            }
        },
    'comments' => function ($method, $params) {
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
        }
);

$method = $_SERVER['REQUEST_METHOD'];
$urlElements = explode('/', $_SERVER['PATH_INFO']);
array_shift($urlElements);
$params = $method == "GET" ? $_GET : ($method == "POST" ? $_POST : null);
if (count($urlElements) == 0) $urlElements = ['index'];

header('Content-Type: application/json');
$routes[$urlElements[0]]($method, $params);
