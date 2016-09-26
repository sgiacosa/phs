var mongoose = require("mongoose");

var MovilesSchema = new mongoose.Schema({
    nombre:String,
    estado:Number,
    posicion:[Number],
    imei:String
});
MovilesSchema.index({posicion: '2dsphere'});

module.exports = mongoose.model("moviles", MovilesSchema);
