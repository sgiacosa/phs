var telegram = require('telegram-bot-api');
var moment = require('moment');

var config = require("../modules/config");
var global = require("../modules/global");
var chats = require("../models/chats");
var io = require("../modules/socket");
var registros = require("../models/registros");
var moviles = require("../models/moviles");

/*
            movilesocupados - Lista los moviles ocupados
            movilesdisponibles - Lista los moviles disponibles
            estadoactual - Lista los eventos abiertos
*/

var api = new telegram({
    token: config.telegram.token,
    updates: {
        enabled: true,
        get_interval: 500
    }
});


api.on('message', function (msg) {
    if (!msg.text)
        return;

    var chatId = msg.chat.id;
    switch (true) {
        //comando /ZONA
        case /^\/estadoactual/.test(msg.text):

            registros.find({ fechaCierre: null }, function (err, data) {
                if (err) throw (err);


                var texto = "En este momento existen " + data.length + " eventos sin finalizar.";
                api.sendMessage({
                    chat_id: chatId,
                    text: texto,
                    parseMode: 'HTML'
                });

                for (i = 0; i < data.length; i++) {
                    var texto = generarTextoSms(data[i].toJSON());
                    api.sendMessage({
                        chat_id: chatId,
                        text: texto,
                        parse_mode: 'HTML'
                    });
                }

            });
            break;

        case /^\/movilesdisponibles/.test(msg.text):

            moviles.find({ estado: 1 }, function (err, data) {
                if (err) throw (err);

                var texto = "";
                for (i = 0; i < data.length; i++) {
                    texto += data[i].nombre + " - ";
                }
                api.sendMessage({
                    chat_id: chatId,
                    text: texto,
                    parse_mode: 'HTML'
                });
            });
            break;



        case /^\/movilesocupados/.test(msg.text):

            moviles.find({ estado: 2 }, function (err, data) {
                if (err) throw (err);

                var texto = "";
                for (i = 0; i < data.length; i++) {
                    texto += data[i].nombre + " - ";
                }
                api.sendMessage({
                    chat_id: chatId,
                    text: texto,
                    parse_mode: 'HTML'
                });
            });
            break;

        default:
            //Si el mensaje es en el grupo lo guardo en la bd.
            if (chatId == config.telegram.groupId) {
                var mensaje = {
                    mensaje: msg.text,
                    fecha: msg.date,
                    usuario: msg.from.first_name + " " + msg.from.last_name
                };
                var nuevo = new chats(mensaje);
                nuevo.save(function (err, registroModificado) {
                    if (err)
                        console.log(err);
                    //disparar socket.io              
                    //io.sockets.emit('dbChange');
                    global.io.sockets.emit('chatChange', registroModificado);
                });
            }
            break;
    }

});


function generarTextoSms(evento) {
    var mensaje = "";
    mensaje = " <b>Recibe pedido:</b> " + moment(evento.fechaRegistro).format('HH:mm');
    if (evento.direccion)
        mensaje += " <b>Direccion:</b> " + evento.direccion;
    if (evento.observaciones)
        mensaje += " <b>Anotación:</b> " + evento.observaciones;
    if (evento.reporte)
        mensaje += " <b>Reporte:</b> " + evento.reporte;
    for (var i = 0; i < evento.mensajes.length; i++)
        mensaje += " <b>Mensaje:</b> " + evento.mensajes[i].mensaje;
    for (var i = 0; i < evento.salidas.length; i++)
        mensaje += " <b>Asiste:</b> " + evento.salidas[i].nombreMovil;
    if (evento.fechaCierre)
        mensaje += " <b>Finaliza:</b> " + moment(evento.fechaCierre).format('HH:mm');

    return mensaje;
}



var exportar = {
    enviarSms: function (msg) {
        return api.sendMessage({
            chat_id: config.telegram.groupId,
            text: msg
        });
        /*.then(function (message) {
            console.log("enviado");
        })
        .catch(function (err) {
            console.log(err);
        });*/
    }
}

module.exports = exportar;