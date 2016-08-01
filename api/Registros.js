module.exports = function (io) {

  var app = require("express");
  var router = app.Router();
  var Registro = require("../models/Registros");
  var Moviles = require("../models/Moviles");
  var pushbullet = require("../modules/pushbullet");
  var fb = require("../modules/firebase");
  var config = require("../modules/config");


  // Devolver un solo evento por Id
  router.get("/registro/:_id", function (req, res) {
    Registro.findOne({
      _id: req.params._id
    }, function (err, data) {
      if (err) throw (err);
      //pushbullet(data);
      res.json(data);
    });
  });

  // Devolver todos los registros
  router.post("/registros/list", function (req, res) {
    var fecha = new Date();
    var mostrarEventosFinalizados = req.body.mostrarEventosFinalizados;
    fecha.setHours(fecha.getHours() - 12);
    var filtro = null;
    if (mostrarEventosFinalizados) {
      filtro = { $or: [{ fechaCierre: null }, { fechaCierre: { $gt: fecha } }] };
    }
    else {
      filtro = { fechaCierre: null };
    }
    Registro.find(filtro, function (err, data) {
      if (err) throw (err);
      res.json(data);
    });
  });

  //Insertar nuevo registro
  router.post("/registros/nuevoRegistro", function (req, res) {
    Registro.findOne({ _id: req.body._id }, function (err, data) {
      if (err) throw (err);
      if (!data) {
        //Nuevo registro
        var newRegistro = new Registro(req.body);
        newRegistro.fechaRegistro = new Date();
        //chequeo si hay mensajes sin fecha
        var now = new Date();
        for (var i = 0; i < newRegistro.mensajes.length; i++) {
          if (!newRegistro.mensajes[i].fecha || newRegistro.mensajes[i].fecha === undefined) {
            newRegistro.mensajes[i].fecha = now;
            newRegistro.mensajes[i].usuario = req.user.username;
          }
        }

        newRegistro.save(function (err, registroModificado) {
          if (err)
            res.send(err);
          res.json(registroModificado);
          io.sockets.emit('dbChange');
        });
      }
      else {
        //Actualizo el registro
        //Primero verifico que no se encuentre cerrado
        if (data.fecha_cierre) res.status(403).send("El registro se encuentra cerrado.");

        //Actualizo los valores
        var newRegistro = new Registro(req.body);
        data.nombreContacto = newRegistro.nombreContacto;
        data.telefonoContacto = newRegistro.telefonoContacto;
        data.direccion = newRegistro.direccion;
        data.clasificacion = newRegistro.clasificacion;
        data.observaciones = newRegistro.observaciones;
        data.observacionesClasificacion = newRegistro.observacionesClasificacion;
        data.reporte = newRegistro.reporte;
        data.coordenadas = newRegistro.coordenadas;
        data.mensajes = newRegistro.mensajes;
        //chequeo si hay mensajes sin fecha
        var now = new Date();
        for (var i = 0; i < newRegistro.mensajes.length; i++) {
          if (!newRegistro.mensajes[i].fecha || newRegistro.mensajes[i].fecha === undefined) {
            newRegistro.mensajes[i].fecha = now;
            newRegistro.mensajes[i].usuario = req.user.username;
          }
        }
        //Elimino los pacientes que tengan todos los campos en blanco
        var pacientesFiltrado = [];
        for (var i = 0; i < newRegistro.pacientes.length; i++) {
          if (newRegistro.pacientes[i].nombre || newRegistro.pacientes[i].edad || newRegistro.pacientes[i].sexo || newRegistro.pacientes[i].observacion) {
            pacientesFiltrado.push(newRegistro.pacientes[i]);
          }
        }
        data.pacientes = pacientesFiltrado;
        data.save(function (err, registroModificado) {
          if (err)
            res.send(err);
          res.json(registroModificado);
          io.sockets.emit('dbChange');
        });

      }
    });
  });

  router.post("/registros/cerrar", function (req, res) {
    Registro.findOne({ _id: req.body._id }, function (err, data) {
      if (err) throw (err);
      //Verifico que no tenga salidas sin cerrar
      for (var i = 0; i < data.salidas.length; i++) {
        if (!data.salidas[i].fechaQRU) {
          res.status(403).send("Este evento tiene salidas sin finalizar.");
          return true;
        }
      }

      data.fechaCierre = new Date();

      data.save(function (err, dataModificado) {
        res.json(dataModificado);
        io.sockets.emit('dbChange');
      });
    });
  });

  //Nueva Salida
  router.post("/registros/salidas/nueva", function (req, res) {
    Registro.findOne({ _id: req.body._id }, function (err, data) {
      if (err) throw (err);

      //Verifico que el registro no se encuentre cerrado
      if (data.fechaCierre) res.status(403).send("El registro se encuentra cerrado para realizar modificaciones.");
      Moviles.findOne({ _id: req.body.idMovil }, function (err, movil) {
        if (err) throw (err);
        if (!movil) {
          console.log("no se encuentra el móvil con el id: " + req.body.idMovil);
          res.status(403).send("Seleccione un móvil");
          return true;
        }
        if (movil.estado != 1) {
          res.status(403).send("El móvil no se encuentra disponible");
          return true;
        }

        //Creo el nuevo registro
        data.salidas.push({
          idMovil: movil._id,
          nombreMovil: movil.nombre,
          fechaDespacho: new Date(),
          fechaArribo: null,
          fechaDestino: null,
          fechaQRU: null,
          idTipoFinalizacion: null,
          idDestino: null
        });
        data.save(function (err, dataModificado) {
          if (err) throw (err);
          res.json(dataModificado);
          //Actualizo en socket.io
          io.sockets.emit('dbChange');
        });
        //Actualizo el estado del movil
        movil.estado = 2;
        movil.save(function (err, movilModificado) {
          if (err) throw (err);
          //Actualizo el estado en firebase
          var movilRef = fb.database().ref(config.FB_moviles+'/'+movil._id);          
          movilRef.update({
            estado: 2,
            direccion: data.direccion,
            objetivo: data.coordenadas,
            observaciones: data.observaciones,
            clasificacion: data.clasificacion,
            observacionesClasificacion: data.observacionesClasificacion
          });

        });
      });
    });
  });

  router.post("/registros/salidas/indicarArribo", function (req, res) {
    Registro.findOne({ _id: req.body.idRegistro }, function (err, registro) {
      if (err) throw (err);
      //filtrar la salida correspondiente
      var idSalida = req.body.idSalida;
      for (var i = 0; i < registro.salidas.length; i++) {
        if (registro.salidas[i]._id == idSalida)
          registro.salidas[i].fechaArribo = new Date();
      }
      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange');
      });
    });
  });

  router.post("/registros/salidas/indicarDestino", function (req, res) {

    Registro.findOne({ _id: req.body.idRegistro }, function (err, registro) {
      if (err) throw (err);
      //filtrar la salida correspondiente
      var idSalida = req.body.idSalida;
      for (var i = 0; i < registro.salidas.length; i++) {
        if (registro.salidas[i]._id == idSalida) {
          registro.salidas[i].fechaDestino = new Date();
          var tipoSalida = { nombre: req.body.nombre, destino: req.body.destino };
          registro.salidas[i].tipoSalida = tipoSalida;
        }
      }

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange');
      });
    });
  });

  router.post("/registros/salidas/indicarQRU", function (req, res) {
    Registro.findOne({ _id: req.body.idRegistro }, function (err, registro) {
      if (err) throw (err);
      //filtrar la salida correspondiente
      var idSalida = req.body.idSalida;
      var idMovil = null;
      for (var i = 0; i < registro.salidas.length; i++) {
        if (registro.salidas[i]._id == idSalida) {
          registro.salidas[i].fechaQRU = new Date();
          idMovil = registro.salidas[i].idMovil;
        }
      }
      //Liberar el movil
      Moviles.findOne({ _id: idMovil }, function (err, movil) {
        if (err) throw (err);
        movil.estado = 1;
        movil.save(function (err, data) {
          if (err) throw (err);
        });
      });

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange');
      });
    });
  });


  router.post("/registros/sendsms", function (req, res) {
    Registro.findOne({ _id: req.body._id }, function (err, data) {
      if (err) throw (err);
      var sms = { fecha: new Date(), mensaje: req.body.mensaje, usuario: req.user.username };
      data.sms.push(sms);

      data.save(function (err, dataModificado) {
        res.json(dataModificado);
        //Envio mensaje pushbullet
        pushbullet(sms);
        io.sockets.emit('dbChange');
      });
    });
  });

  return router;
}
//module.exports = router;
