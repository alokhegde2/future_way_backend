const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require('helmet');
const mongoose = require("mongoose");

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


//Importing all routes middlewares
const registerAdminRoute = require("./admin/routes/authentication/auth");

//All route middlewares goes here
app.use(`${api}/admin/authentication`, registerAdminRoute);


//Connecting to mongodb database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
    dbName: "future_way",
    // useFindAndModify: false
  })
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log(err);
  });


//Initializing port
const port = process.env.PORT || 3000;

//Running server
app.listen(port, () => {
  console.log(`Server is running at port ${port} ...`);
});