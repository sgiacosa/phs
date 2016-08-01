var appModule = angular.module('sien', ['ngAnimate', 'ngRoute', 'uiGmapgoogle-maps', 'firebase', 'ui.bootstrap', 'angularMoment', 'angular-jwt', 'btford.socket-io', 'oitozero.ngSweetAlert']);

appModule.constant('angularMomentConfig', {
  timezone: 'America/Argentina/Buenos_Aires' // e.g. 'Europe/London'
});

appModule.config(['$httpProvider',function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
}]);

appModule.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
  // Configurar el modo HTML5
  $locationProvider.html5Mode(true);

  $routeProvider
  .when('/', {
    templateUrl: 'partial/list.html',
    controller: 'ListController'
  })
  .when('/evento/:id', {
    templateUrl: 'partial/evento.html',
    controller: 'EventoController'
  })
  .when('/search', {
    templateUrl: 'partial/search.html',
    controller: 'SearchController'
  })
  .when('/login', {
    templateUrl: 'partial/login.html',
    controller: 'LoginController'
  })
  .when('/logout', {
    templateUrl: 'partial/login.html',
    controller: 'LoginController'
  })
  .when('/changepassword', {
    templateUrl: 'partial/changepassword.html',
    controller: 'LoginController'
  })
  .when('/monitor', {
    templateUrl: 'partial/monitor.html',
    controller: 'monitorController'
  })
  ;
}])

/******************************************* FILTERS    ***************************************************************/

appModule.filter('diferencia', function () {
  return function (fecha1, fecha2, format) {
    var duration = moment.duration(moment(fecha2).diff(moment(fecha1))).format("hh:mm");
    return duration;
  }
});

/******************************************* SERVICES    ***************************************************************/
appModule.factory('mySocket',['socketFactory', function (socketFactory) {
  return socketFactory();
}]);

appModule.factory('authInterceptor',['$rootScope', '$q', '$window','$location', function ($rootScope, $q, $window,$location) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        // handle the case where the user is not authenticated
        $location.path('/login');
      }
      return $q.reject(rejection);
    }
  };
}]);

appModule.factory('LoginService',['$http', '$window', 'jwtHelper', function($http, $window, jwtHelper) {
  return {
    login: function(user,pass){
      return $http({ method: 'post', url: 'auth/login', data:{username:user, password: pass} }).then(
        function (response) {
          return response;
        }, function (err){
          return err;
        });
      },
      getUserData: function(){
        if ($window.sessionStorage.token)
        return jwtHelper.decodeToken($window.sessionStorage.token);
        else
        return null;
      },
      cambiarContrasena: function(actual,nueva){
        if ($window.sessionStorage.token){
          var user= jwtHelper.decodeToken($window.sessionStorage.token)
          var data = {username: user.username, actual: actual, nueva: nueva};
          return $http({ method: 'post', url: 'auth/changepassword', data:data }).then(
            function (response) {
              return response;
            }, function (err){
              return err;
            });
          }
          else
          return null;
        }
      }
    }]);

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

    appModule.factory('SalidasService', ['$http', function ($http) {
      return {
        ByIdRegistro: function (idRegistro) {
          return $http({ method: 'get', url: 'api/salidas/' + idRegistro }).then(function (response) {
            return response.data
          });
        },

        indicarArribo: function (idRegistro, idSalida) {
          var data = {idRegistro :idRegistro, idSalida:idSalida}
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

    appModule.factory('UtilService', ['$http', function ($http) {
      return {
        getConstantes: function() {
          return $http({method:'get', url:'api/constantes'}).then(function(response) {
            return response.data;
          })
        }
      }
    }]);

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
          return $http({ method: 'post', url: 'api/registros/sendsms', data: mensaje }).then(function (response) {
            return response;
          },
          function (error) {
            return error;
          });
        }
      }
    }]);

    appModule.factory('SearchService', ['$http', '$filter', function ($http, $filter) {
      return {
        search: function(searchOptions) {
          return $http({ method: 'post', url: 'api/search/events', data: searchOptions }).then(function (response) {
            return response;
          });
        },
        searchCie10: function (cie10) {
          //Verifico si se encuentra en elastic search
          var searchOptions = {"direccion":cie10};

          return $http({ method: 'post', url: 'api/search/cie10', data: searchOptions }).then(function (response) {
            return response;
          });
        },
        searchAddress: function (direccion, ciudad) {
          //Verifico si se encuentra en elastic search
          var searchOptions = {"direccion":direccion, "ciudad": ciudad};

          return $http({ method: 'post', url: 'api/search/streets', data: searchOptions }).then(function (response) {
            return response;
          });
        },
        geoCode: function (direccion) {

          var _address = direccion.replace(' ','%20');
          return $http({ method: 'get', url: 'https://nominatim.openstreetmap.org/search?street='+_address+'&city=neuquen&format=json' }).then(function (response) {

            if (response.status == 200) {
            }
            else {
              response.data = [];
            }
            return response.data;
          });
        }
      }
    }]);
