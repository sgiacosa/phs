var app = require("express");
var router = app.Router();
var usuarios = require("../models/usuarios");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var fb = require("../modules/firebase");
var config = require("../modules/config");
var moviles = require("../models/moviles");

var secret = 'hfy6*fre34#frtu!';

router.post('/loginMobileApp', function (req, res) {
  //Verifico si el imei que se intenta logear esta permitido
  var filtro = "";
  filtro = { imei: req.body.imei };

  moviles.findOne(filtro, function (err, data) {
    if (err) throw (err);

    var auth = fb.instance.auth();
    //Utilizo el id del movil 1
    var fbToken = auth.createCustomToken(data._id.toString(), { "premium_account": true });
    //Genero el token para poder consumir servicios desde el movil

    var profile = {
      id: data._id,
      username: data.nombre,
      nombre: data.nombre,
      apellido: data.nombre,
      firebase: null,
      aplicaciones: null
    }
    var phsToken = jwt.sign(profile, secret, { expiresIn: 3600 * 12 });
    
    res.json({
      token: fbToken,
      phsToken: phsToken
    });
  });



});

router.post('/login', function (req, res) {

  usuarios.findOne({ username: req.body.username }, function (err, user) {
    if (err) throw (err);
    //if is invalid, return 401
    if (!user) {
      res.status(401).send('Usuario o contraseña incorrecta');
      return true;
    }
    else {
      bcrypt.compare(req.body.password, user.password, function (err, isCorrect) {
        if (!isCorrect) {
          res.status(401).send('Usuario o contraseña incorrecta.');
          return true;
        }
        else {
          /*var fbToken = null;
          try {
            //obtengo el token de firebase
            var auth = fb.instance.auth();
            fbToken = auth.createCustomToken(user.username, { "premium_account": true });
          }
          catch (e) {
            console.log(e);
          }*/
          var profile = {
            username: user.username,
            nombre: user.nombre,
            apellido: user.apellido,
            firebase: null,
            aplicaciones: user.aplicaciones
          }
          var token = jwt.sign(profile, secret, { expiresIn: 3600 * 12 });
          res.json({ token: token });
        }
      });
    }
  });

});

router.post('/changepassword', function (req, res) {
  console.log("changepassword: 1");

  usuarios.findOne({ username: req.body.username }, function (err, user) {
    console.log("user " + user);
    if (err) throw (err);
    //if is invalid, return 401
    if (!user) {
      res.status(403).send('Usuario o contraseña incorrecta');
      return true;
    }
    else {
      bcrypt.compare(req.body.actual, user.password, function (err, isCorrect) {
        if (!isCorrect) {
          res.status(403).send('Usuario o contraseña incorrecta.');
          return true;
        }
        else {
          bcrypt.hash(req.body.nueva, null, null, function (err, hash) {
            console.log("nuevo hash generado");
            user.password = hash;
            user.save(function (err, registroModificado) {
              if (err)
                res.send(err);
              else
                res.json({});
            });
          });
        }
      });
    }
  });

});

module.exports = router;
