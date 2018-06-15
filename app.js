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

app.use((err, req, res, next) => {
  // error status 404: client error - page not found
  err.status === 404
    ? res.status(err.status).send({ msg: err.msg })
    : next(err);
});

app.use((err, req, res, next) => {
  err.status
    ? res.status(err.status).send({ msg: err.msg })
    : err.name === "ValidationError"
      ? res.status(400).send({ msg: err.message })
      : err.name === "CastError"
        ? res.status(400).send({
            msg: `${err.model.modelName} not found: invalid ${err.kind}.`
          })
        : err.name === "MongoError"
          ? res.status(400).send({ msg: err.message })
          : console.log("ERROR HERE...");
});

module.exports = app;

// ERROR IF/ELSE STATEMENTS
// app.use((err, req, res, next) => {
//   console.log(err);
//   if (err.status) res.status(err.status).send({ msg: err.msg });
//   if (err.name === "ValidationError")
//     res.status(400).send({ msg: err.message });
//   else if (err.name === "CastError") {
//     res
//       .status(400)
//       .send({ msg: `${err.model.modelName} not found: invalid ${err.kind}.` });
//   } else console.log("ERROR HERE...");
// });
