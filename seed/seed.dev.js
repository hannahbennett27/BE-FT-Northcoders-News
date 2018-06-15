const seedDB = require("./seed");
const mongoose = require("mongoose");
const { DB_URL } = require("../config");
const rawData = require("./devData");

mongoose
  .connect(DB_URL)
  .then(() => {
    return seedDB(rawData);
  })
  .then(() => {
    console.log("data successfully seeded...");
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .then(() => {
    console.log("disconnected from database...");
  });
