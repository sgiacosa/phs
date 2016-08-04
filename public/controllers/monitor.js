appModule.controller('monitorController', ['$scope','$firebaseObject', function ($scope, $firebaseObject) {
  angular.extend($scope, {
          loading: true,
          txtNombre: '',
          moviles: 'lalala',
          map: { center: { latitude: -38.94, longitude: -67.91 }, zoom: 14 },
          marker: {
              id: 0,
              options: {
                  opacity: 1,
                  icon: 'images/ambulance.png'
              },
              coords: {
                  latitude: 40.1451,
                  longitude: -99.6680
              }
          },
          SeleccionarAgente: function (legajo, tarjeta) {
              //Selecciono el row en la table agentes

              if ($scope.personalSelected_last) {
                  $scope.personalSelected_last.personalSelected = '';
              }
              this.personalSelected = 'active';
              $scope.personalSelected_last = this;

              //Obtengo las Fichadas
              $scope.GetFichada(tarjeta);

              //Obtengo los articulos
              $scope.GetArticulos(legajo);

          },

          Init: function () {
              //Descargo los moviles "activos" TODO
              var ref = new Firebase("https://sien.firebaseio.com/Moviles");
              // download the data into a local object



              ref.on('value', function (data) {
                  $scope.moviles = data.val();

                  $scope.loading = false;
                  $scope.MostrarAmbulanciasMapa();
                  $scope.$apply();
              });
          },

          MostrarAmbulanciasMapa: function () {
              //Muestro solo el movil 0 //TODO
              if ($scope.moviles[0].estado == true) {
                  $scope.marker.options.opacity = 1;
                  $scope.marker.coords.latitude = $scope.moviles[0].posicion.latitud;
                  $scope.marker.coords.longitude = $scope.moviles[0].posicion.longitud;
              }
              else {
                  $scope.marker.options.opacity = 0;
              }
          }

      });

      $scope.Init();
}]);
