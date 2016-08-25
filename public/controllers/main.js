appModule.controller('MainController', ['$rootScope', '$scope', '$window', 'LoginService', 'MensajesService', 'mySocket','SweetAlert', function ($rootScope, $scope, $window, LoginService, MensajesService, mySocket, SweetAlert) {
  angular.extend($scope, {
    appName: "Raph - Central 107",
    userData: LoginService.getUserData(),
    socketConnected:false,
    smsList: [],
    openchat: false,
    unreadChatCount: 0,
    txtSms:'',

    toggleChat: function () {
      if (!$scope.openchat)
        $scope.unreadChatCount=0;
      $scope.openchat = !$scope.openchat;
    },

    init: function () {
      $rootScope.$on('userDataUpdated', function (event, codes) {
        $scope.userData = LoginService.getUserData(); //Rely on localStorage for "storage" only, not for communication.
      });

      $rootScope.$on('eventDetailGenerated', function (event, msg) {        
        $scope.txtSms = msg;
      });

      //Listo los últimos Chats SMS
      MensajesService.listarSms().then(function (data) {
        $scope.smsList = data;
      })
      //inicializo socket
      $scope.initSocket();

    },

    initSocket: function () {
      mySocket.on('connect', function (data) {
        $scope.socketConnected = true;
      });
      mySocket.on('connect_error', function (data) {
        $scope.socketConnected = false;
      });

      mySocket.on('chatChange', function (data) {
        $scope.smsList.push(data);
        if (!$scope.openchat)
          $scope.unreadChatCount++;
      });
    },

    enviarSMS: function () {
      if ($scope.txtSms.length > 0) {
        $scope.sendingChat=true;
        var mensaje = { mensaje: $scope.txtSms };
        MensajesService.nuevoSMS(mensaje).then(function (response) {
          $scope.sendingChat =false;
          if (response.status == 200) {
            $scope.txtSms = "";
            //Actualizo los datos
            $scope.registroSeleccionado = response.data;
            $scope.initData();
            
          }
          else
            SweetAlert.swal("Atención", "Su mensaje no pudo ser enviado. Verifique su conexión a internet.", "error");
        });

      }
    },   




  });
  $scope.init();
}]);
