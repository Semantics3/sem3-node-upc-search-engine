//Semantics3 UPC Search Engine

var express =require('express');
var bodyParser = require('body-parser');
var credentials = require('./credentials.json');
var api_key = credentials.api_key;
var api_secret = credentials.api_secret;
var sem3 = require('semantics3-node')(api_key,api_secret);

var app = express();
app.use(bodyParser.urlencoded({extended:false}));

//Load the Jade templating engine
app.set('views','./views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/upc', function(req, res) {
  res.render('home');
});

app.post('/upc', function(req, res) {
    //Error check 1: To ensure upc input was valid numeric input
    if(!('upc' in req.body) || isNaN(req.body.upc)) {
        res.render('upc', {
            title: 'Semantics3 UPC Search Engine - ' + upc,
            search: 'UPC: ' + upc,
            error: 'You did not enter a valid UPC.'
        });
        return;
    }

    var upc = req.body.upc;

    // Build the request
    sem3.products.products_field( "upc", upc );

    // Run the request
    sem3.products.get_products(
            function(err, products) {
                //Error check 2: Internal error while pinging Semantics3 API
                if (err ) {
                    res.render('upc', {
                        title: 'Semantics3 UPC Search Engine - ' + upc,
                        search: 'UPC: ' + upc,
                        error: 'There was an internal server error. Please try again.'
                    });
                }
                else {
                    var productsObj = JSON.parse(products);
                    //Error check 3: If there was no results because upc could not be found
                    if(productsObj.results_count == 0) {
                        res.render('upc', {
                            title: 'Semantics3 UPC Search Engine - ' + upc,
                            search: 'UPC: ' + upc,
                            error: 'No results could be found for the UPC query. Please enter another UPC.'
                        });
                    }
                    else {
                        //Fields that we are targeting
                        var fields = ['name','ean','brand','model','category'];
                        var resObj = {};
                        for( var index in fields) {
                            var field = fields[index];
                            //Set default value as 'N/A'
                            resObj[field] = 'N/A';
                            //If field exists in API response
                            if(field in productsObj.results[0]) {
                                //Store value
                                resObj[field] = productsObj.results[0][field];
                            }
                        }

                        //Treat image separately since it's value is an array
                        resObj['image'] = 'N/A';
                        //Check if image exists
                        if(productsObj.results[0].images.length > 0) {
                            //Save image
                            resObj['image'] = productsObj.results[0].images[0];
                        }

                        res.render('upc', {
                            title: 'Semantics3 UPC Search Engine - ' + upc,
                            search: 'UPC: ' + upc,
                            upc: resObj
                        });
                    }
                }
            }
    );
});

app.listen(3019);

