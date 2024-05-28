const db = require('../config/dbconfig');

// Function to assign a course to a faculty member
exports.assignCourse = async (req, res) => {
    const { facultyID, courseID } = req.body;  // Only get facultyID and courseID from the request body

    try {
        const updateQuery = `
            UPDATE courses
            SET FacultyID = ?
            WHERE CourseID = ?
        `;

        const [result] = await db.query(updateQuery, [facultyID, courseID]);

        if (result.affectedRows === 0) {
            // No rows were updated, meaning no course was found with the given ID
            return res.status(404).json({
                status: 'error',
                message: 'No course found with the given ID'
            });
        }

        // If the update is successful
        res.status(200).json({
            status: 'success',
            message: 'Course successfully assigned to faculty'
        });
    } catch (error) {
        // Handle any errors during the update
        res.status(500).json({
            status: 'error',
            message: 'Failed to assign course: ' + error.message
        });
    }
};
