var mongoose = require("mongoose");

var ConstantesSchema = new mongoose.Schema({
  tipos_salida: [{
    nombre:String,
    destinos:[String]
  }],
  moviles: [{
    _id:Number,
    nombre:String,
    estado:Number
  }]
});

module.exports = mongoose.model("constantes", ConstantesSchema);
