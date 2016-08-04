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

appModule.directive("flujo", ['$filter', '$http', '$timeout', 'SearchService', function ($filter, $http, $timeout, SearchService) {
    return {
        restrict: "E",
        scope: {
            color: '=color',
            descripcion: '=descripcion',
            modoEdicion:'=modoedicion'
        },
        templateUrl: 'directives/templates/flujo.html',
        transclude: true,

        link: function (scope, elem) {
            scope.actualizar = false;
            scope.facts = [];
            scope.Pila = [];
            scope.CIE10SearchResult=[];

            $http.get('js/rules.nools').then(function (resp) {

                if (!nools.getFlow("Categorizacion SIEN")) {
                    scope.flow = nools.compile(resp.data, { name: 'Categorizacion SIEN' });
                }
                else {
                  scope.flow = nools.getFlow("Categorizacion SIEN");
                }
                scope.Regla = scope.flow.getDefined("Regla");
            });
            //Agrego un watch para saber cuando ingresa en modo edición
            scope.$watch('modoEdicion', function (newVal, oldVal) {
                if (angular.equals(newVal, oldVal)) {
                    return; // simply skip that
                }
                if (newVal == false) {
                    scope.actualizar = false;
                }
            }, true);

            scope.initFlujo = function () {
                scope.facts = [];
                scope.Pila = [];
                scope.actualizar = true;
                scope.registro = new scope.Regla({ id_regla: 0, nombre: 'lala', descripcion: '', tipo: 1, color: 1, valor: null });
                scope.facts.push(scope.registro);
                scope.next(0, null);
            }

            scope.AsignarColor = function () {
                var _pila = scope.Pila;
                _pila.push(scope.facts[0]);
                //Actualizo el color
                scope.color = Math.max.apply(Math, _pila.map(function (o) { return o.color; }));
                //Actualizo la descripción
                scope.descripcion = _pila.map(function (o) { return o.descripcion; }).filter(function (y) { if (y.length > 1) return y; }).join(' - ');
                _pila.pop();
            }

            scope.next = function (idRegla, value) {
                //Busco la regla seleccionada
                var reglaselecccionada = $filter('filter')(scope.facts, { id_regla: parseInt(idRegla)  }, true)[0];

                if (value != null)
                    reglaselecccionada.valor = value;

                scope.Pila.push(reglaselecccionada);

                //Limpio los facts
                scope.facts = [];
                var session = scope.flow.getSession(reglaselecccionada);

                session.on("acierto", function (fact) {
                    scope.facts.push(fact);
                });


                session.match().then(
                  function () {
                      scope.AsignarColor();
                      scope.$apply();
                  },
                  function (err) {
                      //uh oh an error occurred
                      console.error(err.stack);
                  });
            };

            scope.prev = function () {
              //Si no tiene facts vuelvo al inicio- Esto lo utilizo para volver del CIE10
              if (scope.facts.length == 0){
                scope.Pila.pop();
                scope.Pila.pop();
              }


                if (scope.Pila.length != 1)
                    scope.Pila.pop();
                var reglaselecccionada = scope.Pila[scope.Pila.length - 1];
                //reglaselecccionada.valor = null;

                //Limpio los facts
                scope.facts = [];
                var session = scope.flow.getSession(reglaselecccionada);

                session.on("acierto", function (fact) {
                    scope.facts.push(fact);
                });


                session.match().then(
                  function () {
                      scope.AsignarColor();
                      scope.$apply();
                  },
                  function (err) {
                      //uh oh an error occurred
                      console.error(err.stack);
                  });
            };

            scope.cie10_SelectChange = function () {
              scope.color = this.color;
            };

            scope.BuscarCie10 = function(texto){
              //debugger;
              if (!texto || texto.length < 3)
                return true;
              SearchService.searchCie10(texto).then(function (response) {
                if (response.status == 200) {
                  var calles = [];
                  for (var i = 0, len = response.data.length; i < len; i++) {
                    calles.push(response.data[i].nombre);
                  }
                  scope.CIE10SearchResult = calles;
                }
                else
                alert("Error - verifique la conexión a internet.");
              });
            };

            scope.Cie10Seleccionado = function() {
                scope.descripcion = this.cie10;
            }


        }

    };
}]);

/* --- Made by justgoscha and licensed under MIT license --- */


appModule.directive('autocomplete', function () {
    var index = -1;

    return {
        restrict: 'E',
        scope: {
            searchParam: '=ngModel',
            suggestions: '=data',
            onType: '=onType',
            onSelect: '=onSelect',
            autocompleteRequired: '=',
            onBlur: '@'
        },        
        controller: ['$scope', function ($scope) {
            // the index of the suggestions that's currently selected
            $scope.selectedIndex = -1;            
            $scope.initLock = true;            
            // set new index
            $scope.setIndex = function (i) {
                $scope.selectedIndex = parseInt(i);
            };

            this.setIndex = function (i) {
                $scope.setIndex(i);
                $scope.$apply();
            };

            $scope.getIndex = function (i) {
                return $scope.selectedIndex;
            };

            // watches if the parameter filter should be changed
            var watching = true;

            // autocompleting drop down on/off
            $scope.completing = false;

            // starts autocompleting on typing in something
            $scope.$watch('searchParam', function (newValue, oldValue) {

                if (oldValue === newValue || (!oldValue && $scope.initLock)) {
                    return;
                }

                if (watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
                    $scope.completing = true;
                    $scope.searchFilter = $scope.searchParam;
                    $scope.selectedIndex = -1;
                }

                // function thats passed to on-type attribute gets executed
                if ($scope.onType)
                    $scope.onType($scope.searchParam);
            });

            // for hovering over suggestions
            this.preSelect = function (suggestion) {

                watching = false;

                // this line determines if it is shown
                // in the input field before it's selected:
                //$scope.searchParam = suggestion;

                $scope.$apply();
                watching = true;

            };

            $scope.preSelect = this.preSelect;

            this.preSelectOff = function () {
                watching = true;
            };

            $scope.preSelectOff = this.preSelectOff;

            // selecting a suggestion with RIGHT ARROW or ENTER
            $scope.select = function (suggestion) {
                if (suggestion) {
                    $scope.searchParam = suggestion;
                    $scope.searchFilter = suggestion;
                    if ($scope.onSelect)
                        $scope.onSelect(suggestion);
                }
                watching = false;
                $scope.completing = false;
                setTimeout(function () { watching = true; }, 1000);
                $scope.setIndex(-1);
            };


        }],
        link: function (scope, element, attrs) {

            setTimeout(function () {
                scope.initLock = false;
                scope.$apply();
            }, 250);

            var attr = '';

            // Default atts
            scope.attrs = {
                "placeholder": "start typing...",
                "class": "",
                "id": "",
                "inputclass": "",
                "inputid": ""
            };

            for (var a in attrs) {
                attr = a.replace('attr', '').toLowerCase();
                // add attribute overriding defaults
                // and preventing duplication
                if (a.indexOf('attr') === 0) {
                    scope.attrs[attr] = attrs[a];
                }
            }

            if (attrs.clickActivation) {
                element[0].onclick = function (e) {
                    if (!scope.searchParam) {
                        setTimeout(function () {
                            scope.completing = true;
                            scope.$apply();
                        }, 200);
                    }
                };
            }

            var key = { left: 37, up: 38, right: 39, down: 40, enter: 13, esc: 27, tab: 9 };

            document.addEventListener("keydown", function (e) {
                var keycode = e.keyCode || e.which;

                switch (keycode) {
                    case key.esc:
                        // disable suggestions on escape
                        scope.select();
                        scope.setIndex(-1);
                        scope.$apply();
                        e.preventDefault();
                }
            }, true);

            element[0].addEventListener("blur", function (e) {
                // disable suggestions on blur
                // we do a timeout to prevent hiding it before a click event is registered
                setTimeout(function () {
                    scope.select();
                    scope.setIndex(-1);
                    //debugger;
                    if (attrs.onBlur != null)
                        scope.$parent.$apply(attrs.onBlur);
                    scope.$apply();
                }, 150);
            }, true);

            element[0].addEventListener("keydown", function (e) {
                var keycode = e.keyCode || e.which;

                var l = angular.element(this).find('li').length;

                // this allows submitting forms by pressing Enter in the autocompleted field
                if (!scope.completing || l == 0) return;

                // implementation of the up and down movement in the list of suggestions
                switch (keycode) {
                    case key.up:

                        index = scope.getIndex() - 1;
                        if (index < -1) {
                            index = l - 1;
                        } else if (index >= l) {
                            index = -1;
                            scope.setIndex(index);
                            scope.preSelectOff();
                            break;
                        }
                        scope.setIndex(index);

                        if (index !== -1)
                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

                        scope.$apply();

                        break;
                    case key.down:
                        index = scope.getIndex() + 1;
                        if (index < -1) {
                            index = l - 1;
                        } else if (index >= l) {
                            index = -1;
                            scope.setIndex(index);
                            scope.preSelectOff();
                            scope.$apply();
                            break;
                        }
                        scope.setIndex(index);

                        if (index !== -1)
                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

                        break;
                    case key.left:
                        break;
                    case key.right:
                    case key.enter:
                    case key.tab:

                        index = scope.getIndex();
                        // scope.preSelectOff();
                        if (index !== -1) {
                            scope.select(angular.element(angular.element(this).find('li')[index]).text());
                            if (keycode == key.enter) {
                                e.preventDefault();
                            }
                        } else {
                            if (keycode == key.enter) {
                                scope.select();
                            }
                        }
                        scope.setIndex(-1);
                        scope.$apply();

                        break;
                    case key.esc:
                        // disable suggestions on escape
                        scope.select();
                        scope.setIndex(-1);
                        scope.$apply();
                        e.preventDefault();
                        break;
                    default:
                        return;
                }

            });
        },
        //<ul ng-show="completing && (suggestions | filter:searchFilter).length > 0">\
        //ng-repeat="suggestion in suggestions | filter:searchFilter | orderBy:\'toString()\' track by $index"\
        template: '\
        <div class="autocomplete {{ attrs.class }}" id="{{ attrs.id }}">\
          <input\
            type="text"\
            ng-model="searchParam"\
            placeholder="{{ attrs.placeholder }}"\
            class="{{ attrs.inputclass }}"\
            id="{{ attrs.inputid }}"\
            ng-required="{{ autocompleteRequired }}" />\
          <ul ng-show="completing && (suggestions).length > 0">\
            <li\
              suggestion\
              ng-repeat="suggestion in suggestions | orderBy:\'toString()\' track by $index"\
              index="{{ $index }}"\
              val="{{ suggestion }}"\
              ng-class="{ active: ($index === selectedIndex) }"\
              ng-click="select(suggestion)"\
              ng-bind-html="suggestion | highlight:searchParam"></li>\
          </ul>\
        </div>'
    };
});



appModule.filter('highlight', ['$sce', function ($sce) {
    return function (input, searchParam) {
        if (typeof input === 'function') return '';
        if (searchParam) {
            var words = '(' +
                  searchParam.split(/\ /).join(' |') + '|' +
                  searchParam.split(/\ /).join('|') +
                ')',
                exp = new RegExp(words, 'gi');
            if (words.length) {
                input = input.replace(exp, "<span class=\"highlight\">$1</span>");
            }
        }
        return $sce.trustAsHtml(input);
    };
}]);

appModule.directive('suggestion', function () {
    return {
        restrict: 'A',
        require: '^autocomplete', // ^look for controller on parents element
        link: function (scope, element, attrs, autoCtrl) {
            element.bind('mouseenter', function () {
                autoCtrl.preSelect(attrs.val);
                autoCtrl.setIndex(attrs.index);
            });

            element.bind('mouseleave', function () {
                autoCtrl.preSelectOff();
            });
        }
    };
});

appModule.directive("kmlmanager", ['$filter',  function ($filter) {
  return {
    restrict: "E",
    scope: {
      kml: '=kml',
      map: '=map'
    },
    templateUrl: 'directives/templates/kml.html',
    link: function (scope, element, attrs) {
      scope.kmlArray = [];
      var kmlLayer=null;

      for (var i = 0;i< scope.kml.length; i++){
        kmlLayer= new google.maps.KmlLayer({
          url:scope.kml[i].url,
          map: scope.kml[i].visible? scope.map:null,
          preserveViewport: true
        });
        scope.kmlArray.push({kml:kmlLayer, visible: scope.kml[i].visible, title: scope.kml[i].title, icon: scope.kml[i].icon});
      }

      scope.ToggleLayer = function(i){
        scope.kmlArray[i].visible = !scope.kmlArray[i].visible;
        //Recorro el array y vuelvo a regenerar los layers para restaurar el orden
        for (var z=0; z < scope.kmlArray.length; z++){
          scope.kmlArray[z].kml.setMap(null)
          if(scope.kmlArray[z].visible)
            scope.kmlArray[z].kml.setMap(scope.map);
        }
      }


      /*scope.kml=attrs.kml;
      scope.map=attrs.map;*/

      /*scope.$watch(attrs.focusMe, function (value) {
      if (value === true) {
      console.log('value=', value);
      //$timeout(function() {
      element[0].focus();
      scope[attrs.focusMe] = false;
      //});
    }
  });*/
}
};

}]);

appModule.controller('ListController', ['$scope', '$location', '$window','RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http','LoginService','mySocket', '$timeout', function ($scope, $location, $window, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http, LoginService, mySocket, $timeout) {
  angular.extend($scope, {
    loading: false,
    loadingPrincipal: true,
    registros: [],
    registroSeleccionado: null,
    finalizaciones: [],
    destinos: [],
    moviles: [],
    alertaCambios:false,
    searchOptions:{
      mostrarEventosFinalizados:false
    },

    initSocket: function () {
      mySocket.on('connected', function (data) {
        console.log("connected "+data);
      });
      mySocket.on('dbChange', function (data) {
        $scope.alertaCambios = true;
        $timeout(function() {
         $scope.actualizarRegistros()}, 10 * 1000);
      });
    },

    mostrarEvento : function(_id) {
      // Cambia la vista usando el servicio $location
      $location.path('/evento/' + _id);
    },

    actualizarRegistros: function () {
      $scope.loading = true;
      $scope.alertaCambios = false;
      $scope.registros = [];
      RegistrosService.listar($scope.searchOptions.mostrarEventosFinalizados).then(function (data) {
        $scope.registros = data;
        $scope.loading = false;
      });
    },

    init: function () {
      $scope.loadingPrincipal = true;
      RegistrosService.listar().then(function (data) {
        $scope.registros = data;

        UtilService.getConstantes().then(function (data) {
          $scope.finalizaciones = data.tipos_salida;
          $scope.moviles = data.moviles;
          $scope.loadingPrincipal = false;
        });
        $scope.userData = LoginService.getUserData();
        $scope.initSocket();
      });
    }
  });
  $scope.init();
}]);

appModule.controller('EventoController', ['$scope', '$location', '$routeParams', 'RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http','SweetAlert','$timeout','uiGmapPropMap', function ($scope, $location, $routeParams, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http, SweetAlert,$timeout, uiGmapPropMap) {
  angular.extend($scope, {
    evento:{},
    loading: false,
    loadingPrincipal: true,
    nuevaSalida:false,
    mostrarBotonGuardar: false,
    googleMapLoading: false,
    googleSearchInit: false,
    streetSearchResult: null,
    watchRegistros: null,
    watchCoords: null,
    color: 5,
    txtMensaje: { 'value': '' },
    timeLine: [],
    opcionesSexo: [{ id: 1, name: "Masc" }, { id: 2, name: "Fem" }],
    descripcionFlujo: '',
    registros: [],
    registroSeleccionado: null,
    finalizaciones: [],
    destinos: [],
    moviles: [],
    showmap: false,
    map_alta: { center: { latitude: -38.94, longitude: -67.91 }, zoom: 14, control: {} },
    marker_alta: {
      id: 0,
      coords: {
        latitude: 40.1451,
        longitude: -99.6680
      },
      options: { draggable: true }
    },
    kml:[{
      url:'http://www.google.com/maps/d/u/0/kml?mid=1WUYfyxf3toKH8LvIqU3IR-mphPo&lid=zV713s5UBi9s.k-L9mgOq5eas',
      visible: false,
      title: "Cuadrículas",
      icon:'fa fa-car'
    },
    {
      url:'http://www.google.com/maps/d/u/0/kml?mid=1WUYfyxf3toKH8LvIqU3IR-mphPo&lid=zV713s5UBi9s.kkXrY9io13H0',
      visible: false,
      title: "Comisarias",
      icon:'fa fa-home'
    },
  ],


  indicarArribo: function (_idSalida) {
    $scope.loading = true;
    SalidasService.indicarArribo($scope.registroSeleccionado._id, _idSalida).then(function (data) {
      if (data.status == 200){
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else {
        SweetAlert.swal("Atención",data.data, "error");
        $scope.loading = false;
      }
    });
  },

  indicarDestino: function (salida) {
    $scope.loading = true;
    SalidasService.indicarDestino($scope.registroSeleccionado._id, salida).then(function (data) {
      if (data.status == 200){
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else {
        SweetAlert.swal("Atención",data.data, "error");
        $scope.loading = false;
      }
    });
  },
  indicarQRU: function (_idSalida) {
    $scope.loading = true;
    SalidasService.indicarQRU($scope.registroSeleccionado._id, _idSalida).then(function (data) {
      if (data.status == 200)
      {
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else {
        SweetAlert.swal("Atención",data.data, "error");
        $scope.loading = false;
      }
    });
  },

  prepareNuevaSalida: function(){
    $scope.nuevaSalida=true;
    //Verifico disponibilidad y posicion de los moviles
    $scope.moviles=[];
    SalidasService.getMovilesDisponibles($scope.registroSeleccionado.coordenadas).then(function(data){
      for(var i=0; i< data.data.length; i++){
        if (!$scope.registroSeleccionado.coordenadas){
          //solo moviles disponibles
          if(data.data[i].estado == "1"){
            $scope.moviles.push({_id: data.data[i]._id, nombre: data.data[i].nombre, distancia: "-" });
          }
        }
        else{
          //solo moviles disponibles
          if(data.data[i].obj.estado == "1"){
            $scope.moviles.push({_id: data.data[i].obj._id, nombre: data.data[i].obj.nombre, distancia: data.data[i].dis });
          }
        }
      }
    });
  },

  enviarMovil: function (idMovil) {
    $scope.loading = true;
    SalidasService.nuevaSalida(idMovil, $scope.registroSeleccionado._id).then(function (data) {
      if (data.status == 200){
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else
      SweetAlert.swal("Atención",data.data, "error");
      $scope.nuevaSalida = false;
      $scope.loading = false;
    });
  },

  generarObjetoTimeLine: function () {
    $scope.timeLine = [];
    $scope.timeLine.push({ fecha: $scope.registroSeleccionado.fechaRegistro, titulo: 'Registra el evento', usuario: 'Usuario común', descripcion: 'Clasificación: ' + $filter('filter')([{ id: 0, name: 'No especificada' }, { id: 1, name: 'Verde' }, { id: 2, name: 'Amarillo' }, { id: 3, name: 'Rojo' }], { id: $scope.registroSeleccionado.clasificacion })[0].name, tipo: 1 });
    //Cargo los despachos
    $scope.registroSeleccionado.salidas.forEach(function (s) {
      $scope.timeLine.push({ fecha: s.fechaDespacho, titulo: 'Despacho ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
      if (s.fechaArribo)
      $scope.timeLine.push({ fecha: s.fechaArribo, titulo: 'Arriba ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
      if (s.fechaDestino) {
        //var _finalizacion = $filter('filter')($scope.finalizaciones, { id: s.idTipoFinalizacion })[0].descripcion;
        //var _destino = s.idDestino ? (' -> ' + $filter('filter')($scope.destinos, { id: s.idDestino })[0].descripcion) : '';
        $scope.timeLine.push({ fecha: s.fechaDestino, titulo: 'Destino', usuario: '', tipo: 2, descripcion: s.nombreMovil + ': ' + s.tipoSalida.nombre + ' ' + s.tipoSalida.destino });
      }
      if (s.fechaQRU)
      $scope.timeLine.push({ fecha: s.fechaQRU, titulo: 'QRU ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
    });

    //Cargo los mensajes
    $scope.registroSeleccionado.mensajes.forEach(function (s) {
      $scope.timeLine.push({ fecha: s.fecha, titulo: 'Mensaje ', descripcion: s.mensaje, usuario: '', tipo: 4 })
    });

    //Cierre del evento
    if ($scope.registroSeleccionado.fechaCierre)
    $scope.timeLine.push({ fecha: $scope.registroSeleccionado.fechaCierre, titulo: 'Cierre del evento', usuario: '', tipo: 3 });

  },

  cerrarRegistro: function () {
    SweetAlert.swal({
      title: "Está seguro que desea cerrar este evento?",
      text: "Una vez modificado no podrá ser modificado",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, cerrar el evento",
      closeOnConfirm: true,
      closeOnCancel: true},
      function(respuesta){
        if (!respuesta)
        return;
        $scope.loading = true;
        RegistrosService.cerrarRegistro($scope.registroSeleccionado._id).then(function (response) {
          if (response.status == 200) {
            $scope.mostrarBotonGuardar = false;
            //Actualizo los datos
            $scope.registroSeleccionado = response.data;
            $scope.initData();
          }
          else
          if (response.status == 403){
            $timeout(function () {
              SweetAlert.swal("Atención",response.data, "info");
            }, 100);
          }
          else
          $timeout(function () {
            SweetAlert.swal("Error en el servidor",response.data, "error");
          }, 100);

          $scope.loading = false;
        });
      });
    },

    /*******************   MENSAJES   ****************************/

    enviarMensaje: function () {
      if ($scope.txtMensaje.value) {
        var mensaje= {mensaje:$scope.txtMensaje.value, fecha:null};
        $scope.registroSeleccionado.mensajes.push(mensaje);
        $scope.txtMensaje.value = "";
      }
    },

    enviarSMS: function () {
      if ($scope.txtSms.length > 0) {
        var mensaje= {_id: $scope.registroSeleccionado._id, mensaje:$scope.txtSms};
        MensajesService.nuevoSMS(mensaje).then(function (response) {
          if (response.status == 200) {
            $scope.txtSms = "";
            //Actualizo los datos
            $scope.registroSeleccionado = response.data;
            $scope.initData();
          }
        });

      }
    },

    generarTextoSMS: function(){
      var mensaje ="";
      mensaje += " Recibe pedido: "+$filter('date')($scope.registroSeleccionado.fechaRegistro, 'HH:mm');
      if ($scope.registroSeleccionado.direccion)
      mensaje += " Direccion: "+$scope.registroSeleccionado.direccion;
      if ($scope.registroSeleccionado.observaciones)
      mensaje += " Anotación: "+$scope.registroSeleccionado.observaciones;
      if ($scope.registroSeleccionado.reporte)
      mensaje += "Reporte: "+$scope.registroSeleccionado.reporte;
      for (var i=0; i<$scope.registroSeleccionado.mensajes.length;i++)
      mensaje += " Mensaje: "+$scope.registroSeleccionado.mensajes[i].mensaje;
      for (var i=0; i<$scope.registroSeleccionado.salidas.length;i++)
      mensaje += " Asiste: "+$scope.registroSeleccionado.salidas[i].nombreMovil;
      if ($scope.registroSeleccionado.fechaCierre)
      mensaje += " Finaliza: "+$filter('date')($scope.registroSeleccionado.fechaCierre, 'HH:mm');

      $scope.txtSms = mensaje;
    },


    /*******************************************************/

    guardarCambios: function () {
      $scope.loading = true;
      RegistrosService.guardarCambios($scope.registroSeleccionado).then(function (data) {

        if (data.status == 200) {
          $scope.mostrarBotonGuardar = false;
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else
        SweetAlert.swal("Atención","Error al intentar guardar los datos.", "error");
        $scope.loading = false;
      });
    },

    cancelarCambios: function () {
      //Elimino el watch
      $scope.StopWatch();

      if ($scope.registroSeleccionado._id == 0) {
        $scope.registroSeleccionado = null;
        $scope.mostrarBotonGuardar = false;
        return;
      }
      $scope.registroSeleccionado = JSON.parse(JSON.stringify($filter('filter')($scope.registros, { id: $scope.registroSeleccionado._id })[0]));
      $scope.mostrarBotonGuardar = false;

      //Vuelvo a crear el watch
      $scope.InitWatch();
    },

    initData: function (_id) {
      //Controlo que guarde los cambios
      if ($scope.mostrarBotonGuardar && $scope.registroSeleccionado.fechaCierre == null) {
        SweetAlert.swal("Atención","Por favor guarde los cambios para poder continuar. Gracias", "info");
        return;
      }

      //Elimino el watch
      $scope.StopWatch();

      /*if (_id)
      $scope.registroSeleccionado = JSON.parse(JSON.stringify($filter('filter')($scope.registros, { _id: _id })[0]));
      else {
      //var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coords: { latitude: null, longitude: null }, fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [] }
      var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coordenadas: [], fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [] }
      $scope.registroSeleccionado = JSON.parse(JSON.stringify(nuevoRegistro));
    }*/

    //si tiene coords el array centro el mapa //IMPORTANTE [LON, LAT]
    if ($scope.registroSeleccionado.coordenadas && $scope.registroSeleccionado.coordenadas.length == 2){
      //Asocio el marker_alta.coords a coordenadas
      $scope.marker_alta.coords.longitude = $scope.registroSeleccionado.coordenadas[0];
      $scope.marker_alta.coords.latitude = $scope.registroSeleccionado.coordenadas[1];
      //Centro el mapa
      $scope.map_alta.control.refresh({ latitude: $scope.registroSeleccionado.coordenadas[1], longitude: $scope.registroSeleccionado.coordenadas[0] });
    }

    $scope.mostrarBotonGuardar = false;

    //Verifico si tiene pacientes y si es necesario agregar uno en blanco
    //Filtro los objectos que estan vacios
    var emptyObj = $filter('filter')($scope.registroSeleccionado.pacientes, function (value) {
      if (value.edad == "" && value.nombre == "")
      return true
    });
    if (emptyObj && emptyObj.length == 0)
    //creo un nuevo registro en blanco para que puedan seguir agregando
    $scope.registroSeleccionado.pacientes.push({ nombre: '', edad: '', sexo: '', observacion: '' });

    //Vuelvo a crear el watch
    $scope.InitWatch();
    //Genero el timeline
    $scope.generarObjetoTimeLine();

  },

  BuscarDomicilio: function () {
    debugger;
    if (!$scope.registroSeleccionado.direccion || $scope.registroSeleccionado.direccion.length < 3)
    return;
    SearchService.searchAddress($scope.registroSeleccionado.direccion, 'neuquen').then(function (response) {
      if (response.status == 200) {
        var calles = [];
        for (var i = 0, len = response.data.length; i < len; i++) {
          calles.push(response.data[i].nombre);
        }
        $scope.streetSearchResult = calles;
      }
      else
      SweetAlert.swal("Error","Verifique su conexión a internet", "error");
    });
  },

  GeoCode: function () {
    if (!$scope.registroSeleccionado.direccion || $scope.registroSeleccionado.direccion.length < 3)
    return;
    $scope.googleMapLoading = true;
    SearchService.geoCode($scope.registroSeleccionado.direccion).then(function (resp) {
      if (resp.length > 0) {
        $scope.marker_alta.coords.latitude = resp[0].lat;
        $scope.marker_alta.coords.longitude = resp[0].lon;
        //Centro el mapa
        $scope.map_alta.control.refresh({ latitude: resp[0].lat, longitude: resp[0].lon });
      }
      $scope.googleMapLoading = false;
    });
  },

  aaaactualizarRegistros: function () {
    $scope.loading = true;
    $scope.registros = [];
    RegistrosService.listar().then(function (data) {
      $scope.registros = data;
      $scope.seleccionarRegistro($scope.registroSeleccionado._id);
      $scope.loading = false;
    });
  },

  crearNuevoRegistro: function () {
    $scope.seleccionarRegistro(null);
  },

  StopWatch: function () {
    if ($scope.watchRegistros)
    $scope.watchRegistros();
    if ($scope.watchCoords)
    $scope.watchCoords();
  },

  InitWatch: function () {
    $scope.watchRegistros = $scope.$watch('registroSeleccionado', function (newVal, oldVal) {
      if (angular.equals(newVal, oldVal) || !angular.equals(oldVal.salidas, newVal.salidas)) {
        return; // simply skip that
      }

      if (!angular.equals(oldVal.pacientes, newVal.pacientes)) {
        //Filtro los objectos que estan vacios
        var emptyObj = $filter('filter')(newVal.pacientes, function (value) {
          if (value.edad == "" && value.nombre == "") {
            return true
          }
        });
        if (emptyObj && emptyObj.length == 0)
        //creo un nuevo registro en blanco para que puedan seguir agregando
        $scope.registroSeleccionado.pacientes.push({ nombre: '', edad: '', sexo: '', observacion: '' });
      }
      $scope.mostrarBotonGuardar = true;
    }, true);

    //Observo los cambios en las coordenadas
    $scope.watchCoords = $scope.$watch('marker_alta.coords', function (newVal, oldVal) {
      if (angular.equals(newVal, oldVal)) {
        return; // simply skip that
      }
      else {
        $scope.registroSeleccionado.coordenadas= [newVal.longitude, newVal.latitude];
      }
      $scope.mostrarBotonGuardar = true;
    }, true);
  },

  init: function () {
    $scope.loadingPrincipal = true;
    if($routeParams.id != "0"){
      RegistrosService.getById($routeParams.id).then(function (data) {
        $scope.registroSeleccionado = data;
        $scope.initData();
        UtilService.getConstantes().then(function (data) {
          $scope.finalizaciones = data.tipos_salida;
          //$scope.moviles = data.moviles;
          $scope.loadingPrincipal = false;
        });
      });
    }
    else {
      console.log("Nuevo Registro");
      var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coordenadas: [], fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [], mensajes:[] }
      $scope.registroSeleccionado = JSON.parse(JSON.stringify(nuevoRegistro));
      $scope.initData();
      UtilService.getConstantes().then(function (data) {
        $scope.finalizaciones = data.tipos_salida;
        //$scope.moviles = data.moviles;
        $scope.loadingPrincipal = false;
      });
    }
  }


});
$scope.init();
}]);

appModule.controller('LoginController', ['$rootScope','$scope', '$location', '$window' ,'LoginService', function ($rootScope, $scope, $location, $window, LoginService) {
  angular.extend($scope, {
    login : function() {
      LoginService.login($scope.username ,$scope.password).then(function(response) {
        if (response.status == 200){
          $window.sessionStorage.token = response.data.token;
          $location.path('/');
          $rootScope.$emit('userDataUpdated', true);
        }
        else {
          $window.sessionStorage.clear();
          $scope.mensaje=response.data;
          $rootScope.$emit('userDataUpdated', true);
        }
      });
    },
    cambiarContrasena: function() {
      if ($scope.nuevaContrasena == $scope.nuevaContrasena2){
        LoginService.cambiarContrasena($scope.contrasenaActual ,$scope.nuevaContrasena).then(function(response) {
          if (response.status == 200){
            alert("La contraseña se cambió correctamente");
            $location.path('/');
          }
          else {
            $scope.mensaje = response.data;
          }
        });
      }
      else {
        $scope.mensaje = "Las contraseñas no coinciden";
      }
    },
    init: function () {      
      if ($location.path() == '/logout'){
        $window.sessionStorage.clear();
        $rootScope.$emit('userDataUpdated', true);
      }
    }
  });
  $scope.init();
}]);

appModule.controller('SearchController', ['$scope', 'SearchService', function ($scope, SearchService) {
  angular.extend($scope, {
    loading: false,
    resultados: [],
    indicadores:{
      salidas:0
    },
    searchOptions:{
      fechaInicio:null,
      fechaFin:null
    },
    map_alta: { center: { latitude: -38.951678, longitude: -68.059189 }, zoom: 14, control: {} },
    marker_alta: {
      id: 0,
      coords: {
        latitude: 40.1451,
        longitude: -99.6680
      },
      options: { draggable: true }
    },
    markers:[],


    actualizarRegistros: function () {
      $scope.loading = true;
      $scope.alertaCambios = false;
      $scope.resultados = [];
      $scope.indicadores.salidas=0;
      SearchService.search($scope.searchOptions).then(function (data) {
        $scope.resultados = data.data;
        for(var i = 0; i< data.data.length; i++){
          $scope.indicadores.salidas += data.data[i].salidas.length;
        }
        $scope.loading = false;
      });
    },

    init: function () {
      var fecha = new Date();
      $scope.searchOptions.fechaInicio = fecha.setHours(fecha.getHours()-24);
      $scope.searchOptions.fechaFin = fecha;
    }
  });
  $scope.init();
}]);

appModule.controller('MainController', ['$rootScope', '$scope', '$window' ,'LoginService', function ($rootScope, $scope, $window, LoginService) {
  angular.extend($scope, {
    appName:"Raph - Central 107",    
    userData: LoginService.getUserData(),
    init: function() {
      $rootScope.$on('userDataUpdated', function(event, codes){
        $scope.userData = LoginService.getUserData(); //Rely on localStorage for "storage" only, not for communication.
      });
    }
  });
  $scope.init();
}]);

appModule.controller('monitorController', ['$scope','$firebaseObject', function ($scope, $firebaseObject) {
  angular.extend($scope, {
          loading: true,
          txtNombre: '',
          moviles: 'lalala',
          map: { center: { latitude: -38.94, longitude: -67.91 }, zoom: 14 },
          marker: {
              id: 0,
              options: {
                  opacity: 1,
                  icon: 'images/ambulance.png'
              },
              coords: {
                  latitude: 40.1451,
                  longitude: -99.6680
              }
          },
          SeleccionarAgente: function (legajo, tarjeta) {
              //Selecciono el row en la table agentes

              if ($scope.personalSelected_last) {
                  $scope.personalSelected_last.personalSelected = '';
              }
              this.personalSelected = 'active';
              $scope.personalSelected_last = this;

              //Obtengo las Fichadas
              $scope.GetFichada(tarjeta);

              //Obtengo los articulos
              $scope.GetArticulos(legajo);

          },

          Init: function () {
              //Descargo los moviles "activos" TODO
              var ref = new Firebase("https://sien.firebaseio.com/Moviles");
              // download the data into a local object



              ref.on('value', function (data) {
                  $scope.moviles = data.val();

                  $scope.loading = false;
                  $scope.MostrarAmbulanciasMapa();
                  $scope.$apply();
              });
          },

          MostrarAmbulanciasMapa: function () {
              //Muestro solo el movil 0 //TODO
              if ($scope.moviles[0].estado == true) {
                  $scope.marker.options.opacity = 1;
                  $scope.marker.coords.latitude = $scope.moviles[0].posicion.latitud;
                  $scope.marker.coords.longitude = $scope.moviles[0].posicion.longitud;
              }
              else {
                  $scope.marker.options.opacity = 0;
              }
          }

      });

      $scope.Init();
}]);