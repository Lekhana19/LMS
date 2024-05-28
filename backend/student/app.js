const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const cors = require("cors");

const app = express();
const port = 3500;

// Middleware to parse JSON request bodies with increased limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Use routes defined in routes.js
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is running on PORT : ${port}`);
});
