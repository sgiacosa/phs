module.exports = function (io) {

  var app = require("express");
  var router = app.Router();

  var Registro = require("../models/registros");
  var Moviles = require("../models/moviles");
  var llamado = require("../models/llamados");

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
        newRegistro.fechaModificacion = new Date();
        newRegistro.usuario = req.user.username;
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
          io.sockets.emit('dbChange', registroModificado);
          
          //Registro el llamado telefónico
          var nuevoLlamado = new llamado();
          nuevoLlamado.fecha = new Date();
          nuevoLlamado.tipo = 1;
          nuevoLlamado.usuario = req.user.username;
          nuevoLlamado.registro = registroModificado._id;
          nuevoLlamado.telefono = registroModificado.telefonoContacto;
          nuevoLlamado.save(function (err, data) {
            if (err)
              console.log(err);
          });
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
        data.referenciaDireccion = newRegistro.referenciaDireccion;
        data.clasificacion = newRegistro.clasificacion;
        data.observaciones = newRegistro.observaciones;
        data.observacionesClasificacion = newRegistro.observacionesClasificacion;
        data.reporte = newRegistro.reporte;
        data.coordenadas = newRegistro.coordenadas;
        data.mensajes = newRegistro.mensajes;
        data.fechaModificacion = new Date();
        data.usuario = req.user.username;
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
          io.sockets.emit('dbChange', registroModificado);          
          fb.actualizarMoviles(registroModificado);
        });

      }
    });
  });

  router.post("/registros/cerrar", function (req, res) {
    Registro.findOne({ _id: req.body._id }, function (err, data) {
      if (err) throw (err);
      //Verifico que no tenga salidas sin cerrar
      for (var i = 0; i < data.salidas.length; i++) {
        if (!data.salidas[i].fechaQRU && !data.salidas[i].fechaCancelacion) {
          res.status(403).send("Este evento tiene salidas sin finalizar.");
          return true;
        }
      }

      data.fechaCierre = new Date();
      data.fechaModificacion = new Date();
      data.usuario = req.user.username;

      data.save(function (err, dataModificado) {
        res.json(dataModificado);
        io.sockets.emit('dbChange', dataModificado);
        fb.actualizarMoviles(dataModificado);
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
          fechaCancelacion: null,
          fechaQRU: null,
          idTipoFinalizacion: null,
          idDestino: null
        });
        //Audit
        data.fechaModificacion = new Date();
        data.usuario = req.user.username;

        data.save(function (err, dataModificado) {
          if (err) throw (err);
          res.json(dataModificado);
          //Actualizo en socket.io
          io.sockets.emit('dbChange', dataModificado);          
          //Actualizo el Firebase
          if (movil.imei)
            fb.actualizarMoviles(dataModificado);
        });
        //Actualizo el estado del movil
        movil.estado = 2;
        movil.save(function (err, movilModificado) {
          if (err) throw (err);     
          io.sockets.emit('MovilPositionChange', movilModificado);  
          console.log('movilModificado: '+ movilModificado.estado);   
        });
      });
    });
  });

  router.post("/registros/salidas/indicarMovimiento", function (req, res) {
    Registro.findOne({ _id: req.body.idRegistro }, function (err, registro) {
      if (err) throw (err);
      //filtrar la salida correspondiente
      var idSalida = req.body.idSalida;
      for (var i = 0; i < registro.salidas.length; i++) {
        if (registro.salidas[i]._id == idSalida)
          registro.salidas[i].fechaEnMovimiento = new Date();
      }
      //Audit
      registro.fechaModificacion = new Date();
      registro.usuario = req.user.username;

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange', data);
        fb.actualizarMoviles(data);
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
      //Audit
      registro.fechaModificacion = new Date();
      registro.usuario = req.user.username;

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange', data);
        fb.actualizarMoviles(data);
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
      //Audit
      registro.fechaModificacion = new Date();
      registro.usuario = req.user.username;

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange', data);
        fb.actualizarMoviles(data);
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
        movil.save(function (err, movilModificado) {
          if (err) throw (err);
          io.sockets.emit('MovilPositionChange', movilModificado);
        });
      });

      //Audit
      registro.fechaModificacion = new Date();
      registro.usuario = req.user.username;

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange', data);
        fb.actualizarMoviles(data);
      });
    });
  });

  router.post("/registros/salidas/indicarCancelacion", function (req, res) {
    Registro.findOne({ _id: req.body.idRegistro }, function (err, registro) {
      if (err) throw (err);
      //filtrar la salida correspondiente
      var idSalida = req.body.idSalida;
      var idMovil = null;
      for (var i = 0; i < registro.salidas.length; i++) {
        if (registro.salidas[i]._id == idSalida) {
          registro.salidas[i].fechaCancelacion = new Date();
          idMovil = registro.salidas[i].idMovil;
        }
      }
      //Liberar el movil
      Moviles.findOne({ _id: idMovil }, function (err, movil) {
        if (err) throw (err);
        movil.estado = 1;
        movil.save(function (err, movilModificado) {
          if (err) throw (err);
          io.sockets.emit('MovilPositionChange', movilModificado);
        });
      });

      //Audit
      registro.fechaModificacion = new Date();
      registro.usuario = req.user.username;

      registro.save(function (err, data) {
        if (err) throw (err);
        res.json(data);
        io.sockets.emit('dbChange', data);
        fb.actualizarMoviles(data);
      });
    });
  });




  return router;
}
//module.exports = router;
