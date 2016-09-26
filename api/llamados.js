module.exports = function (io) {
    var app = require("express");
    var llamado = require("../models/llamados");


    var router = app.Router();

    //recibo un mensaje desde RAPH y lo publico en telegram
    router.post("/llamados/nuevo", function (req, res) {

        var nuevoLlamado = new llamado(req.body);
        nuevoLlamado.fecha = new Date();
        nuevoLlamado.usuario = req.user.username;
        nuevoLlamado.save(function (err, registroModificado) {
            if (err)
                console.log(err);
            res.json({});
        });

    });

    
    return router;
}