module.exports = function (io) {

    var app = require("express");
    var router = app.Router();
    var moviles = require("../models/moviles");

    //Busco moviles
    router.post("/moviles", function (req, res) {
        var lon = req.body.longitud;
        var lat = req.body.latitud;
        if (lon && lat) {
            moviles.geoNear([Number(lon), Number(lat)], { spherical: true, distanceMultiplier: 6378 },
                function (err, data, stats) {
                    if (err) throw (err);
                    return res.json(data);
                });
        }
        else {
            moviles.find({}, function (err, data) {
                res.json(data);
            })
        }
    });

    //Reportar nueva posición del movil
    router.post("/moviles/nuevaPosicion", function (req, res) {
        //Validar que el origen permitido solo sea local
        if (req.user.aplicaciones.indexOf("PHS_Firebase_Connector") == -1 && req.user.aplicaciones.indexOf("MicrotrackConnector") == -1){
            res.sendStatus(403);
            return;
        }

        var movimiento = {
            course: req.body.movimiento.course,
            date: req.body.movimiento.date,
            latitude: req.body.movimiento.latitude,
            longitude: req.body.movimiento.longitude,
            provider: req.body.movimiento.provider || 'gps',
            speed: req.body.movimiento.speed
        };
        
        var device = {
            isGpsOn: req.body.device.isGpsOn || true,
            battery_low: req.body.device.battery_low || false,
            isMobileDataOn: req.body.device.isMobileDataOn || true,
            isSirenOn: req.body.device.isSirenOn || false,
            isPanicButtonOn: req.body.device.isPanicButtonOn || false
        };

        


        moviles.findOne({ _id: req.body._id }, function (err, data) {
            if (err) throw (err);
            //Actualizo la posicion del movil y luego llamo al socket
            if (data) {
                data.movimiento = movimiento;
                data.device = device;
                data.save(function (err, registroModificado) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }
                    res.sendStatus(200);
                    io.sockets.emit('MovilPositionChange', registroModificado);
                });
            }
            else
                res.sendStatus(500);
        });

    });

    return router;
}
//module.exports = router;
