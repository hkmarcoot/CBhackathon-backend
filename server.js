require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const logger = require("morgan");

//import cors from "cors";
//var cors = require('cors');

//const port = 3000;
const port = process.env.HTTP_PORT;

const lostitemController = require("./app/controller/lostitemController");

//app.use(cors());

app.use("/", lostitemController);

// error handler
app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send({
      error: err,
    });
    return;
  }

  next();
});

app.listen(port, () =>
  console.log(`Foundify Server listening on port ${port}!`)
);
