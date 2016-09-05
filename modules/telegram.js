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

var api = null;

if (config.useProxy) {
    api = new telegram({
        token: config.telegram.token,
        http_proxy: {
            host: config.proxy.host,
            port: config.proxy.port
        },
        updates: {
            enabled: true,
            get_interval: 500
        }
    });
}
else {
    api = new telegram({
        token: config.telegram.token,
        updates: {
            enabled: true,
            get_interval: 500
        }
    });
}


api.on('message', function (msg) {
    var chatId = msg.chat.id;

    if (!msg.text || chatId != config.telegram.groupId)
        return;


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
                if (texto.length == 0)
                    texto = "No hay móviles disponibles.";

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
                if (texto.length == 0)
                    texto = "No hay móviles ocupados.";

                api.sendMessage({
                    chat_id: chatId,
                    text: texto,
                    parse_mode: 'HTML'
                });
            });
            break;

        default:
            //Si el mensaje es en el grupo lo guardo en la bd.
            if (chatId == config.telegram.groupId && msg.text.length > 0) {
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
    if (evento.clasificacion)
        mensaje = "Código " + (evento.clasificacion == 1 ? " Verde 📗." : (evento.clasificacion == 2 ? " Amarillo 📒." : (evento.clasificacion == 3 ? " Rojo 📕." : " No clasificado. ")));
    mensaje += " <b> Recibe pedido:</b> " + moment(evento.fechaRegistro).format('HH:mm');
    if (evento.direccion)
        mensaje += " <b>Direccion:</b> " + evento.direccion;
    if (evento.observaciones)
        mensaje += " <b>Anotación:</b> " + evento.observaciones;
    if (evento.reporte)
        mensaje += " <b>Reporte:</b> " + evento.reporte;
    for (var i = 0; i < evento.mensajes.length; i++)
        mensaje += " <b>Mensaje:</b> " + evento.mensajes[i].mensaje;
    for (var i = 0; i < evento.salidas.length; i++){        
        mensaje += " 🚑 <b>Asiste:</b> " + evento.salidas[i].nombreMovil;
        mensaje += " Se despacha: " + moment(evento.salidas[i].fechaDespacho).format('HH:mm');
        
        if (evento.salidas[i].fechaEnMovimiento) mensaje += " -> Desplazamiento: " + moment(evento.salidas[i].fechaDespacho).format('HH:mm');
        if (evento.salidas[i].fechaArribo) mensaje += " -> Arriba: " + moment(evento.salidas[i].fechaArribo).format('HH:mm');
        if (evento.salidas[i].fechaDestino) mensaje += " -> "+evento.salidas[i].tipoSalida.nombre +" "+ evento.salidas[i].tipoSalida.destino +" : " + moment(evento.salidas[i].fechaDestino).format('HH:mm');
        if (evento.salidas[i].fechaQRU) mensaje += " -> QRU: " + moment(evento.salidas[i].fechaQRU).format('HH:mm');
        if (evento.salidas[i].fechaCancelacion) mensaje += " -> Cancelado: " + moment(evento.salidas[i].fechaCancelacion).format('HH:mm');
    }
    if (evento.fechaCierre)
        mensaje += " <b>Finaliza:</b> " + moment(evento.fechaCierre).format('HH:mm');

    return mensaje;
}



var exportar = {
    enviarSms: function (msg) {
        //TODO -- crear una promise y devolver error de texto vacio.
        if (msg.length <= 0)
            msg = " ";
        return api.sendMessage({
            chat_id: config.telegram.groupId,
            text: msg
        });
    }
}

module.exports = exportar;