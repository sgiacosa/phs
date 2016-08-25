var appModule = angular.module('sien', ['ngAnimate', 'ngRoute', 'uiGmapgoogle-maps', 'firebase', 'ui.bootstrap', 'angularMoment', 'angular-jwt', 'btford.socket-io', 'oitozero.ngSweetAlert', 'luegg.directives']);

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

    

    

    
