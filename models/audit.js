var mongoose = require("mongoose");


var auditSchema = new mongoose.Schema({

    documento: {}
    

});

module.exports = mongoose.model("audit", auditSchema);