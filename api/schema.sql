DROP TABLE comments;
CREATE TABLE comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment  INTEGER,
  commentType TEXT,
  commentText TEXT,
  author      TEXT,
  isPublic    INTEGER,
  popularity  INTEGER,
  position    INTEGER
);
INSERT INTO comments (assignment, commentType, commentText, isPublic) VALUES (1, 'REQUIRED_TASK', 'hello world req!', 1);
INSERT INTO comments (assignment, commentType, commentText, isPublic) VALUES (1, 'EXTRA_CREDIT', 'hello world ex!', 1);
INSERT INTO comments (assignment, commentType, commentText, isPublic) VALUES (1, 'EVALUATION', 'hello world eval!', 1);
INSERT INTO comments (assignment, commentType, commentText, isPublic) VALUES (1, 'OTHER', 'hello world other!', 1);

INSERT INTO comments (assignment, commentType, commentText, isPublic, popularity) VALUES (1, 'OTHER', 'hello world other!', 1, 20);

CREATE TABLE grade_reports (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment       INTEGER,
  gradedBySunetid  TEXT,
  gradedForSunetid TEXT,
  lateDayCount     INTEGER,
  grade            TEXT,
  isSent           INTEGER
);

DROP TABLE grade_reports_comments;
CREATE TABLE grade_reports_comments (
  grade_report_id INTEGER REFERENCES grade_reports(id) ON DELETE CASCADE,
comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
value TEXT,
CONSTRAINT pk_grade_report_id_comment_id PRIMARY KEY (grade_report_id, comment_id)
);
INSERT INTO grade_reports_comments (grade_report_id, comment_id) VALUES (1, 1);
INSERT INTO grade_reports_comments (grade_report_id, comment_id) VALUES (1, 2);
INSERT INTO grade_reports_comments (grade_report_id, comment_id) VALUES (1, 3);
INSERT INTO grade_reports_comments (grade_report_id, comment_id) VALUES (1, 4);

INSERT INTO grade_reports_comments (grade_report_id, comment_id) VALUES (2, 3);


INSERT INTO comments (assignment, commentType, commentText) VALUES (1, 'OTHER', 'hello world other!');

INSERT INTO grade_reports (assignment, gradedBySunetid, gradedForSunetid, lateDayCount, grade) VALUES (1, 'bbunge', 'bob', 0, 'Check');
INSERT INTO grade_reports (assignment, gradedBySunetid, gradedForSunetid) VALUES (1, 'bbunge', 'bob2');

SELECT
*
FROM grade_reports
  JOIN grade_reports_comments ON grade_report_id = grade_reports.id
  JOIN comments ON comment_id = comments.id;

SELECT
  id, commentText, commentType, count(1) as popularity
FROM grade_reports_comments
  JOIN comments ON comment_id = comments.id
WHERE grade_report_id = 1;


select id, commentText, commentType, count(1) as popularity from comments
  join grade_reports_comments on comment_id = id
  WHERE id not in (select comment_id from grade_reports_comments WHERE grade_report_id = 2)
  AND isPublic = 1
  GROUP BY id
  order by popularity;

select id, commentText, commentType, count(1) as popularity from comments
  join grade_reports_comments on comment_id = id
  WHERE isPublic = 1 OR author = "bbunge"
GROUP BY id
order by popularity DESC;



SELECT id, isPublic, author, commentText, commentType, value, popularity
FROM grade_reports_comments JOIN comments ON comment_id = id
WHERE grade_report_id = 2
UNION
SELECT id, isPublic, author, commentText, commentType, "", popularity
FROM comments
WHERE id not in (select comment_id from grade_reports_comments WHERE grade_report_id = 2)
AND (isPublic = 1 OR author = "bbunge")
ORDER BY popularity DESC;


insert or replace into grade_reports_comments (grade_report_id, comment_id, value) values (1,4,"0")


CREATE TABLE comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment  INTEGER,
  commentType TEXT,
  commentText TEXT,
  author      TEXT,
  isPublic    INTEGER,
    popularity  INTEGER
  , rank INTEGER);

CREATE TABLE grade_reports_not_submitted (
  assignment       INTEGER,
  gradedBySunetid  TEXT,
  gradedForSunetid TEXT
);