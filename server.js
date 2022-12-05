const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
var compression = require("compression");
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

//importing dot env
require("dotenv/config");

//initializing api
//which is the initial route of api
const api = process.env.API_URL;

//Initializing app
const app = express();

//CORS
app.use(cors());
app.options("*", cors());

//Middlewares
//Middleware to serve static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("tiny"));
//Always use helmet for safety
app.use(helmet());
//Compress all routes
app.use(compression());

//Importing all routes middlewares
// Home Page Routes
const adminDashboardRoute = require("./src/routes/home/dashboard");

//Auth routes
const registerAdminRoute = require("./src/routes/authentication/auth");

//Registration Route
const collegeRegistrationRoute = require("./src/routes/registrations/college_registration");
const studentRegistrationRoute = require("./src/routes/registrations/student_registration");

//Course Module
const categoryRoute = require("./src/routes/courses/categories");
const courseRoute = require("./src/routes/courses/courses");

// Student Module
const studentRoute = require("./src/routes/students/students");
const studentCourseRoute = require("./src/routes/students/courses");

//Watch history
const historyRoute = require("./src/routes/history/history");

//OTHER MODULES
const othersHelperRoute = require("./src/routes/others/other_helper_routes");

//All route middlewares goes here
//Home page routes
app.use(`${api}/admin/home`, adminDashboardRoute);

//Auth routes
app.use(`${api}/admin/authentication`, registerAdminRoute);

//Registration Route Middlewares
app.use(`${api}/admin/registration/college`, collegeRegistrationRoute);
app.use(`${api}/admin/registration/student`, studentRegistrationRoute);

//course module routes middlewares
app.use(`${api}/admin/courses/category`, categoryRoute);
app.use(`${api}/admin/courses`, courseRoute);

//Student module routes middlewares
app.use(`${api}/students`, studentRoute);
app.use(`${api}/student/courses`, studentCourseRoute);

//History module routes middlewares
app.use(`${api}/history`, historyRoute);

//OTHER MODULE ROUTES MIDDLEWARE
app.use(`${api}/other/truncate`, othersHelperRoute);

//Connecting to mongodb database
mongoose
  .connect(
    process.env.DEV_DATABASE,
    // + "/future_way"
    {
      useNewUrlParser: true,
      //TODO:Add it while deployment
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // dbName: "future_way",
      // useFindAndModify: false
    }
  )
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.error(err);
  });

//Initializing port
const port = process.env.PORT || 3000;

var server = https.createServer(options, app);

//Running server
server.listen(port, () => {
  console.log(`Server is running at port ${port} ...`);
});
