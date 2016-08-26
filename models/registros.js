var mongoose = require("mongoose");

var RegistrosSchema = new mongoose.Schema({
  nombreContacto: String,
  telefonoContacto: String,
  direccion: String,
  clasificacion: Number,
  observaciones: String,
  observacionesClasificacion: String,
  reporte: String,
  coordenadas: [Number],
  fechaRegistro: Date,
  fechaCierre: Date,
  idUsuario: Number,
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
  //this.mensajes=[];
  next();
});


// Indexes this schema in 2dsphere format (critical for running proximity searches)
RegistrosSchema.index({ coordenadas: '2dsphere' });

module.exports = mongoose.model("registros", RegistrosSchema);


/*var constantes = [{
  "tipos_salida" : [
    {"nombre":"Atención en el lugar"},
    {"nombre":"Traslado", destinos: ["Hospital Castro Rendón", "Hospital Heller", "Hospital Bouquet Roldán"]},
    {"nombre": "No se encontró al paciente"},
    {"nombre":"Óbito"}
  ],
  "moviles": [
    {"_id": "1", "nombre":"Móvil 1", "estado":"1"},
    {"_id": "2", "nombre":"Móvil 2", "estado":"1"},
    {"_id": "3", "nombre":"Móvil 3", "estado":"1"},
    {"_id": "4", "nombre":"Móvil 4", "estado":"1"},
    {"_id": "5", "nombre":"Móvil 5", "estado":"1"},
    {"_id": "6", "nombre":"Móvil 6", "estado":"1"}
  ]
}]*/
