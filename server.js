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
var http_port=80;
var https_port=443;

var app = express();

var secret = 'hfy6*fre34#frtu!';

console.log("1. Preparar conexión a la base de datos ...");
mongoose.connect('mongodb://localhost/raph');

console.log("2. Configurando middleware ...")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
//Redirecciono todo a HTTPS
//TODO -> cuando tenga un certificado que no sea autofirmado quitar req.url.indexOf("loginMobileApp") == -1 y redireccionar absolutamente todo por https - 
//Esto lo hago temporal para poder autenticar desde android debido al error avax.net.ssl.SSLException: Not trusted server certificate exception
app.use(function(req, res, next) {
  if(!req.secure & req.url.indexOf("loginMobileApp") == -1) {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

console.log("3. Configurando rutas estáticas ...")
//app.use('/', expressJwt({secret: secret}));
//app.use('/', express.static('public'));
app.use('/', express.static(path.join(__dirname, '', 'public')));

console.log("5. Configurando socket.io ...")
var server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, '', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '', 'cert.pem'))
}, app).listen(https_port);

http.createServer(app).listen(http_port)

var io = require('socket.io').listen(server);
socket(io);

console.log("4. Configurando API ...")

var auths = requireDir('./auth/');
for (var a in auths){
  app.use('/auth/',auths[a]);
}

//Protejo las api, solo se accede con un token válido
app.use('/api', expressJwt({secret: secret}));

var routes = requireDir('./api/');
for (var route in routes){
  app.use('/api/', routes[route](io));
}
//Sino esta logeado devuelvo 401
app.use(function(err, req, res, next){
  if (err.constructor.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized');
  }
});

// Para cualquier otra ruta, devuelve el archivo principal de la aplicación de Angular
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '', 'public/index.html'));
});



console.log("Todo Listo!")

