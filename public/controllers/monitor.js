appModule.controller('monitorController', ['$scope', '$firebaseObject', '$firebaseAuth', '$firebaseArray', '$http', 'LoginService', 'SweetAlert', '$filter',
    function ($scope, $firebaseObject, $firebaseAuth, $firebaseArray, $http, LoginService, SweetAlert, $filter) {
        angular.extend($scope, {
            loading: true,
            connectedRef: null,
            txtNombre: '',
            moviles: [],
            puntos: [],
            puntos2: [],
            map: { control: {}, center: { latitude: -38.94, longitude: -67.91 }, zoom: 14 },
            marker: {
                id: 0,
                options: {
                    opacity: 1,
                    //icon: 'images/ambulance.png',
                    labelContent: 'Móvil 1',
                    labelAnchor: "10 60",
                    labelClass: "marker-labels"
                },
                coords: {
                    latitude: 40.1451,
                    longitude: -99.6680
                }
            },
            ImprimirHistorialEnPantalla: function (id, nombre) {
                var ref = firebase.database().ref().child("Historial/" + id + "/device")
                    .limitToLast(20);
                var onvaluechange = ref
                    .on("value", function (snapshot) {
                        var eventos = Object.keys(snapshot.val()).map(function (x) { return snapshot.val()[x]; });
                        var texto = "";
                        for (i = 0; i < eventos.length; i++) {
                            texto += "<small><i>" + $filter('date')(new Date(eventos[i].fecha), "dd/MM/yyyy HH:mm") + "</i></small> - ";
                            switch (eventos[i].tipo) {
                                case "battery_low":
                                    if (eventos[i].value)
                                        texto += "Batería baja.";
                                    else
                                        texto += "Batería normal.";
                                    break;
                                case "isGpsOn":
                                    if (eventos[i].value)
                                        texto += "GPS activado.";
                                    else
                                        texto += "GPS desactivado.";
                                    break;
                                case "reboot":
                                    if (eventos[i].value)
                                        texto += "Reinicio del teléfono registrado.";
                                    else
                                        texto += "Error en el registro de reboot - Avisa a Sebastián!";
                                    break;
                                case "remote_config":
                                    texto += "Configuración remota activada.";
                                    break;
                                case "isAirplaneModeOn":
                                    if (eventos[i].value)
                                        texto += "Modo avión activado.";
                                    else
                                        texto += "Modo avión desactivado.";
                                    break;
                            }
                            texto += "<br/>";
                        }
                        ref.off('value', onvaluechange);
                        SweetAlert.swal({ html: true, title: "<i>Historial " + nombre + "</i>", text: texto, type: "info" });
                    });
                /*var eventos = $firebaseArray(ref);
                var texto = "";
                for (i = 0; i < eventos.length; i++) {
                    texto += eventos[i].fecha; +"<br/>"
                }*/
            },

            Dibujar100Puntos: function () {
                var pathValues = [];
                var map = $scope.map.control.getGMap();
                $scope.puntos = Object.keys($scope.moviles[2].historial).map(function (x) { return $scope.moviles[2].historial[x]; });
                var contador = 0
                for (var i = 400; i < $scope.puntos.length; i++) {
                    contador++;
                    if (contador > 5) {
                        contador = 0;
                        if ($scope.puntos2.length < 95) {
                            $scope.puntos2.push($scope.puntos[i].latitud + "," + $scope.puntos[i].longitud);
                        }
                    }
                }
                var lala = $scope.puntos2.join("|");

                $http.get('https://roads.googleapis.com/v1/snapToRoads?interpolate=true&key=AIzaSyBeuihfLrTLC9Y_K_iQUKMRmHEvibpp0Y4&path=' + lala).then(function (resp) {

                    var data = resp.data;
                    var snappedCoordinates = [];
                    var placeIdArray = [];
                    for (var i = 0; i < data.snappedPoints.length; i++) {
                        var latlng = new google.maps.LatLng(
                            data.snappedPoints[i].location.latitude,
                            data.snappedPoints[i].location.longitude);
                        snappedCoordinates.push(latlng);
                        placeIdArray.push(data.snappedPoints[i].placeId);
                    }

                    var snappedPolyline = new window.google.maps.Polyline({
                        path: snappedCoordinates,
                        strokeColor: 'black',
                        strokeWeight: 3
                    });

                    snappedPolyline.setMap(map);
                    //polylines.push(snappedPolyline);
                })


            },
            CentrarMapa: function (posicion) {
                $scope.map.center = { latitude: posicion.latitude, longitude: posicion.longitude };
            },

            Init: function () {
                var auth = $firebaseAuth();

                var user = LoginService.getUserData();

                auth.$signInWithCustomToken(user.firebase).then(function (firebaseUser) {
                    console.log("Signed in as:", firebaseUser.uid);
                }).catch(function (error) {
                    console.log("Authentication failed:", error);
                });

                //Creo una referencia para determinar cuando el usuario se encuentra conectado
                $scope.connectedRef = firebase.database().ref(".info/connected");
                $scope.connectedRef.on("value", function (snap) {
                    if (snap.val() === true) {
                        $scope.loading = false;
                    } else {
                        $scope.loading = true;
                    }
                });


                //Descargo los moviles "activos" TODO            
                var ref = firebase.database().ref().child("Moviles");
                $scope.moviles = $firebaseArray(ref);

                $scope.$watch('moviles', function (newVal, oldVal) {
                    //$scope.loading = false;
                    for (var i = 0; i < $scope.moviles.length; i++) {
                        var options = {
                            labelContent: $scope.moviles[i].nombre,
                            labelAnchor: "20 50",
                            labelClass: $scope.moviles[i].online ? "marker-labels" : "blink_me marker-labels",
                            icon: {
                                path: 'M 0 0 L 5 20 L -5 20 z',
                                fillColor: '#3884ff',
                                fillOpacity: 0.7,
                                scale: 1,
                                strokeColor: '#356cde',
                                rotation: $scope.moviles[i].posicion.course,
                                strokeWeight: 1
                            }
                        }
                        $scope.moviles[i].options = options;
                        //$scope.$apply()
                    }

                }, true);
            }

        });

        $scope.Init();
    }]);
