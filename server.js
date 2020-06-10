// load in http module
const http = require('http');

// load in needle
const needle = require('needle');

// set port to listen on (default 8080)
const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

// pizza component microservices and their URLs
const components = [
    { name: "size", URL: (process.env.SIZE_URL || "http://size:8080") },
    { name: "crust", URL: (process.env.CRUST_URL || "http://crust:8080") },
    { name: "topping", URL: (process.env.TOPPING_URL || "http://topping:8080") },
]

// respond to each request with a randomly generated pizza
var server = http.createServer(async function (req, response) {
    
    // Send off requests to ingredient microservices
    myPizzaPromise = await makePizzaPromise();

    // create Pizza object from results
    var myPizza = {};
    for(var i = 0, len = components.length; i < len; i++) {
        myPizza[components[i]["name"]] = myPizzaPromise[i].body;
    }

    console.log(myPizza); // print output to console

    // send response
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(myPizza));

});

const makePizzaPromise = function() {
    
    // Create an array of promises
    var promisesArray = [];

    // for each ingredient create a promise (HTTP call) and add to the array
    for (var i = 0, len = components.length; i < len; i++) {
        promisesArray.push(needle('get',components[i]["URL"]));
    }

    return Promise.all(promisesArray);
}

// start listening
server.listen(port);