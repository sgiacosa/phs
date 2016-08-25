appModule.factory('MensajesService', ['$http', function ($http) {
      return {
        nuevoMensaje: function (idRegistro, mensaje) {
          var data = { idRegistro: idRegistro, mensaje: mensaje };
          return $http({ method: 'post', url: 'api/mensajes/nuevo', data: data }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },
        nuevoSMS: function(mensaje) {
          return $http({ method: 'post', url: 'api/chats/sendsms', data: mensaje }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },
        listarSms: function (_ultimaFecha) {
          var data = {ultimaFecha: _ultimaFecha};
          return $http({ method: 'post', url: 'api/chats/list/', data: data}).then(function (response) {
            return response.data
          });
        }
      }
    }]);