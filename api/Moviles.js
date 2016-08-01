module.exports= function (io) {

  var app = require("express");
  var router = app.Router();
  var moviles = require("../models/Moviles");

  //Busco moviles
  router.post("/moviles", function(req, res){
    var lon = req.body.longitud;
    var lat = req.body.latitud;
    if (lon && lat){
      moviles.geoNear([Number(lon),Number(lat)], {spherical : true, distanceMultiplier:6378 },
      function(err, data, stats){
        if (err) throw (err);
        return res.json(data);
      });
    }
    else {
      moviles.find({}, function(err, data) {
        res.json(data);
      })
    }
  });

  return router;
}
//module.exports = router;
