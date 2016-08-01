var PushBullet = require('pushbullet');
var pusher = new PushBullet('FII6iJAYGrLqk9hp3z8IOKEmpE2ARgVg');
var config = require("../modules/config");

module.exports = function (sms) {

  for (var i=0;i< config.pushbulletEmail.length; i++){
    pusher.note(config.pushbulletEmail[i].email, sms.usuario, sms.mensaje, function(error, response) {
      if (error)
      console.log("Error Enviando mensaje PushBullet: "+ error);
    });
  };
}
