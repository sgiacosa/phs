appModule.factory('RegistrosService', ['$http', function ($http) {
      return {
        getById: function(_id){
          return $http({ method: 'get', url: 'api/registro/'+ _id }).then(function (response) {
            return response.data
          });
        },
        listar: function (mostrarEventosFinalizados) {
          var data = {mostrarEventosFinalizados: mostrarEventosFinalizados};
          return $http({ method: 'post', url: 'api/registros/list/', data: data}).then(function (response) {
            return response.data
          });
        },
        guardarCambios: function (registro) {
          return $http({ method: 'post', url: 'api/registros/nuevoRegistro', data: registro }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        },
        cerrarRegistro: function (id) {
          return $http({
            method: 'post',
            url: 'api/registros/cerrar',
            data: {_id:id}

          }).then(function (response) {
            return response;
          },
          function (error) { return error; });
        },
      }
    }]);