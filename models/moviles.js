var mongoose = require("mongoose");

var MovilesSchema = new mongoose.Schema({
    nombre: String,
    estado: Number,
    posicion: [Number],
    imei: String,
    idGps: String,
    device: {
        isGpsOn: Boolean,
        battery_low: Boolean,
        isMobileDataOn: Boolean,
        isSirenOn:Boolean,
        isPanicButtonOn:Boolean
    },
    movimiento: {
        course: Number,
        date: Date,
        latitude: Number,
        longitude: Number,
        provider: String,
        speed: Number
    }
});
MovilesSchema.index({ posicion: '2dsphere' });

module.exports = mongoose.model("moviles", MovilesSchema);
