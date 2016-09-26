
//TIPOS DE LLAMADOS
//1- Nuevo llamado
//2- Evento duplicado
//3- Llamado no relacionado

appModule.factory('LlamadosService', ['$http', function ($http) {
  return {
    nuevoLlamado: function (idRegistro, tipo, telefono, mensaje) {
      var data = { registro: idRegistro, tipo: tipo, telefono: telefono, mensaje: mensaje };
      return $http({ method: 'post', url: 'api/llamados/nuevo', data: data }).then(function (response) {
        return response;
      },
        function (error) {
          return error;

        });
    },
    
    search: function(searchOptions) {
      return $http({ method: 'post', url: 'api/search/llamados', data: searchOptions }).then(function (response) {
        return response;
      });
    }
  }
}]);