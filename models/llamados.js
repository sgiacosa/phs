var mongoose = require("mongoose");

var llamadoSchema = new mongoose.Schema({

    mensaje: String,
    fecha: Date,
    usuario: String,
    tipo: Number,
    telefono: String,
    registro: mongoose.Schema.Types.ObjectId

});

module.exports = mongoose.model("llamados", llamadoSchema);