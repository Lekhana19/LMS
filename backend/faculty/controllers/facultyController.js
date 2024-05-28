const db = require('../config/dbConfig');

// Add other methods as necessary for each functionality
exports.getCourses = (req, res) => {
  // Assume req.params.facultyId is provided
  const facultyId = req.params.facultyId;
  db.query('SELECT * FROM courses WHERE facultyid = ?', [facultyId], (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};
