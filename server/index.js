var express = require('express');
var fs = require('fs');
var cors = require('cors');
var http = require('http');
var request = require('request');

const config = require('../config');

var open = require('open');

var RestaurantRecord = require('./model').Restaurant;
var MemoryStorage = require('./storage').Memory;

var API_URL = '/api/restaurant';
var API_URL_ID = API_URL + '/:id';
var API_URL_ORDER = '/api/order';


//API Call to fetch Menu Items
var API_MENU_ITEMS = '/api/fetchMenuItems';


//API Call to fetch More Info
var API_MORE_INFO = '/api/fetchMoreInfo';



var removeMenuItems = function(restaurant) {
  var clone = {};

  Object.getOwnPropertyNames(restaurant).forEach(function(key) {
    if (key !== 'menuItems') {
      clone[key] = restaurant[key];
    }
  });

  return clone;
};


exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var storage = new MemoryStorage();

  // log requests
  app.use(express.logger('dev'));

  // serve static files for demo client
  app.use(express.static(STATIC_DIR));

  // parse body into req.body
  app.use(express.bodyParser());


// API Call to fetch menu items
app.get(API_MENU_ITEMS, function (req, res) {

  getMenuItems(function(err, data){ 
    if(err) return res.send(err); 
    // console.log("Actual data: "+data);      
    res.send(data);
  });
});   


function getMenuItems(callback){
  // console.log("calling");
  request('http://'+config.items.host+':'+config.items.port+'/api/menuitems', (error, response, body) => {

    if (!error && response.statusCode == 200) {

        result = JSON.stringify(JSON.parse(body));

        // console.log('New Data '+result );

        callback(null, result);

    } else {

        callback(error, null);

    }
});
}


//Code snippet to allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// API Call to fetch more info
app.get(API_MORE_INFO, function (req, res) {

  getMoreInfo(function(err, data){ 
    if(err) return res.send(err); 
    // console.log("Actual data: "+data);      
    res.send(data);
  });
});

function getMoreInfo(callback){
  // console.log("calling");
  request('http://'+config.info.host+':'+config.info.port+'/api/moreinfo', (error, response, body) => {

    if (!error && response.statusCode == 200) {

        result = JSON.stringify(JSON.parse(body));

        // console.log('New Data '+result );

        callback(null, result);

    } else {

        callback(error, null);

    }
});
}


  // API
  app.get(API_URL, function(req, res, next) {
    res.send(200, storage.getAll().map(removeMenuItems));
  });




  app.post(API_URL, function(req, res, next) {
    var restaurant = new RestaurantRecord(req.body);
    var errors = [];

    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.send(400, {error: errors});
  });

  app.post(API_URL_ORDER, function(req, res, next) {
    // console.log(req.body)
    return res.send(201, { orderId: Date.now()});
  });


  app.get(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);

    if (restaurant) {
      return res.send(200, restaurant);
    }

    return res.send(400, {error: 'No restaurant with id "' + req.params.id + '"!'});
  });


  app.put(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);
    var errors = [];

    if (restaurant) {
      restaurant.update(req.body);
      return res.send(200, restaurant);
    }

    restaurant = new RestaurantRecord(req.body);
    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.send(400, {error: errors});
  });


  app.del(API_URL_ID, function(req, res, next) {
    if (storage.deleteById(req.params.id)) {
      return res.send(204, null);
    }

    return res.send(400, {error: 'No restaurant with id "' + req.params.id + '"!'});
  });


  // only for running e2e tests
  app.use('/test/', express.static(TEST_DIR));


  // start the server
  // read the data from json and start the server
  fs.readFile(DATA_FILE, function(err, data) {
    JSON.parse(data).forEach(function(restaurant) {
      storage.add(new RestaurantRecord(restaurant));
    });

    app.listen(PORT, function() {
      open('http://localhost:' + PORT + '/');
      console.log('Go to http://localhost:' + PORT + '/');
    });
  });


  // Windows and Node.js before 0.8.9 would crash
  // https://github.com/joyent/node/issues/1553
  try {
    process.on('SIGINT', function() {
      // save the storage back to the json file
      fs.writeFile(DATA_FILE, JSON.stringify(storage.getAll()), function() {
        process.exit(0);
      });
    });
  } catch (e) {}

};
