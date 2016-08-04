var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    nombre:String,
    apellido:String,
    username:String,
    password:String
});

module.exports = mongoose.model("usuarios", UserSchema);
