var app = require("express");
var router = app.Router();
var usuarios = require("../models/Usuarios");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var fb = require("../modules/firebase");
var config = require("../modules/config");

var secret = 'hfy6*fre34#frtu!';

router.post('/loginMobileApp', function (req, res) {
  //TODO crear una tabla IMEI donde segun el imei me devuelve el id del movil :)
  var auth = fb.auth();
  //Utilizo el id del movil 1
  var token = auth.createCustomToken("5734b1ed699976ac1a93f31f", { "premium_account": true });
  res.json({ token: token });
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
          var profile = {
            username: user.username,
            nombre: user.nombre,
            apellido: user.apellido
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
