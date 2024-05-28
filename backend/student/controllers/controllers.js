const bcrypt = require("bcrypt");
const db = require("../config/dbConfig");

// Controller for user signup
async function getUserId(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error signing up user:", err);
        return res.status(500).json({ error: "Error Fetching courses" });
      }
      console.log(result, email);

      return res.json({ userId: result[0].UserID });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Error hashing password" });
  }
}

async function verify(req, res) {
  const { firstName, lastName, email, password, roleID } = req.body;
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password with the generated salt
    bcrypt.hash(password, salt, function (err, hash) {
      var hashedPassword = hash;
      console.log(roleID);
      db.query("SELECT RoleID FROM Roles WHERE RoleName = ?", roleID, (err, result) => {
        if (err) {
          console.error("Error signing up user:", err);
          return res.status(500).json({ error: "Error signing up user" });
        }
        const role = result[0].RoleID;

        // Insert user into database
        const user = {
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          PasswordHash: hashedPassword,
          RoleID: role,
        };

        db.query("INSERT INTO Users SET ?", user, (err, result) => {
          if (err) {
            console.error("Error signing up user:", err);
            return res.status(500).json({ error: "Error signing up user" });
          }
          const userID = result.insertId; // Get the ID of the inserted user
          const userProfile = {
            UserID: userID,
            NotificationPreferences: "yes", // Assuming the default preference is 'yes'
          };
          db.query("INSERT INTO UserProfiles SET ?", userProfile, (err, result) => {
            if (err) {
              console.error("Error creating user profile:", err);
              return res.status(500).json({ error: "Error creating user profile" });
            }
            console.log("User signed up successfully");
            res.json({ message: "User signed up successfully" });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Error hashing password" });
  }
}

async function getCourses(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }

      const userID = result[0].UserID;

      db.query("SELECT CourseID FROM Enrollments WHERE StudentID = ?", userID, (err, courseIDs) => {
        if (err) {
          console.error("Error fetching course IDs:", err);
          return res.status(500).json({ error: "Error fetching course IDs" });
        }

        const courseIdArray = courseIDs.map((course) => course.CourseID);

        if (courseIdArray.length === 0) {
          // If there are no courses, send an empty object
          return res.json({ courses: [], prev: [] });
        }
        // console.log("Here");
        db.query("SELECT * FROM courses WHERE CourseID IN (?)", [courseIdArray], (err, courses) => {
          if (err) {
            console.error("Error fetching courses:", err);
            return res.status(500).json({ error: "Error fetching courses" });
          }
          var curr = [],
            prev = [];
          for (var i in courses) {
            if (courses[i].Year == "2024") {
              curr.push(courses[i]);
            } else {
              prev.push(courses[i]);
            }
          }
          return res.json({ courses: curr, prev: prev });
        });
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAnnouncements(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, async (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }
      const userID = result[0].UserID;
      const [notify] = await db
        .promise()
        .query("SELECT NotificationPreferences FROM UserProfiles WHERE UserID = ?", [userID]);
      console.log(notify[0].NotificationPreferences);
      if (notify[0].NotificationPreferences === "No") {
        // Send empty objects
        return res.json({ courseTitles: [], announcements: [] });
      }
      db.query("SELECT CourseID FROM Enrollments WHERE StudentID = ?", userID, (err, courseIDs) => {
        if (err) {
          console.error("Error fetching course IDs:", err);
          return res.status(500).json({ error: "Error fetching course IDs" });
        }

        const courseIdArray = courseIDs.map((course) => course.CourseID);

        db.query(
          "SELECT Announcements.*,courses.Title as CourseTitle FROM Announcements " +
            "INNER JOIN courses ON Announcements.CourseID = courses.CourseID " +
            "WHERE Announcements.CourseID IN (?) " +
            "ORDER BY Announcements.PostDate DESC",
          [courseIdArray],
          async (err, announcements) => {
            if (err) {
              console.error("Error fetching announcements:", err);
              return res.status(500).json({ error: "Error fetching announcements" });
            }

            const courseTitleSet = new Set();

            // Fetch course titles for each course ID
            for (const courseId of courseIdArray) {
              try {
                const [course] = await db.promise().query("SELECT Title FROM courses WHERE CourseID = ?", [courseId]);
                courseTitleSet.add(course[0].Title);
              } catch (error) {
                console.error("Error fetching course title:", error);
              }
            }

            console.log(courseTitleSet);
            return res.json({ courseTitles: Array.from(courseTitleSet), announcements });
          }
        );
      });
    });
  } catch (err) {
    console.error("Error in getAnnouncements:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAssignments(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }
      const userID = result[0].UserID;

      db.query("SELECT CourseID FROM Enrollments WHERE StudentID = ?", userID, (err, courseIDs) => {
        if (err) {
          console.error("Error fetching course IDs:", err);
          return res.status(500).json({ error: "Error fetching course IDs" });
        }

        const courseIdArray = courseIDs.map((course) => course.CourseID);

        db.query(
          "SELECT assignments.*, courses.Title as CourseTitle, " +
            "CASE WHEN EXISTS (SELECT * FROM AssignmentSubmissions " +
            "WHERE AssignmentSubmissions.UserID = ? AND AssignmentSubmissions.AssignmentID = assignments.AssignmentID) " +
            "THEN TRUE ELSE FALSE END AS submitted " +
            "FROM assignments " +
            "INNER JOIN courses ON assignments.CourseID = courses.CourseID " +
            "WHERE assignments.CourseID IN (?)",
          [userID, courseIdArray],
          async (err, assignments) => {
            if (err) {
              console.error("Error fetching assignments:", err);
              return res.status(500).json({ error: "Error fetching assignments" });
            }

            // Sort assignments based on DueDate in reverse order
            assignments.sort((a, b) => new Date(b.DueDate) - new Date(a.DueDate));

            const courseTitleSet = new Set();

            // Fetch course titles for each course ID
            for (const courseId of courseIdArray) {
              try {
                const [course] = await db.promise().query("SELECT Title FROM courses WHERE CourseID = ?", [courseId]);
                courseTitleSet.add(course[0].Title);
              } catch (error) {
                console.error("Error fetching course title:", error);
              }
            }
            console.log("Assignments:", assignments);
            return res.json({ courseTitles: Array.from(courseTitleSet), assignments: assignments });
          }
        );
      });
    });
  } catch (err) {
    console.error("Error in getAssignments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function setAssignments(req, res) {
  try {
    const { assignmentID, email, fileUrl, comment } = req.body;

    // Assuming you have a function to retrieve the UserID based on the email
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }
      const userID = result[0].UserID;
      // Insert the assignment submission into the AssignmentSubmissions table
      db.query(
        "INSERT INTO AssignmentSubmissions (UserID, AssignmentID, SubmissionDocURL, Comments) VALUES (?, ?, ?, ?)",
        [userID, assignmentID, fileUrl, comment],
        (err, result) => {
          if (err) {
            console.error("Error inserting assignment submission:", err);
            return res.status(500).json({ error: "Error inserting assignment submission" });
          }
          console.log("Assignment submission inserted successfully:", result);
          return res.status(200).json({ message: "Assignment submission inserted successfully" });
        }
      );
    });
  } catch (err) {
    console.error("Error in setAssignments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getQuizzes(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }
      console.log(result);
      const userID = result[0].UserID;

      db.query("SELECT CourseID FROM Enrollments WHERE StudentID = ?", userID, (err, courseIDs) => {
        if (err) {
          console.error("Error fetching course IDs:", err);
          return res.status(500).json({ error: "Error fetching course IDs" });
        }

        const courseIdArray = courseIDs.map((course) => course.CourseID);

        db.query(
          "SELECT quizzes.*, courses.Title as CourseTitle, " +
            "CASE WHEN EXISTS (SELECT * FROM QuizSubmissions " +
            "WHERE QuizSubmissions.UserID = ? AND QuizSubmissions.QuizID = quizzes.QuizID) " +
            "THEN TRUE ELSE FALSE END AS submitted " +
            "FROM quizzes " +
            "INNER JOIN courses ON quizzes.CourseID = courses.CourseID " +
            "WHERE quizzes.CourseID IN (?)",
          [userID, courseIdArray],
          async (err, assignments) => {
            if (err) {
              console.error("Error fetching assignments:", err);
              return res.status(500).json({ error: "Error fetching assignments" });
            }

            // Sort assignments based on DueDate in reverse order
            assignments.sort((a, b) => new Date(b.DueDate) - new Date(a.DueDate));

            const courseTitleSet = new Set();

            // Fetch course titles for each course ID
            for (const courseId of courseIdArray) {
              try {
                const [course] = await db.promise().query("SELECT Title FROM courses WHERE CourseID = ?", [courseId]);
                courseTitleSet.add(course[0].Title);
              } catch (error) {
                console.error("Error fetching course title:", error);
              }
            }
            console.log("Assignments:", assignments);
            return res.json({ courseTitles: Array.from(courseTitleSet), assignments: assignments });
          }
        );
      });
    });
  } catch (err) {
    console.error("Error in getAssignments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function setQuiz(req, res) {
  try {
    const { assignmentID, email, fileUrl, comment } = req.body;

    // Assuming you have a function to retrieve the UserID based on the email
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }
      const userID = result[0].UserID;
      // Insert the assignment submission into the AssignmentSubmissions table
      db.query(
        "INSERT INTO QuizSubmissions (UserID, QuizID, SubmissionDocURL, Comments) VALUES (?, ?, ?, ?)",
        [userID, assignmentID, fileUrl, comment],
        (err, result) => {
          if (err) {
            console.error("Error inserting assignment submission:", err);
            return res.status(500).json({ error: "Error inserting assignment submission" });
          }
          console.log("Assignment submission inserted successfully:", result);
          return res.status(200).json({ message: "Assignment submission inserted successfully" });
        }
      );
    });
  } catch (err) {
    console.error("Error in setAssignments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getGrades(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT UserID FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).json({ error: "Error fetching user ID" });
      }

      userID = result[0].UserID;

      db.query("SELECT CourseID,EnrollmentID FROM Enrollments WHERE StudentID = ?", userID, (err, courseIDs) => {
        if (err) {
          console.error("Error fetching course IDs:", err);
          return res.status(500).json({ error: "Error fetching course IDs" });
        }
        console.log(courseIDs);
        return res.json({ result });
      });
    });
  } catch (err) {
    console.error("Error in getGrades:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function getUserDetails(req, res) {
  try {
    const { email } = req.body;
    db.query("SELECT * FROM Users WHERE Email = ?", email, (err, result) => {
      if (err) {
        console.error("Error signing up user:", err);
        return res.status(500).json({ error: "Error Fetching courses" });
      }
      console.log(result, email);

      return res.json({ userId: result[0] });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Error hashing password" });
  }
}

function saveNotificationPreference(req, res) {
  try {
    const { email, preference } = req.body;

    // Find the user ID based on the email
    const getUserIdQuery = `SELECT UserID FROM Users WHERE Email = ?`;
    db.query(getUserIdQuery, [email], (err, results) => {
      if (err) {
        console.error("Error getting user ID:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userId = results[0].UserID;

      // Update the notification preference in the UserProfiles table
      const updatePreferenceQuery = `UPDATE UserProfiles SET NotificationPreferences = ? WHERE UserID = ?`;
      db.query(updatePreferenceQuery, [preference, userId], (err, results) => {
        if (err) {
          console.error("Error updating notification preference:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        res.status(200).json({ message: "Notification preference updated successfully" });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getUserId,
  verify,
  getCourses,
  getAnnouncements,
  getAssignments,
  setAssignments,
  getGrades,
  getQuizzes,
  setQuiz,
  getUserDetails,
  saveNotificationPreference,
};
