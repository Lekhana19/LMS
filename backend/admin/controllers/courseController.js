const db = require('../config/dbconfig');

// Function to view all courses with optional filtering by semester and faculty
exports.viewAllCourses = async (req, res) => {
    const { semester, faculty } = req.query; // Grab semester and faculty from query parameters if they exist

    try {
        // Start building the query
        let query = `
            SELECT 
                c.CourseID AS id, 
                c.Title AS name, 
                c.semester,
                c.year, 
                CONCAT(u.FirstName, ' ', u.LastName) AS faculty
            FROM courses c
            LEFT JOIN Users u ON c.FacultyID = u.UserID
        `;

        // Initialize an array to store query parameters for prepared statement
        const queryParams = [];

        // Add conditions for filtering based on the query parameters provided
        if (semester || faculty) {
            let conditions = [];
            if (semester) {
                conditions.push("c.Semester = ?");
                queryParams.push(semester);
            }
            if (faculty) {
                conditions.push("CONCAT(u.FirstName, ' ', u.LastName) = ?");
                queryParams.push(faculty);
            }
            query += " WHERE " + conditions.join(" AND ");
        }

        // Execute the query
        const [courses] = await db.query(query, queryParams);
        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: {
                courses: courses.map(course => ({
                    id: course.id,
                    name: course.name,
                    semester: course.semester,
                    year: course.year,
                    faculty: course.faculty
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve courses: ' + error.message
        });
    }
};
