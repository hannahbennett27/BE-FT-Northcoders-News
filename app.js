const app = require("express")();
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL || require("./config").DB_URL;
const bodyParser = require("body-parser");
const apiRouter = require("./router/api");

app.use(bodyParser.json());

mongoose.connect(DB_URL).then(() => {
  console.log(`connected to database on ${DB_URL}...`);
});

app.get("/", (req, res, next) => {
  res.send({ msg: "welcome..." });
});

app.use("/api", apiRouter);

app.use("/*", (req, res, next) => {
  next({ status: 404, msg: "page not found." });
});

// 404 error status: client error - page not found
app.use((err, req, res, next) => {
  err.status === 404
    ? res.status(err.status).send({ msg: err.msg })
    : next(err);
});

// 400's error status: client error
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.name === "ValidationError") {
    res.status(400).send({ msg: err.message });
  } else if (err.name === "CastError") {
    res
      .status(400)
      .send({ msg: `${err.model.modelName} not found: invalid ${err.kind}.` });
  } else if (err.name === "MongoError") {
    res.status(400).send({ msg: err.message });
  } else next(err);
});

// 500's error status: internal error
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "internal server error." });
});

module.exports = app;
