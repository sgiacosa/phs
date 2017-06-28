module.exports = function (io) {

    var app = require("express");
    var mongoose = require("mongoose");
    var router = app.Router();

    var moviles = require("../models/moviles");

    //Busco moviles
    router.post("/moviles", function (req, res) {
        var lon = req.body.longitud;
        var lat = req.body.latitud;
        /*if (lon && lat) {
            moviles.geoNear([Number(lon), Number(lat)], { spherical: true, distanceMultiplier: 6378 },
                function (err, data, stats) {
                    if (err) throw (err);
                    return res.json(data);
                });
        }
        else*/ {
            moviles.find({}, function (err, data) {
                res.json(data);
            })
        }
    });

    //Reportar nueva posición del movil
    router.post("/moviles/nuevaPosicion", function (req, res) {
        try {
            /*//Validar que el origen permitido solo sea local
            if (req.user.aplicaciones.indexOf("PHS_Firebase_Connector") == -1 && req.user.aplicaciones.indexOf("MicrotrackConnector") == -1) {
                res.status(403).send("No se encuentra autorizado.");
                return;
            }
           

            //Si el proveedor es microtrack busco por id_equipo
            if (req.user.aplicaciones.indexOf("MicrotrackConnector") != -1) {
                filtro = { idGps: req.body._id }
            } else
                //Verifico que el _id sea válido para evitar error de Mongoose
                if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
                    res.status(500).send("El Identificador del móvil se encuentra mal formado");
                    return;
                }*/
            var filtro = { _id: req.body._id };

            switch (req.user.username) {
                case "PHS_Firebase_Connector":
                    if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
                        res.status(500).send("El Identificador del móvil se encuentra mal formado");
                        return;
                    }
                    break;

                case "Microtrack":
                    filtro = { idGps: req.body._id }
                    //Modifico la Hora y la pongo en UTC ya que vienen -3 desde microtrack
                    var _date =  new Date(req.body.movimiento.date);
                    req.body.movimiento.date = new Date(_date.setHours(_date.getUTCHours())).toISOString();                    
                    break;
                default:
                    res.status(403).send("No se encuentra autorizado.");
                    return;
                    break;
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
            //Intento detectar Bug de movimiento null
            if(!req.body.movimiento) console.dump(req.body);

            moviles.findOne(filtro, function (err, data) {
                if (err) throw (err);
                //Actualizo la posicion del movil y luego llamo al socket
                if (data) {
                    if (!data.movimiento.date || data.movimiento.date < new Date(movimiento.date)) {
                        data.movimiento = movimiento;
                        data.device = device;
                        data.save(function (err, registroModificado) {
                            if (err) {
                                console.log(err);
                                res.status(500).send("Error al intentar guardar el movimiento");
                            }
                            res.status(200).send("La posición se registró correctamente");
                            io.sockets.emit('MovilPositionChange', registroModificado);
                        });
                    } else {
                        res.status(200).send("El registro no se guardó por ser anterior al último registrado.");
                        console.log("El registro no se guardó por ser anterior al último registrado");
                        console.log("BD: "+ data.movimiento.date.toISOString()+"--->>> Recibido: "+ movimiento.date);
                    }
                }else
                    res.status(404).send("No se encontró el móvil con el identificador recibido");
            });
        }
        catch (err) {
            console.log("Error al guardar el movimiento.")
            console.dump(req.body);
            console.log("Error---->>>>>>  ");
            console.dump(err);
        }
    });

    return router;

}
//module.exports = router;
