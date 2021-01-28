const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const csv = require("csvtojson");
const { v4: uuidv4 } = require("uuid");
const request = require("request");

const app = express();
const PORT = 8000;
const appName = "The Glitch App";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.use(cors());

app.get("/", (req, res) => {
  console.log("Welcome to the Glitch App");
  res.send("Welcome to the Glitch App");
});

app.post("/csv", (req, res) => {
  const file_url = req.body.csv.url;
  console.log("file_url:", file_url);

  const select_fields = req.body.csv.select_fields;
  console.log("select_fields:", select_fields);

  if (!file_url.includes(".csv")) {
    res.status(400).send({
      error: true,
      message: "The URL contains an invalid CSV",
    });
    // } else if (file_url.includes(".csv")) {
    //   res.status(200).send({
    //     error: false,
    //     message: "URL provided is valid",
    //   });
  }

  csv()
    .fromStream(request.get(file_url))
    .then((jsonToCSV) => {
      if (select_fields === undefined) {
        console.log("Select fields not passed, Returning all fields", jsonToCSV);
        return res.status(200).send({
          conversion_key: uuidv4(),
          json: jsonToCSV,
        });
      } else {
        const jsonToArray = formatArray(jsonToCSV, select_fields);
        console.log("Select fields passed, Successful!");
        return res.status(200).send({
          conversion_key: uuidv4(),
          jsonToCSV: jsonToArray,
        });
      }
    });
});

function formatArray(json, select_fields) {
  let jsonToArray = [];
  json.forEach((data) => {
    let newJSONData = {};
    select_fields.forEach((fields) => {
      newJSONData[fields] = data[fields];
    });
    jsonToArray.push(newJSONData);
    console.log(jsonToArray);
  });
  return jsonToArray;
}

app.listen(PORT, (res) => {
  console.log(`${appName} is listening on port ${PORT}`);
});
