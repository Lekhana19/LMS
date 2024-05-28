const db = require('../config/dbconfig');

// Function to fetch all faculty members
exports.getFaculties = async (req, res) => {
    try {
        // Assuming 'Faculty' role has a specific ID, e.g., 2
        const query = `
            SELECT u.UserID AS id, CONCAT(u.FirstName, ' ', u.LastName) AS name
            FROM Users u
            INNER JOIN Roles r ON u.RoleID = r.RoleID
            WHERE r.RoleName = 'professor'
            ORDER BY u.LastName, u.FirstName;
        `;

        const [faculties] = await db.query(query);
        res.json({
            status: 'success',
            data: faculties
        });
    } catch (error) {
        console.error('Failed to fetch faculties:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve faculties: ' + error.message
        });
    }
};
