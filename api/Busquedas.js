module.exports= function (io) {

var app = require("express");
var router = app.Router();
var elasticsearch = require('elasticsearch');
var Registros = require("../models/Registros");

//Inicializo el cliente de elasticsearch
var client = new elasticsearch.Client({
  host: 'localhost:9200'
});

//Busco eventos
router.post("/search/events", function(req, res){
  var inicio =req.body.fechaInicio;
  var fin =req.body.fechaFin;
  var filtro="";
  filtro = {$and: [{fechaRegistro: { $lt : fin}}, {fechaRegistro: { $gt : inicio}}] };

  Registros.find(filtro, function(err, data){
    if (err) throw (err);
    res.json(data);
  });



});

//Busco por nombre de calles
router.post("/search/streets", function(req, res){
  var direccion =req.body.direccion;
  var ciudad ="neuquen";

  client.search({
    index: 'sien',
    type: 'calles',
    body: {
      query: {
          bool: {
              must: [
                {
                    match_phrase_prefix: {
                        "nombre.folded": {
                            query: direccion,
                            slop: 10,
                            max_expansions: 30
                        }
                    }
                },
                {
                    match: {
                        ciudad: ciudad
                    }
                }
              ]
          }
      }
    }
  }).then(function (resp) {
      var hits = [];
      for (var h in resp.hits.hits){
        hits.push(resp.hits.hits[h]._source);
      }
      res.json(hits);
  }, function (err) {
      res.status(500);
  });

});

//Busco por CIE10
router.post("/search/cie10", function(req, res){
  var direccion =req.body.direccion;
  var ciudad ="neuquen";

  client.search({
    index: 'salud',
    type: 'cie10',
    body: {
      query: {
          bool: {
              must: [
                {
                    match_phrase_prefix: {
                        "nombre.folded": {
                            query: direccion,
                            slop: 10,
                            max_expansions: 30
                        }
                    }
                }
              ]
          }
      }
    }
  }).then(function (resp) {
      var hits = [];
      for (var h in resp.hits.hits){
        hits.push(resp.hits.hits[h]._source);
      }
      res.json(hits);
  }, function (err) {
      res.status(500);
  });

});

return router;
}
//module.exports = router;
