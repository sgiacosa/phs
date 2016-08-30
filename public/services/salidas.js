appModule.factory('SalidasService', ['$http', function ($http) {
      return {
        ByIdRegistro: function (idRegistro) {
          return $http({ method: 'get', url: 'api/salidas/' + idRegistro }).then(function (response) {
            return response.data
          });
        },

        indicarMovimiento: function (idRegistro, idSalida) {
          var data = {idRegistro :idRegistro, idSalida:idSalida}
          return $http({
            method: 'post',
            url: 'api/registros/salidas/indicarMovimiento',
            data: data

          }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },

        indicarArribo: function(idRegistro, idSalida) {
          var data = { idRegistro: idRegistro, idSalida: idSalida }
          return $http({
            method: 'post',
            url: 'api/registros/salidas/indicarArribo',
            data: data

          }).then(function (response) {
            return response;
          },
            function (error) {
              return error;
            });
        },
        indicarDestino: function (idRegistro, salida) {
          var data={idRegistro:idRegistro,
            idSalida: salida._id,
            nombre: salida.tipoSalida.nombre,
            destino: salida.tipoSalida.destino
          }
          return $http({ method: 'post', url: 'api/registros/salidas/indicarDestino', data: data }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },
        indicarQRU: function (idRegistro, idSalida) {
          return $http({
            method: 'post',
            url: 'api/registros/salidas/indicarQRU',
            data: {idRegistro: idRegistro, idSalida: idSalida}
          }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },

        indicarCancelacion: function (idRegistro, idSalida) {
          return $http({
            method: 'post',
            url: 'api/registros/salidas/indicarCancelacion',
            data: {idRegistro: idRegistro, idSalida: idSalida}
          }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },

        nuevaSalida: function (idMovil, idRegistro) {
          var data = { idMovil: idMovil, _id: idRegistro };
          return $http({ method: 'post', url: 'api/registros/salidas/nueva', data: data }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },
        getMovilesDisponibles: function (coords) {
          var data = {};
          if (coords && coords.length == 2)
          data= { latitud: coords[1], longitud: coords[0] };
          return $http({ method: 'post', url: 'api/moviles', data: data }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        }
      }
    }]);