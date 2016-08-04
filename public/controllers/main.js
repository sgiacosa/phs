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
