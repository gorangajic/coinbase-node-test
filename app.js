var express = require('express');
var http = require('http');
var request = require('request');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var address;
var callbacks = [];

app.get('/generate/:key', function(req, res) {
    var generate_api = 'https://coinbase.com/api/v1/account/generate_receive_address';
    var api_key = req.params.key;
    var callback_url = "https://" + req.host + "/callback";
    var form = { api_key: api_key,
                 address: { callback_url:  callback_url } };
    request.post(generate_api, { form: form }, function(error , response, body) {
        if (error) {
            throw error;
        }
        var result = JSON.parse(body);
        address = result.address;
        res.redirect('/');
    });
});
app.get('/', function(req, res) {
    if ( address ) {
        res.end("Please send bitcoins to this address: " + address );
        return ;
    }
    res.end('please visit "/generate/<your_api_key>" to generate payment address');
});
app.get('/debug', function(req, res) {
    res.json(callbacks);
});
app.post('/callback', function(req, res) {
    callbacks.push({body: req.body, query: req.query});
    res.end('ok');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
