const db = require('../config/dbConfig');
const db_async = require('../config/dbConfig-async');

exports.getStudentListForCourse = (req, res) => {
    const courseId = req.params.courseId;

    const query = `
        SELECT Users.userId, Users.firstname, Users.lastname, Users.email
        FROM Enrollments
        INNER JOIN Users ON Enrollments.studentId = Users.userId
        WHERE Enrollments.courseId = ?
    `;

    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Error fetching student list:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
};

exports.getGradesForCourse = (req, res) => {
    const courseId = req.params.courseId;

    const query = `
        SELECT CONCAT(Users.firstname, ' ', Users.lastname) AS student_name, grades.grade, Enrollments.studentid as studentId
        FROM grades
        INNER JOIN Enrollments ON grades.enrollmentid = Enrollments.enrollmentid
        INNER JOIN Users ON Enrollments.studentid = Users.userid
        WHERE Enrollments.courseid = ? AND grades.assignmentId IS NULL AND grades.quizId IS NULL
    `;

    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Error fetching grades:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
};

exports.assignCourseGrade = (req, res) => {
    const courseId = req.params.courseId;
    const gradeData = req.body;

    // Validate request data
    if (!courseId || !Array.isArray(gradeData) || gradeData.length === 0) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';

    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Process each grade assignment
        gradeData.forEach(grade => {
            const { studentId, grade: studentGrade, marks } = grade;

            if (!studentId || !studentGrade) {
                console.error('Invalid grade data:', grade);
                return; // Skip processing this grade data
            }

            // Check if the student exists
            const studentQuery = 'SELECT userId FROM Users WHERE userId = ? AND roleId = 2'; // Assuming roleId 2 is for students

            db.query(studentQuery, [studentId], (err, studentResult) => {
                if (err) {
                    console.error('Error checking student existence:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                if (studentResult.length === 0) {
                    console.error('Student not found:', studentId);
                    return; // Skip processing this grade data
                }

                // Get the enrollmentId for the given courseId and studentId
                const enrollmentQuery = 'SELECT enrollmentId FROM Enrollments WHERE courseId = ? AND studentId = ?';
                db.query(enrollmentQuery, [courseId, studentId], (err, enrollmentResult) => {
                    if (err) {
                        console.error('Error getting enrollment ID:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    if (enrollmentResult.length === 0) {
                        console.error('Enrollment not found for student:', studentId);
                        return; // Skip processing this grade data
                    }

                    const enrollmentId = enrollmentResult[0].enrollmentId;

                    // Check if a grade record already exists for the given enrollmentId
                    const existingGradeQuery = 'SELECT gradeId FROM grades WHERE enrollmentId = ? AND assignmentid IS NULL AND quizid IS NULL';
                    db.query(existingGradeQuery, [enrollmentId], (err, gradeResult) => {
                        if (err) {
                            console.error('Error checking existing grade:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }

                        if (gradeResult.length > 0) {
                            // Update the existing grade record
                            const updateQuery = 'UPDATE grades SET grade = ?, marks = ? WHERE enrollmentId = ? AND assignmentid IS NULL AND quizid IS NULL';
                            db.query(updateQuery, [studentGrade, marks, enrollmentId], (err, updateResult) => {
                                if (err) {
                                    console.error('Error updating grade:', err);
                                    return res.status(500).json({ error: 'Internal Server Error' });
                                }
                            });
                        } else {
                            // Insert a new grade record
                            const insertQuery = 'INSERT INTO grades (enrollmentId, grade, marks) VALUES (?, ?, ?)';
                            db.query(insertQuery, [enrollmentId, studentGrade, marks], (err, insertResult) => {
                                if (err) {
                                    console.error('Error inserting grade:', err);
                                    return res.status(500).json({ error: 'Internal Server Error' });
                                }
                            });
                        }
                    });
                });
            });
        });

        res.status(200).json({ message: 'Course grades assigned successfully' });
    });
};


exports.addAssignmentMarks = async (req, res) => {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;
    const marksData = req.body;

    // Validate request data
    if (!Array.isArray(marksData) || marksData.length === 0) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    const connection = await db_async.getConnection(); // Assumes you have a pool or similar
    try {
        await connection.beginTransaction();

        for (let mark of marksData) {
            const { studentId, marks } = mark;

            if (!studentId || marks === undefined || marks === null) {
                console.error('Invalid marks data:', mark);
                continue; // Skip processing this marks data
            }

            // Check if the student is enrolled in the course
            const [enrollmentResult] = await connection.query(
                'SELECT enrollmentId FROM Enrollments WHERE courseId = ? AND studentId = ?',
                [courseId, studentId]
            );

            if (enrollmentResult.length === 0) {
                console.error(`Student ${studentId} not enrolled in course ${courseId}`);
                continue;
            }

            const enrollmentId = enrollmentResult[0].enrollmentId;

            // Check if a grade record already exists for the given enrollmentId and assignmentId
            const [gradeResult] = await connection.query(
                'SELECT gradeId FROM grades WHERE enrollmentId = ? AND assignmentId = ?',
                [enrollmentId, assignmentId]
            );

            if (gradeResult.length > 0) {
                // Update the existing grade record
                await connection.query(
                    'UPDATE grades SET marks = ? WHERE enrollmentId = ? AND assignmentId = ?',
                    [marks, enrollmentId, assignmentId]
                );
            } else {
                // Insert a new grade record
                await connection.query(
                    'INSERT INTO grades (enrollmentId, assignmentId, marks) VALUES (?, ?, ?)',
                    [enrollmentId, assignmentId, marks]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ message: 'Assignment marks processed successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error processing marks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};


exports.addQuizMarks = async (req, res) => {
    const courseId = req.params.courseId;
    const quizId = req.params.quizId;
    const marksData = req.body;

    // Validate request data
    if (!Array.isArray(marksData) || marksData.length === 0) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    const connection = await db_async.getConnection(); // Assumes you have a pool or similar
    try {
        await connection.beginTransaction();

        for (let mark of marksData) {
            const { studentId, marks } = mark;

            if (!studentId || marks === undefined || marks === null) {
                console.error('Invalid marks data:', mark);
                continue; // Skip processing this marks data
            }

            // Check if the course and quiz exist
            const [quizResult] = await connection.query(
                'SELECT quizId FROM quizzes WHERE quizId = ? AND courseId = ?',
                [quizId, courseId]
            );

            if (quizResult.length === 0) {
                return res.status(404).json({ error: 'Quiz not found' });
            }

            // Check if the student is enrolled in the course
            const [enrollmentResult] = await connection.query(
                'SELECT enrollmentId FROM Enrollments WHERE courseId = ? AND studentId = ?',
                [courseId, studentId]
            );

            if (enrollmentResult.length === 0) {
                return res.status(404).json({ error: 'Student is not enrolled in the course' });
            }

            const enrollmentId = enrollmentResult[0].enrollmentId;

            // Check if a grade record already exists for the given enrollmentId and quizId
            const [gradeResult] = await connection.query(
                'SELECT gradeId FROM grades WHERE enrollmentId = ? AND quizId = ?',
                [enrollmentId, quizId]
            );

            if (gradeResult.length > 0) {
                // Update the existing grade record
                await connection.query(
                    'UPDATE grades SET marks = ? WHERE enrollmentId = ? AND quizId = ?',
                    [marks, enrollmentId, quizId]
                );
            } else {
                // Insert a new grade record
                await connection.query(
                    'INSERT INTO grades (enrollmentId, quizId, marks) VALUES (?, ?, ?)',
                    [enrollmentId, quizId, marks]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ message: 'Quiz marks processed successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error processing quiz marks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};


exports.viewAssignmentMarks = (req, res) => {
    const { courseId, assignmentId } = req.params;

    // Validate request data
    if (!courseId || !assignmentId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if the course and assignment exist
    const assignmentQuery = 'SELECT assignmentId FROM assignments WHERE assignmentId = ? AND courseId = ?';

    db.query(assignmentQuery, [assignmentId, courseId], (err, assignmentResult) => {
        if (err) {
            console.error('Error checking assignment existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (assignmentResult.length === 0) {
            return res.status(404).json({ error: 'Assignment not found in the course' });
        }

        // Retrieve marks for the assignment in the course
        const marksQuery = `
            SELECT Users.userId as studentId, Users.firstname, Users.lastname, grades.marks, submissions.submissiondocurl
            FROM Enrollments
            INNER JOIN Users ON Enrollments.studentId = Users.userId
            LEFT JOIN grades ON Enrollments.enrollmentId = grades.enrollmentId AND grades.assignmentId = ?
            LEFT JOIN AssignmentSubmissions AS submissions ON Enrollments.studentId = submissions.userId AND submissions.assignmentId = ?
            WHERE Enrollments.courseId = ?
        `;

        db.query(marksQuery, [assignmentId, assignmentId, courseId], (err, marksResult) => {
            if (err) {
                console.error('Error retrieving assignment marks:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json(marksResult);
        });
    });
};

exports.viewQuizMarks = (req, res) => {
    const { courseId, quizId } = req.params;

    // Validate request data
    if (!courseId || !quizId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if the course and quiz exist
    const quizQuery = 'SELECT quizId FROM quizzes WHERE quizId = ? AND courseId = ?';

    db.query(quizQuery, [quizId, courseId], (err, quizResult) => {
        if (err) {
            console.error('Error checking quiz existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (quizResult.length === 0) {
            return res.status(404).json({ error: 'Quiz not found in the course' });
        }

        // Retrieve marks for the quiz in the course
        const marksQuery = `
            SELECT Users.userId as studentId, Users.firstname, Users.lastname, grades.marks, submissions.submissiondocurl
            FROM Enrollments
            INNER JOIN Users ON Enrollments.studentId = Users.userId
            LEFT JOIN grades ON Enrollments.enrollmentId = grades.enrollmentId AND grades.quizId = ?
            LEFT JOIN QuizSubmissions AS submissions ON Enrollments.studentId = submissions.userId AND submissions.quizId = ?
            WHERE Enrollments.courseId = ?
        `;

        db.query(marksQuery, [quizId, quizId, courseId], (err, marksResult) => {
            if (err) {
                console.error('Error retrieving quiz marks:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json(marksResult);
        });
    });
};

exports.postAnnouncement = (req, res) => {
    const { courseId } = req.params;
    const { title, content } = req.body;

    // Validate request data
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Insert announcement into the database
        const query = `
            INSERT INTO Announcements (courseId, title, content, postdate)
            VALUES (?, ?, ?, NOW())
        `;

        db.query(query, [courseId, title, content], (err, result) => {
            if (err) {
                console.error('Error posting announcement:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(201).json({ message: 'Announcement posted successfully' });
        });
    });
};

exports.postAssignment = (req, res) => {
    const { courseId } = req.params;
    const { title, description, dueDate, s3url, maxmarks } = req.body;

    // Validate request data
    console.log
    if (!title || !description || !dueDate || !maxmarks) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Insert assignment into the database
        const query = `
            INSERT INTO assignments (courseId, title, description, dueDate, maxmarks)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(query, [courseId, title, description, dueDate, s3url, maxmarks], (err, result) => {
            if (err) {
                console.error('Error posting assignment:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const assignmentId = result.insertId;
            res.status(201).json({ message: 'Assignment posted successfully', assignmentId });
        });
    });
};


// Quiz API
exports.postQuiz = (req, res) => {
    const { courseId } = req.params;
    const { title, description, dueDate, s3url, maxmarks } = req.body;

    // Validate request data
    if (!title || !description || !dueDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Insert quiz into the database
        const query = `
            INSERT INTO quizzes (courseId, title, description, dueDate, maxmarks)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(query, [courseId, title, description, dueDate, s3url, maxmarks], (err, result) => {
            if (err) {
                console.error('Error posting quiz:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const quizId = result.insertId;
            res.status(201).json({ message: 'Quiz posted successfully', quizId });
        });
    });
};

exports.listQuizzes = (req, res) => {
    const courseId = req.params.courseId;

    // Validate request data
    if (!courseId) {
        return res.status(400).json({ error: 'Missing courseId parameter' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';

    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Retrieve quizzes for the course
        const quizzesQuery = 'SELECT quizId, title, description, duedate, s3url FROM quizzes WHERE courseId = ?';

        db.query(quizzesQuery, [courseId], (err, quizzesResult) => {
            if (err) {
                console.error('Error retrieving quizzes:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json(quizzesResult);
        });
    });
};

exports.listAssignments = (req, res) => {
    const courseId = req.params.courseId;

    // Validate request data
    if (!courseId) {
        return res.status(400).json({ error: 'Missing courseId parameter' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';

    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Retrieve assignments for the course
        const assignmentsQuery = 'SELECT assignmentId, title, description, maxmarks, duedate, s3url FROM assignments WHERE courseId = ?';

        db.query(assignmentsQuery, [courseId], (err, assignmentsResult) => {
            if (err) {
                console.error('Error retrieving assignments:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json(assignmentsResult);
        });
    });
};


exports.listAssignmentSubmissions = (req, res) => {
    const { courseId, assignmentId } = req.params;

    // Validate request data
    if (!courseId || !assignmentId) {
        return res.status(400).json({ error: 'Missing courseId or assignmentId parameter' });
    }

    // Check if the course and assignment exist
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    const assignmentQuery = 'SELECT assignmentId FROM assignments WHERE assignmentId = ? AND courseId = ?';

    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        db.query(assignmentQuery, [assignmentId, courseId], (err, assignmentResult) => {
            if (err) {
                console.error('Error checking assignment existence:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (assignmentResult.length === 0) {
                return res.status(404).json({ error: 'Assignment not found in the course' });
            }

            // Retrieve submission records for the assignment
            const submissionsQuery = `
                SELECT Users.userId, Users.firstname, Users.lastname, 
                       submissionId, submissiondocurl, comments
                FROM Users
                LEFT JOIN AssignmentSubmissions ON Users.userId = AssignmentSubmissions.UserId
                WHERE AssignmentSubmissions.AssignmentId = ? AND Users.roleId = 2
            `;

            db.query(submissionsQuery, [assignmentId], (err, submissionsResult) => {
                if (err) {
                    console.error('Error retrieving assignment submissions:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.status(200).json(submissionsResult);
            });
        });
    });
};

exports.listQuizSubmissions = (req, res) => {
    const { courseId, quizId } = req.params;

    // Validate request data
    if (!courseId || !quizId) {
        return res.status(400).json({ error: 'Missing courseId or quizId parameter' });
    }

    // Check if the course and quiz exist
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    const quizQuery = 'SELECT quizId FROM quizzes WHERE quizId = ? AND courseId = ?';

    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        db.query(quizQuery, [quizId, courseId], (err, quizResult) => {
            if (err) {
                console.error('Error checking quiz existence:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (quizResult.length === 0) {
                return res.status(404).json({ error: 'Quiz not found in the course' });
            }

            // Retrieve submission records for the quiz
            const submissionsQuery = `
                SELECT Users.userId, Users.firstname, Users.lastname, 
                       submissionId, submissiondocurl, comments
                FROM Users
                LEFT JOIN QuizSubmissions ON Users.userId = QuizSubmissions.UserId
                WHERE QuizSubmissions.QuizId = ? AND Users.roleId = 2
            `;

            db.query(submissionsQuery, [quizId], (err, submissionsResult) => {
                if (err) {
                    console.error('Error retrieving quiz submissions:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.status(200).json(submissionsResult);
            });
        });
    });
};

exports.getAnnouncements = (req, res) => {
    const { courseId } = req.params;

    // Validate request data
    if (!courseId) {
        return res.status(400).json({ error: 'Missing course ID' });
    }

    // Query to fetch announcements for the course ordered by post date
    const announcementsQuery = `
        SELECT title, content, postdate
        FROM Announcements
        WHERE courseid = ?
        ORDER BY postdate DESC
    `;

    // Execute the query
    db.query(announcementsQuery, [courseId], (err, result) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send the result as JSON response
        res.status(200).json(result);
    });
};

const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Initialize S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Multer setup for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
}).single('file');

// Function to upload file to S3 and update database
exports.uploadAssignmentFile = (req, res) => {
    const { courseId, assignmentId } = req.params;

    upload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Upload file to S3
            const s3Params = {
                Bucket: process.env.ASSIGNMENTS_S3_BUCKET_NAME,
                Key: `${uuidv4()}_${file.originalname}`, // Unique key for the file
                Body: file.buffer,
                ContentType: file.mimetype
            };

            const s3UploadResult = await s3.upload(s3Params).promise();

            // Update S3 link in assignments table
            const updateResult = await updateAssignmentFile(courseId, assignmentId, s3UploadResult.Location);

            res.status(200).json({ message: 'File uploaded successfully', updateResult });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

// Function to update assignment file URL in the database
const updateAssignmentFile = async (courseId, assignmentId, fileUrl) => {
    try {
        const updateQuery = `
            UPDATE assignments
            SET s3url = ?
            WHERE courseId = ? AND assignmentId = ?
        `;
        const updateValues = [fileUrl, courseId, assignmentId];

        await db_async.query(updateQuery, updateValues);

        return { success: true, message: 'Assignment file URL updated successfully' };
    } catch (error) {
        console.error('Error updating assignment file:', error);
        return { success: false, message: 'Internal Server Error' };
    }
};

// Function to upload file to S3 and update database
exports.uploadQuizFile = (req, res) => {
    const { courseId, quizId } = req.params;

    upload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            // Upload file to S3
            const s3Params = {
                Bucket: process.env.QUIZZES_S3_BUCKET_NAME,
                Key: `${uuidv4()}_${file.originalname}`, // Unique key for the file
                Body: file.buffer,
                ContentType: file.mimetype
            };

            const s3UploadResult = await s3.upload(s3Params).promise();

            console.log('s3 location: ', s3UploadResult.Location)

            // Update S3 link in assignments table
            const updateResult = await updateQuizFile(courseId, quizId, s3UploadResult.Location);

            res.status(200).json({ message: 'File uploaded successfully', updateResult });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

// Function to update assignment file URL in the database
const updateQuizFile = async (courseId, quizId, fileUrl) => {
    try {
        const updateQuery = `
            UPDATE quizzes
            SET s3url = ?
            WHERE courseId = ? AND quizId = ?
        `;
        const updateValues = [fileUrl, courseId, quizId];

        await db_async.query(updateQuery, updateValues);

        return { success: true, message: 'Quiz file URL updated successfully' };
    } catch (error) {
        console.error('Error updating quiz file:', error);
        return { success: false, message: 'Internal Server Error' };
    }
};

exports.postSyllabus = (req, res) => {
    const { courseId } = req.params;
    const { syllabus } = req.body;

    // Validate request data
    if (!syllabus) {
        return res.status(400).json({ error: 'Syllabus content is required' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Insert or update syllabus in the database
        const insertQuery = 'INSERT INTO syllabus (courseid, syllabus) VALUES (?, ?) ON DUPLICATE KEY UPDATE syllabus = VALUES(syllabus)';
        db.query(insertQuery, [courseId, syllabus], (err, result) => {
            if (err) {
                console.error('Error posting syllabus:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(201).json({ message: 'Syllabus posted successfully' });
        });
    });
};

exports.getSyllabus = (req, res) => {
    const { courseId } = req.params;

    // Check if the course exists
    const courseQuery = 'SELECT courseId FROM courses WHERE courseId = ?';
    db.query(courseQuery, [courseId], (err, courseResult) => {
        if (err) {
            console.error('Error checking course existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (courseResult.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Retrieve syllabus for the given course
        const syllabusQuery = 'SELECT courseId, syllabus FROM syllabus WHERE courseId = ?';
        db.query(syllabusQuery, [courseId], (err, syllabusResult) => {
            if (err) {
                console.error('Error retrieving syllabus:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // If syllabus doesn't exist, return null
            if (syllabusResult.length === 0) {
                return res.status(200).json({ courseId, syllabus: null });
            }

            // Syllabus exists, return it
            const syllabus = syllabusResult[0];
            res.status(200).json(syllabus);
        });
    });
};

exports.publishCourse = (req, res) => {
    const facultyId = 2
    const courseId = req.params.courseId;

    // Update the IsPublished field in the Courses table
    const updateQuery = 'UPDATE courses SET IsPublished = ? WHERE FacultyId = ? AND CourseId = ?';

    db.query(updateQuery, [1, facultyId, courseId], (err, result) => {
        if (err) {
            console.error('Error publishing course:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json({ message: 'Course published successfully' });
    });
};