module.exports = function (io) {
    var app = require("express");
    var chats = require("../models/chats");
    var telegram = require("../modules/telegram");
    var global = require("../modules/global");

    var router = app.Router();

    //recibo un mensaje desde RAPH y lo publico en telegram
    router.post("/chats/sendsms", function (req, res) {

        //envio el mensaje usando telegram
        telegram.enviarSms(req.body.mensaje)
            .then(function (msg) {
                //lo guardo en la bd
                var mensaje = {
                    mensaje: msg.text,
                    fecha: msg.date,
                    usuario: req.user.username
                };
                var nuevo = new chats(mensaje);
                nuevo.save(function (err, registroModificado) {
                    if (err)
                        console.log(err);
                    res.json(registroModificado);
                    global.io.sockets.emit('chatChange', registroModificado);
                });
                
            })
            .catch(function () {
                res.status(500).send("Error al intentar enviar el mensaje.");
            });




    });

    //Listar los ultimos 10 SMS chats
    router.post("/chats/list", function (req, res) {
        var fecha = new Date();
        var ultimaFecha = req.body.ultimaFecha;
        fecha.setHours(fecha.getHours() - 12);
        var filtro = null;
        if (ultimaFecha) {
            filtro = { $or: [{ fechaCierre: null }, { fechaCierre: { $gt: fecha } }] };
        }
        else {
            filtro = {  };
        }
        chats
        .find(filtro)
        .sort({fecha: 'descending'})
        .limit(10)        
        .exec(function (err, data) {
            if (err) throw (err);
            res.json(data);
        });
    });

    return router;
}