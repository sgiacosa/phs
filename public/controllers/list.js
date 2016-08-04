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
