var firebase = require('firebase');
var config = require("../modules/config");
var moviles = require("../models/moviles");

///module.exports = firebase.initializeApp(config.FB_config);
var fbInstance = firebase.initializeApp({
    serviceAccount: config.FB_config_Server,
    databaseURL: "https://sien.firebaseio.com"
});

module.exports = {
    instance: fbInstance,
    actualizarMoviles: function (registro) {
        function actualizarMovil(registro, indexSalida) {
            //Verifico si el movil tiene telefono asignado
            moviles.findOne({ _id: registro.salidas[indexSalida].idMovil }, function (err, movil) {
                if (movil && movil.imei) {
                    var movilRef = fbInstance.database().ref(config.FB_moviles + '/' + registro.salidas[indexSalida].idMovil);
                    if (!registro.salidas[indexSalida].fechaQRU && !registro.salidas[indexSalida].fechaCancelacion) {
                        var o = {
                            estado: 2,
                            event: {
                                direccion: registro.direccion || "",
                                observaciones: registro.observaciones || "",
                                latitude: registro.coordenadas ? registro.coordenadas[1] : "",
                                longitude: registro.coordenadas ? registro.coordenadas[0] : "",
                                clasificacion: registro.clasificacion || "",
                                observacionesClasificacion: registro.observacionesClasificacion || ""
                            }
                        }
                        movilRef.update(o);
                    }
                    else {
                        movilRef.update({
                            estado: 1
                        });
                    }
                }
            });
        }

        for (var i = 0; i < registro.salidas.length; i++) {
            actualizarMovil(registro, i);
        }


    }
};

