const db = require('../config/dbconfig');

// Function to list all students
exports.listStudents = async (req, res) => {
    try {
        const { courseID } = req.query; // Optionally filter by courseID if provided
        let query = `
            SELECT u.UserID, u.FirstName, u.LastName, u.Email, c.Title AS Course
            FROM Users u
            JOIN Enrollments e ON u.UserID = e.StudentID
            JOIN courses c ON e.CourseID = c.CourseID
        `;

        if (courseID) {
            query += ` WHERE c.CourseID = ?`;
            const [students] = await db.query(query, [courseID]);
            res.status(200).json({
                status: 'success',
                results: students.length,
                data: students
            });
        } else {
            const [students] = await db.query(query);
            res.status(200).json({
                status: 'success',
                results: students.length,
                data: students
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve students: ' + error.message
        });
    }
};
