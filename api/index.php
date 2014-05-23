<?php

include_once("stanford.email.php");

if ($_SERVER["SERVER_NAME"] == "localhost") {
    $_SERVER['WEBAUTH_USER'] = "bbunge";
}

$USER = $_SERVER['WEBAUTH_USER'];

$routes = array(
    'index' => function ($method, $params, $urlElements) {
            echo "404";
            return;
        },

    'user' => function () {
            global $USER;
            $response = array("user" => $USER);
            echo json_encode($response);
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
