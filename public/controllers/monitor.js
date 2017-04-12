//'$firebaseObject', '$firebaseAuth', '$firebaseArray', 

appModule.controller('monitorController', ['$scope', '$http', 'LoginService', 'SweetAlert', '$filter', 'RegistrosService', 'SalidasService', 'mySocket',

    function ($scope, $http, LoginService, SweetAlert, $filter, RegistrosService, SalidasService, mySocket) {

        angular.extend($scope, {
            loading: false,
            registros: [],
            connectedRef: null,
            txtNombre: '',
            moviles: [],
            puntos: [],
            puntos2: [],
            map: { control: {}, center: { latitude: -38.9502426, longitude: -68.0560002 }, zoom: 14 },
            marker: {
                id: 0,
                options: {
                    opacity: 1,
                    labelContent: '',
                    labelAnchor: "10 60",
                    labelClass: "marker-labels"
                },
                coords: {
                    latitude: 40.1451,
                    longitude: -99.6680
                }
            },



            initSocket: function () {
                mySocket.on('connect', function (data) {
                    console.log('conecto');
                    $scope.loading = false;
                });
                mySocket.on('connect_error', function (data) {
                    console.log('Desconecto');
                    $scope.loading = true;
                });
                mySocket.on('dbChange', function (data) {
                    $scope.actualizarRegistros();
                });
                mySocket.on('MovilPositionChange', function (data) {
                    $scope.actualizarMoviles(data);
                });
            },

            actualizarRegistros: function () {
                //Actualizo los eventos para mostrar en el mapa
                RegistrosService.listar().then(function (data) {
                    $scope.registros = data;

                    for (var i = 0; i < $scope.registros.length; i++) {
                        var clasificacion = '';
                        var icon = '';
                        switch ($scope.registros[i].clasificacion) {
                            case 1:
                                icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|50a843';
                                break;
                            case 2:
                                icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|eff464';
                                break;
                            case 3:
                                icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569';
                                break;
                            default:
                                icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|899393';
                                break;
                        }
                        var options = {
                            labelContent: $scope.registros[i].observacionesClasificacion,
                            labelClass: "marker-labels",
                            icon: {
                                url: icon
                            }
                        }
                        $scope.registros[i].options = options;
                    }
                });
            },

            actualizarMoviles: function (movil) {
                if ($scope.moviles.length == 0) return;
                for (var i = 0; i < $scope.moviles.length; i++) {
                    if ($scope.moviles[i]._id == movil._id) {
                        $scope.moviles[i].movimiento = movil.movimiento;
                        $scope.moviles[i].device = movil.device;
                        $scope.moviles[i].estado = movil.estado;
                        $scope.ActualizarMarkerMoviles(movil._id);
                    }
                }
            },

            ActualizarMarkerMoviles: function(idMovil){
                for (var i = 0; i < $scope.moviles.length; i++) {
                    if (!idMovil || $scope.moviles[i]._id == idMovil) {                        
                        var options = {
                            labelContent: $scope.moviles[i].nombre,
                            labelAnchor: "20 50",
                            labelClass: "marker-labels",
                            icon: {
                                path: 'M 0 0 L 5 20 L -5 20 z',
                                fillColor: $scope.moviles[i].estado == 1 ? '#32db18' : '#e8593a',
                                fillOpacity: 0.7,
                                scale: 1,
                                strokeColor: $scope.moviles[i].estado == 1 ? '#000' : '#000',
                                rotation: $scope.moviles[i].movimiento.course,
                                strokeWeight: 1
                            }
                        }
                        $scope.moviles[i].options = options;
                    }
                }
            },

            IsMobileOnline: function(lastTime){
                var last = new Date(lastTime);
                var now = new Date();                
                return last.getTime() > now.setMinutes(now.getMinutes() - 3) 
            },

            ImprimirHistorialEnPantalla: function (id, nombre) {
                var ref = firebase.database().ref("Historial/" + id + "/device")
                    .limitToLast(20)
                    ;

                var onvaluechange = ref
                    .on("value", function (snapshot) {
                        var eventos = Object.keys(snapshot.val()).map(function (x) { return snapshot.val()[x]; });
                        var texto = "";
                        var fecha = "";
                        for (i = 0; i < eventos.length; i++) {
                            fecha = "<small><i>" + $filter('date')(new Date(eventos[i].fecha), "dd/MM/yyyy HH:mm") + "</i></small> - ";
                            switch (eventos[i].tipo) {
                                case "battery_low":
                                    if (eventos[i].value)
                                        texto += fecha + "Batería baja. <br/>";
                                    else
                                        texto += fecha + "Batería normal.<br/>";
                                    break;
                                case "mobile_data":
                                    if (eventos[i].value)
                                        texto += fecha + "Datos móviles activados. <br/>";
                                    else
                                        texto += fecha + "Datos móviles desactivados.<br/>";
                                    break;
                                case "isGpsOn":
                                    if (eventos[i].value)
                                        texto += fecha + "GPS activado.<br/>";
                                    else
                                        texto += fecha + "GPS desactivado.<br/>";
                                    break;
                                case "reboot":
                                    if (eventos[i].value)
                                        texto += fecha + "Reinicio del teléfono registrado.<br/>";
                                    else
                                        texto += fecha + "Error en el registro de reboot - Avisar a Sebastián!<br/>";
                                    break;
                                case "remote_config":
                                    //texto += fecha + "Configuración remota activada.";
                                    break;
                                case "isAirplaneModeOn":
                                    if (eventos[i].value)
                                        texto += fecha + "Modo avión activado.<br/>";
                                    else
                                        texto += fecha + "Modo avión desactivado.<br/>";
                                    break;
                            }
                        }
                        ref.off('value', onvaluechange);
                        SweetAlert.swal({ html: true, title: "<i>Historial " + nombre + "</i>", text: texto, type: "info" });
                    });

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
                /* var auth = $firebaseAuth();
 
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
                                 fillColor: $scope.moviles[i].estado == 1 ? '#32db18' : '#e8593a',
                                 fillOpacity: 0.7,
                                 scale: 1,
                                 strokeColor: $scope.moviles[i].estado == 1 ? '#000' : '#000',
                                 rotation: $scope.moviles[i].posicion.course,
                                 strokeWeight: 1
                             }
                         }
                         $scope.moviles[i].options = options;
                         //$scope.$apply()
                     }
 
                 }, true);*/

                //Inicio socket
                $scope.initSocket();
                //Descargo eventos actuales
                $scope.actualizarRegistros();
                //Descargo los moviles
                SalidasService.getMovilesDisponibles().then(function (resp) {                    
                    $scope.moviles = $filter('filter')(resp.data, function(value, index, array){
                        return value.movimiento != undefined;
                    });
                    $scope.ActualizarMarkerMoviles();
                });

                $scope.$on('$destroy', function () {
                    mySocket.removeAllListeners();
                });
            }

        });

        $scope.Init();
    }]);
