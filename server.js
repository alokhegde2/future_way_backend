const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require('helmet');
const mongoose = require("mongoose");
var compression = require('compression');
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
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
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(morgan("tiny"));
//Always use helmet for safety
app.use(helmet());
//Compress all routes
app.use(compression());


//Importing all routes middlewares
//Auth routes
const registerAdminRoute = require("./admin/routes/authentication/auth");

//Registration Route
const collegeRegistrationRoute = require("./admin/routes/registrations/college_registration")
const studentRegistrationRoute = require("./admin/routes/registrations/student_registration")

//Course Module
const categoryRoute = require('./admin/routes/courses/categories')
const courseRoute = require('./admin/routes/courses/courses')

//All route middlewares goes here
app.use(`${api}/admin/authentication`, registerAdminRoute);

//Registration Route Middlewares
app.use(`${api}/admin/registration/college`, collegeRegistrationRoute);
app.use(`${api}/admin/registration/student`, studentRegistrationRoute);

//course module routes middlewares
app.use(`${api}/admin/courses/category`, categoryRoute)
app.use(`${api}/admin/courses`, courseRoute)


//Connecting to mongodb database
mongoose
  .connect(process.env.DATABASE + "/future_way", {
    useNewUrlParser: true,
    //TODO:Add it while deployment
    // useUnifiedTopology: true,
    // useCreateIndex: true,
    // dbName: "future_way",
    // useFindAndModify: false
  })
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