appModule.factory('SalidasService', ['$http', '$q', function ($http, $q) {
  return {
    ByIdRegistro: function (idRegistro) {
      return $http({ method: 'get', url: 'api/salidas/' + idRegistro }).then(function (response) {
        return response.data
      });
    },

    indicarMovimiento: function (idRegistro, idSalida) {
      var data = { idRegistro: idRegistro, idSalida: idSalida }
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

    indicarArribo: function (idRegistro, idSalida) {
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
      var data = {
        idRegistro: idRegistro,
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
        data: { idRegistro: idRegistro, idSalida: idSalida }
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
        data: { idRegistro: idRegistro, idSalida: idSalida }
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

      function getDistanceMatrix(origins, destinations) {        
        var defer = $q.defer();
        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
          origins: origins,
          destinations: destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, function (response, status) {          
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            defer.reject(status);
          } else {
            defer.resolve(response)
          }
        });
        return defer.promise;
      }

      var defer = $q.defer();

      var data = {};
      if (coords && coords.length == 2)
        data = { latitud: coords[1], longitud: coords[0] };
      $http({ method: 'post', url: 'api/moviles', data: data }).then(function (moviles) {
        /*Matrix*/
        if (coords && coords.length == 2) {
          var destination = [{ lat: coords[1], lng: coords[0] }];
          var origins = [];
          for (var i = 0; i < moviles.data.length; i++) {
            origins.push({ lat: moviles.data[i].obj.posicion[1], lng: moviles.data[i].obj.posicion[0] });
          }

          var matrix = getDistanceMatrix(origins, destination).then(function (distancias) {
            for (var i = 0; i < moviles.data.length; i++) {
              moviles.data[i].distance = distancias.rows[i].elements[0].distance;
              moviles.data[i].duration = distancias.rows[i].elements[0].duration;
            }
            defer.resolve(moviles);
          });
        }
        else
          defer.resolve(moviles);

        /*FIN MATRIX*/

      },
        function (error) {
          return error;
        });

      return defer.promise;
    }
  }
}]);