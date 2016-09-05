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
      $scope.searchOptions.fechaInicio = moment().set({'hour': 0,'minute':0,'second' : 0}).toDate();
      $scope.searchOptions.fechaFin = moment().set({'hour': 23,'minute':59,'second' : 59}).toDate();
    }
  });
  $scope.init();
}]);
