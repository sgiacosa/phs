var telegram = require('telegram-bot-api');

var api = new telegram({
    token: '228682953:AAH9lw3WsmKUhCbFCi4BEKU3bYV_-aN36Vw',
    updates: {
        enabled: true,
        get_interval: 500
    }
});

api.getMe()
    .then(function (data) {
        console.log(data);
    })
    .catch(function (err) {
        console.log(err);
    });

api.on('message', function (msg) {
    // Received text message
    console.log(msg);

    switch (true) {
        case /^\/zona/.test(msg.text):
            console.log("zona");
            break;

        default:
            console.log("• Didn't match any test");
            break;
    }

});