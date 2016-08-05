var path = require('path');
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var requireDir = require('require-dir');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var socket = require('./modules/socket.js');
var http_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var http_ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";


var app = express();

console.log("3. Configurando rutas estáticas ...")
app.use('/', express.static(path.join(__dirname, '', 'public')));
app.listen(http_port, http_ip);
console.log('Server running on http://%s:%s', http_ip, http_port);

app.get('/', function (req, res) {  
    res.send('{ pageCount: -1 }');
});



module.exports = app ;
//var server = http.createServer(app).listen(http_port, http_ip);
//app.listen(3000);
