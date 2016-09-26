appModule.controller('BuscarLlamadosController', ['$scope', '$location', 'LlamadosService', 'SweetAlert',
    function ($scope, $location, LlamadosService, SweetAlert) {
        angular.extend($scope, {
            loading: false,
            resultados: [],
            searchOptions: {
                fechaInicio: null,
                fechaFin: null
            },

            actualizarLlamados: function () {
                $scope.loading = true;
                $scope.resultados = [];

                LlamadosService.search($scope.searchOptions).then(function (data) {
                    $scope.resultados = data.data;                    
                    $scope.loading = false;
                });
            },


            init: function () {
                var fecha = new Date();
                $scope.searchOptions.fechaInicio = moment().set({ 'hour': 0, 'minute': 0, 'second': 0 }).toDate();
                $scope.searchOptions.fechaFin = moment().set({ 'hour': 23, 'minute': 59, 'second': 59 }).toDate();
            }
        });
        $scope.init();
    }]);
