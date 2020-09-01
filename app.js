var express = require('express');
var app = express();
var fs = require("fs");

var PORT = process.argv[2] && parseInt(process.argv[2], 10) || 8080;
var STATIC_DIR = __dirname + '/app';
var TEST_DIR = __dirname + '/test';
var DATA_FILE = __dirname + '/server/data/restaurants.json';

// const fs = require('fs');

// let rawdata = fs.readFileSync('student.json');
// let student = JSON.parse(rawdata);
// console.log(student);

// console.log(DATA_FILE);

// app.get('/listusers', function (req, res) {
//     fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
//        console.log('Send data is '+data );
//        res.send( data );
//     });
//  })

require('./server/index').start(PORT, STATIC_DIR, DATA_FILE, TEST_DIR);
