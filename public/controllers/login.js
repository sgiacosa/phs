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
