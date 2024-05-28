const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "lms.cctvqnhngwpc.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "password",
  database: "lms",
});

module.exports = db;
