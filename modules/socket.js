module.exports = function (io) {
  io.on('connection', function(socket) {
    console.log("nueva coneccion");
    socket.broadcast.emit('connected', {lala:"lalala"});
  });

  

  /*io.sockets.on('connection', function(socket) {
    //..

  }*/
}
