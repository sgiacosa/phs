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
