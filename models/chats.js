var mongoose = require("mongoose");

var chatSchema = new mongoose.Schema({

    mensaje: String,
    fecha: Number,
    usuario: String

});

module.exports = mongoose.model("chats", chatSchema);