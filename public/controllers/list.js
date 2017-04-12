appModule.controller('ListController', ['$rootScope', '$scope', '$location', '$window', 'RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http', 'LoginService', 'mySocket', '$timeout', function ($rootScope, $scope, $location, $window, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http, LoginService, mySocket, $timeout) {
  angular.extend($scope, {
    loading: false,
    loadingPrincipal: true,
    registros: [],
    registroSeleccionado: null,
    finalizaciones: [],
    destinos: [],
    moviles: [],
    alertaCambios: false,
    searchOptions: {
      mostrarEventosFinalizados: false
    },



    initSocket: function () {            
      mySocket.on('connected', function (data) {
        console.log("connected " + data);
      });
      mySocket.on('dbChange', function (data) {        
          $scope.actualizarRegistros();
      });
    },
    

    mostrarEvento: function (_id) {
      // Cambia la vista usando el servicio $location
      $location.path('/evento/' + _id);
    },

    nuevoLLamado: function () {
      // Cambia la vista usando el servicio $location
      $location.path('/nuevo');
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

    generarTextoSMS: function (_id) {
      var registroSeleccionado = $filter('filter')($scope.registros, { '_id': _id })[0];
      var mensaje = "";

      if (registroSeleccionado.clasificacion)
        mensaje = "Código " + (registroSeleccionado.clasificacion == 1 ? " Verde 📗." : (registroSeleccionado.clasificacion == 2 ? " Amarillo 📒." : (registroSeleccionado.clasificacion == 3 ? " Rojo 📕." : " No clasificado. ")));
      mensaje += " Recibe pedido: " + $filter('date')(registroSeleccionado.fechaRegistro, 'HH:mm');
      if (registroSeleccionado.direccion)
        mensaje += " Direccion: " + registroSeleccionado.direccion;
      if (registroSeleccionado.observaciones)
        mensaje += " Anotación: " + registroSeleccionado.observaciones;
      if (registroSeleccionado.reporte)
        mensaje += "Reporte: " + registroSeleccionado.reporte;
      for (var i = 0; i < registroSeleccionado.mensajes.length; i++)
        mensaje += " Mensaje: " + registroSeleccionado.mensajes[i].mensaje;
      for (var i = 0; i < registroSeleccionado.salidas.length; i++) {
        mensaje += " 🚑 Asiste: " + registroSeleccionado.salidas[i].nombreMovil;
        mensaje += " Se despacha: " + $filter('date')(registroSeleccionado.salidas[i].fechaDespacho, 'HH:mm');

        if (registroSeleccionado.salidas[i].fechaEnMovimiento) mensaje += " -> Desplazamiento: " + $filter('date')(registroSeleccionado.salidas[i].fechaEnMovimiento, 'HH:mm');
        if (registroSeleccionado.salidas[i].fechaArribo) mensaje += " -> Arriba: " + $filter('date')(registroSeleccionado.salidas[i].fechaArribo, 'HH:mm');
        if (registroSeleccionado.salidas[i].fechaDestino) mensaje += " -> " + registroSeleccionado.salidas[i].tipoSalida.nombre + " " + registroSeleccionado.salidas[i].tipoSalida.destino + " : " + $filter('date')(registroSeleccionado.salidas[i].fechaDestino, 'HH:mm');
        if (registroSeleccionado.salidas[i].fechaQRU) mensaje += " -> QRU: " + $filter('date')(registroSeleccionado.salidas[i].fechaQRU, 'HH:mm');
        if (registroSeleccionado.salidas[i].fechaCancelacion) mensaje += " -> Cancelado: " + $filter('date')(registroSeleccionado.salidas[i].fechaCancelacion, 'HH:mm');
      }
      if (registroSeleccionado.fechaCierre)
        mensaje += " Finaliza: " + $filter('date')(registroSeleccionado.fechaCierre, 'HH:mm');

      $rootScope.$emit('eventDetailGenerated', mensaje);
    },

    //   *************   SALIDAS ****************

    //Cuando el equipo se sube al movil y se pone en  movimiento
    indicarMovimiento: function (_idRegistro, _idSalida) {
      $scope.loading = true;
      SalidasService.indicarMovimiento(_idRegistro, _idSalida).then(function (data) {
        if (data.status == 200) {
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },

    indicarArribo: function (_idRegistro, _idSalida) {
      $scope.loading = true;
      SalidasService.indicarArribo(_idRegistro, _idSalida).then(function (data) {
        if (data.status == 200) {
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },

    indicarQRU: function (_idRegistro, _idSalida) {
      $scope.loading = true;
      SalidasService.indicarQRU(_idRegistro, _idSalida).then(function (data) {
        if (data.status == 200) {
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },

    //   *************  FIN SALIDAS *************

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
      //
      $scope.$on('$destroy', function () {        
        mySocket.removeAllListeners();
      });
    }
  });
  $scope.init();
}]);
