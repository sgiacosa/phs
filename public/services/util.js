appModule.factory('UtilService', ['$http', function ($http) {
      return {
        getConstantes: function() {
          return $http({method:'get', url:'api/constantes'}).then(function(response) {
            return response.data;
          })
        }
      }
    }]);