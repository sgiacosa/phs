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