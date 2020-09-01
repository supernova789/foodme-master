var express = require('express');
var app = express();
// 'use strict';

const fs = require('fs');

// let rawdata = fs.readFileSync('student.json');
// let student = JSON.parse(rawdata);
// console.log(student);


//API Call to fetch User List
var API_USER_URL = '/api/menuitems';


// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// Restful Service to fetch user list
app.get(API_USER_URL, function (req, res) {
  fs.readFile( __dirname + "/server/data/extra/" + "menuitems.json", 'utf8', function (err, data) {
     console.log('Send data is '+data );
     res.send( data );
  });
})


// app.get('/', function (req, res) {
//   res.send(student);
// });


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});