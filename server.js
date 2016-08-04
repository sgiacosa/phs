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

var secret = 'hfy6*fre34#frtu!';

console.log("1. Preparar conexión a la base de datos ...");
//mongoose.connect('mongodb://localhost/raph');

console.log("2. Configurando middleware ...")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


console.log("3. Configurando rutas estáticas ...")
//app.use('/', expressJwt({secret: secret}));
//app.use('/', express.static('public'));
app.use('/', express.static(path.join(__dirname, '', 'public')));

console.log("5. Configurando socket.io ...")
/*var server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, '', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '', 'cert.pem'))
}, app).listen(https_port);*/

var server = http.createServer(app).listen(http_port, http_ip);

var io = require('socket.io').listen(server);
socket(io);

console.log("4. Configurando API ...")

var auths = requireDir('./auth/');
for (var a in auths) {
  app.use('/auth/', auths[a]);
}

//Protejo las api, solo se accede con un token válido
app.use('/api', expressJwt({ secret: secret }));

var routes = requireDir('./api/');
for (var route in routes) {
  app.use('/api/', routes[route](io));
}
//Sino esta logeado devuelvo 401
app.use(function (err, req, res, next) {
  if (err.constructor.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized');
  }
});

// Para cualquier otra ruta, devuelve el archivo principal de la aplicación de Angular
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '', 'public/index.html'));
});



console.log("Todo Listo!")

//app.listen(3000);
