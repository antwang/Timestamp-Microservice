"use strict";

var express = require("express");
// var mongo = require('mongodb');
var mongoose = require("mongoose");

var bodyParser = require("body-parser");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
  console.log("mongoose connected!");
});
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
// create url schema
var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

// create url Model on urlSchema
var UrlModel = mongoose.model("UrlModel", urlSchema);
// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:urlnum", function(req, res) {
  UrlModel.findOne({ short_url: req.params.urlnum }, function(err, record) {
    if (err) return res.json({ error: err });
    if (record) {
      res.redirect(302, record.original_url);
    } else {
      res.json({ msg: "not exist" });
    }
  });
});

app.post("/api/shorturl/new", function(req, res) {
  const url = req.body.url;
  UrlModel.findOne({ original_url: url }, function(err, urlRecord) {
    if (err) return console.log(err);
    if (urlRecord) {
      res.json({
        original_url: urlRecord.original_url,
        short_url: urlRecord.short_url
      });
    } else {
      UrlModel.count({}, function(err, count) {
        if (err) return console.log(`count err ${err}`);
        var newUrl = new UrlModel({ original_url: url, short_url: count + 1 });
        newUrl.save(function(err, newUrl) {
          if (err) return console.log(err);
          res.json({
            original_url: newUrl.original_url,
            short_url: newUrl.short_url
          });
        });
      });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
