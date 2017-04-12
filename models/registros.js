var mongoose = require("mongoose");
var audit = require("../models/audit");

var RegistrosSchema = new mongoose.Schema({
  nombreContacto: String,
  telefonoContacto: String,
  direccion: String,
  referenciaDireccion:String,
  clasificacion: Number,
  observaciones: String,
  observacionesClasificacion: String,
  reporte: String,
  coordenadas: [Number],
  fechaRegistro: Date,
  fechaCierre: Date,
  fechaModificacion:Date,
  usuario: String,
  mensajes: [{
    mensaje: String,
    fecha: Date,
    usuario: String
  }],
  pacientes: [{
    nombre: String,
    edad: Number,
    sexo: Number,
    observacion: String
  }],
  salidas: [{
    idMovil: String,
    nombreMovil: String,
    fechaDespacho: Date,
    fechaEnMovimiento: Date,
    fechaArribo: Date,
    fechaDestino: Date,
    fechaQRU: Date,
    fechaCancelacion:Date,
    tipoSalida: { nombre: String, destino: String },
    idTipoFinalizacion: Number,
    idDestino: Number
  }],
  sms: [{
    fecha: Date,
    mensaje: String,
    usuario: String
  }]
});

// Validaciones pre
RegistrosSchema.pre('save', function (next) {

  //Controlo que todas las salidas cuyo tipo de salida sea != de Traslado no contenga destino
  for (var i = 0; i < this.salidas.length; i++) {
    if (this.salidas[i].tipoSalida.nombre != "Traslado")
      this.salidas[i].tipoSalida.destino="";
  }  
  next();
});

RegistrosSchema.post('save', function () {

  var newAudit = new audit({    
    documento: this.toJSON()
  });

  newAudit.save();
  
});


// Indexes this schema in 2dsphere format (critical for running proximity searches)
RegistrosSchema.index({ coordenadas: '2dsphere' });

module.exports = mongoose.model("registros", RegistrosSchema);



