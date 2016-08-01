module.exports= function (io) {

var app = require("express");
var router = app.Router();
var constantes = require("../models/constantes");

//Busco por nombre de calles
router.get("/constantes", function(req, res){

  constantes.find({}, function(err, data) {
      if (err) throw (err);
      res.json(data[0]);
  });

});

return router;
}
//module.exports = router;
