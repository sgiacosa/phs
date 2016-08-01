var firebase = require('firebase');
var config = require("../modules/config");

///module.exports = firebase.initializeApp(config.FB_config);
module.exports = firebase.initializeApp({
    serviceAccount:config.FB_config_Server,
    databaseURL: "https://sien.firebaseio.com"
});

  