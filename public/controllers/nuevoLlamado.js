appModule.controller('NuevoController', ['$rootScope', '$scope', '$location', '$window', 'RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http', 'LoginService', 'mySocket', '$timeout', 'LlamadosService', 'SweetAlert',
    function ($rootScope, $scope, $location, $window, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http, LoginService, mySocket, $timeout, LlamadosService, SweetAlert) {
        angular.extend($scope, {
            loading: false,
            registros: [],
            motivoSeleccionado: 0,
            idRegistro: 0,

            mostrarEvento: function (_id) {
                // Cambia la vista usando el servicio $location
                $location.path('/evento/' + _id);
            },

            seleccionarRegistro: function(_id){
                $scope.idRegistro = _id;
            },

            loadLlamadoDuplicado: function () {
                $scope.motivoSeleccionado = 2;
                RegistrosService.listar(true).then(function (data) {
                    $scope.registros = data;
                });
            },

            loadLlamadoNoRelacionado: function(){
                $scope.motivoSeleccionado = 3;
            },

            saveLlamadoDuplicado: function () {
                $scope.llamadoDuplicadoLoading = true;
                LlamadosService.nuevoLlamado($scope.idRegistro, 2, $scope.telefono, $scope.mensaje).then(function () {
                    $scope.llamadoDuplicadoLoading = false;
                    SweetAlert.swal("", "El llamado telefónico se registró correctamente.", "success");
                    $location.path('/');
                })
            },
            
            saveLlamadoNoRelacionado: function () {
                $scope.llamadoDuplicadoLoading = true;
                LlamadosService.nuevoLlamado(null, 3, $scope.telefono, $scope.mensaje).then(function () {
                    $scope.llamadoDuplicadoLoading = false;
                    SweetAlert.swal("", "El llamado telefónico se registró correctamente.", "success");
                    $location.path('/');
                })
            },

            init: function () {

            }
        });
        $scope.init();
    }]);
