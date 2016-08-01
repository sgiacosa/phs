var appModule = angular.module('sien', ['ngAnimate', 'ngRoute', 'uiGmapgoogle-maps', 'firebase', 'ui.bootstrap']);

appModule.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
      .when('/position', {
          templateUrl: 'partial/rrhh_fichadas.html',
          controller: 'MainController'
      })
        .when('/', {
            templateUrl: 'partial/registro.html',
            controller: 'RegistroController'
        })
      .when('/alta/', {
          templateUrl: 'partial/alta.html',
          controller: 'AltaController'
      });




}])

/******************************************* FILTERS    ***************************************************************/

appModule.filter('diferencia', function () {
    return function (fecha1, fecha2, format) {
        var duration = moment.duration(moment(fecha2).diff(moment(fecha1))).format("hh:mm");
        return duration;
    }
});

/******************************************* SERVICES    ***************************************************************/

appModule.factory('RegistrosService', ['$http', function ($http) {
    return {
        listar: function () {
            return $http({ method: 'get', url: 'api/registros/list/' }).then(function (response) {
                return response.data
            });
        },
        guardarCambios: function (registro) {
            return $http({ method: 'post', url: 'api/registros/nuevoRegistro', data: registro }).then(function (response) {
                return response;
            },
            function (error) {
                return error;
            });
        },
        cerrarRegistro: function (id) {
            return $http({
                method: 'post',
                url: 'api/registros/cerrar',
                data: "=" + id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }

            }).then(function (response) {
                return response;
            },
            function (error) { return error; });
        },
    }
}]);

appModule.factory('SalidasService', ['$http', function ($http) {
    return {
        ByIdRegistro: function (idRegistro) {
            return $http({ method: 'get', url: 'api/salidas/' + idRegistro }).then(function (response) {
                return response.data
            });
        },

        indicarArribo: function (idRegistro, idSalida) {
            var data = {idRegistro :idRegistro, idSalida:idSalida}
            return $http({
                method: 'post',
                url: 'api/registros/salidas/indicarArribo',
                data: data

            }).then(function (response) {
                return response;
            },
            function (error) {
                return error;
            });
        },
        indicarDestino: function (idRegistro, salida) {
            var data={idRegistro:idRegistro,
                      idSalida: salida._id,
                      nombre: salida.tipoSalida.nombre,
                      destino: salida.tipoSalida.destino
                      }
            return $http({ method: 'post', url: 'api/registros/salidas/indicarDestino', data: data }).then(function (response) {
                return response;
            },
            function (error) {
                return error;
            });
        },
        indicarQRU: function (idRegistro, idSalida) {
            return $http({
                method: 'post',
                url: 'api/registros/salidas/indicarQRU',
                data: {idRegistro: idRegistro, idSalida: idSalida}
            }).then(function (response) {
                return response;
            },
            function (error) {
                return error;
            });
        },
        nuevaSalida: function (idMovil, idRegistro) {
            var data = { idMovil: idMovil, _id: idRegistro };
            return $http({ method: 'post', url: 'api/registros/salidas/nueva', data: data }).then(function (response) {
                return response;
            },
            function (error) {
                return error;
            });
        }
    }
}]);

appModule.factory('UtilService', ['$http', function ($http) {
  return {
    getConstantes: function() {
      return $http({method:'get', url:'api/constantes'}).then(function(response) {
        return response.data;
      })
    }
  }
}]);

appModule.factory('MensajesService', ['$http', function ($http) {
    return {
        nuevoMensaje: function (idRegistro, mensaje) {
            var data = { idRegistro: idRegistro, mensaje: mensaje };
            return $http({ method: 'post', url: 'api/mensajes/nuevo', data: data }).then(function (response) {
                return response;
            },
            function (error) {
                return error;
            });
        }
    }
}]);

appModule.factory('SearchService', ['$http', '$filter', function ($http, $filter) {
    return {
        search: function (direccion, ciudad) {
            //Verifico si se encuentra en elastic search

            var searchOptions = {"direccion":direccion, "ciudad": ciudad};

            return $http({ method: 'post', url: 'api/search/streets', data: searchOptions }).then(function (response) {
                return response;
            });

            /*
            //si no encuentro la calle en elastic la busco en openstreepmap/google maps
            return $http({ method: 'get', url: 'http://nominatim.openstreetmap.org/search?street='+direccion+'&city='+ciudad+'&format=json&addressdetails=1' }).then(function (response) {
                //Filtro los registros de neuquen
                response.data = $filter('filter')(response.data, function (v) { if (v.address.city == ciudad) return true; })

                //Retorno Direccion, Ciudad, Fuente (ES=1, OpenStreetMap=2, GoogleMaps=3)
                var retorno = [];
                response.data.forEach(function (s) {
                    retorno.push({ direccion: s.address.road, ciudad: s.address.city, fuente:2 });
                });
                response.data = retorno;
                return response;
            });

            */
        },
        InsertIntoElastic: function (nombre, ciudad) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'http://localhost:9200/sien/calles/',
                data: '{"nombre":"' + nombre + '", "ciudad":"' + ciudad + '"}'
            }).then(function (response) {
                return response;
            });
        },
        geoCode: function (direccion) {

            var _address = direccion.replace(' ','%20');
            return $http({ method: 'get', url: 'http://nominatim.openstreetmap.org/search?street='+_address+'&city=neuquen&format=json' }).then(function (response) {

                if (response.status == 200) {

                    //response.data = [];
                }
                else {
                    response.data = [];
                }
                return response.data;
            });
}
}
}]);



/******************************************* CONTROLLERS    ***************************************************************/

appModule.controller('FirstController', ['$scope', '$firebaseObject', function ($scope, $firebaseObject) {
    angular.extend($scope, {});
}]);

appModule.controller('MainController', ['$scope', '$firebaseObject', function ($scope, $firebaseObject) {
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

appModule.controller('AltaController', ['$scope', 'AltaService', '$filter', function ($scope, AltaService, $filter) {
    angular.extend($scope, {
        loading: false,
        color: 5,
        descripcionFlujo: '',
        pacientes: [{ paciente: '', edad: '', sexo: '', observacion: '' }],

        showmap: false,
        map_alta: { center: { latitude: -38.94, longitude: -67.91 }, zoom: 14, control: {} },
        marker_alta: {
            id: 0,
            coords: {
                latitude: 40.1451,
                longitude: -99.6680
            },
            options: { draggable: true }
        },



        inicializarAlta: function () {

            //Agrego un watch para observar y mantener la grilla de pacientes siempre con un registro en blanco
            $scope.$watch('pacientes', function (newVal, oldVal) {
                //Filtro los objectos que estan vacios
                var emptyObj = $filter('filter')(newVal, function (value) {
                    if (value.edad.trim().length == 0 && value.paciente.trim().length == 0)
                        return true
                });
                if (emptyObj.length == 0)
                    //creo un nuevo registro en blanco para que puedan seguir agregando
                    $scope.pacientes.push({ paciente: '', edad: '', sexo: '', observacion: '' });
            }, true);

            //Inicializo el google search autocomplete
            var input = document.getElementById('txtDomicilio');
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.addListener('place_changed', function () {
                //
                var place = autocomplete.getPlace();
                if (place.geometry) {
                    $scope.marker_alta.coords.latitude = place.geometry.location.lat();
                    $scope.marker_alta.coords.longitude = place.geometry.location.lng();
                    //Centro el mapa
                    $scope.map_alta.control.refresh({ latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng() });

                }
            });


        },
        BuscarHijos: function () {

        },
        prueba: function () { debugger; }

    });

    $scope.inicializarAlta();
}]);

appModule.controller('RegistroController', ['$scope', 'RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http', function ($scope, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http) {
    angular.extend($scope, {
        loading: false,
        loadingPrincipal: true,
        mostrarBotonGuardar: false,
        googleMapLoading: false,
        googleSearchInit: false,
        streetSearchResult: null,
        watchRegistros: null,
        watchCoords: null,
        color: 5,
        txtMensaje: { 'value': '' },
        timeLine: [],
        opcionesSexo: [{ id: 1, name: "Masc" }, { id: 2, name: "Fem" }],
        descripcionFlujo: '',
        registros: [],
        registroSeleccionado: null,
        finalizaciones: [],
        destinos: [],
        moviles: [],
        showmap: false,
        map_alta: { center: { latitude: -38.94, longitude: -67.91 }, zoom: 14, control: {} },
        marker_alta: {
            id: 0,
            coords: {
                latitude: 40.1451,
                longitude: -99.6680
            },
            options: { draggable: true }
        },

        mostrarIconoAmbulancia: function (salidas) {
            //retorna true si se debe mostrar el icono para el paciente
            $filter('filter')(salidas)
        },

        indicarArribo: function (_idSalida) {
            $scope.loading = true;
            SalidasService.indicarArribo($scope.registroSeleccionado._id, _idSalida).then(function (data) {
                if (data.status == 200)
                    //Actualizo los datos
                    $scope.actualizarRegistros();
                else {
                    alert(data.data);
                    $scope.loading = false;
                }
            });
        },

        indicarDestino: function (salida) {
            $scope.loading = true;
            SalidasService.indicarDestino($scope.registroSeleccionado._id, salida).then(function (data) {
                if (data.status == 200)
                    //Actualizo los datos
                    $scope.actualizarRegistros();
                else {
                    alert(data.data);
                    $scope.loading = false;
                }
            });
        },
        indicarQRU: function (_idSalida) {
            $scope.loading = true;
            SalidasService.indicarQRU($scope.registroSeleccionado._id, _idSalida).then(function (data) {
                if (data.status == 200)
                    //Actualizo los datos
                    $scope.actualizarRegistros();
                else {
                    alert(data.data);
                    $scope.loading = false;
                }
            });
        },
        enviarMovil: function (idMovil) {
            $scope.loading = true;
            SalidasService.nuevaSalida(idMovil, $scope.registroSeleccionado._id).then(function (data) {
                if (data.status == 200)
                    //Actualizo los datos
                    $scope.actualizarRegistros();
                else
                    alert(data.data);
                $scope.loading = false;
            });
        },

        generarObjetoTimeLine: function () {
            $scope.timeLine = [];
            $scope.timeLine.push({ fecha: $scope.registroSeleccionado.fechaRegistro, titulo: 'Registra el evento', usuario: 'Usuario común', descripcion: 'Clasificación: ' + $filter('filter')([{ id: 0, name: 'No especificada' }, { id: 1, name: 'Verde' }, { id: 2, name: 'Amarillo' }, { id: 3, name: 'Rojo' }], { id: $scope.registroSeleccionado.clasificacion })[0].name, tipo: 1 });
            //Cargo los despachos
            $scope.registroSeleccionado.salidas.forEach(function (s) {
                $scope.timeLine.push({ fecha: s.fechaDespacho, titulo: 'Despacho ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
                if (s.fechaArribo)
                    $scope.timeLine.push({ fecha: s.fechaArribo, titulo: 'Arriba ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
                if (s.fechaDestino) {
                    var _finalizacion = $filter('filter')($scope.finalizaciones, { id: s.idTipoFinalizacion })[0].descripcion;
                    var _destino = s.idDestino ? (' -> ' + $filter('filter')($scope.destinos, { id: s.idDestino })[0].descripcion) : '';
                    $scope.timeLine.push({ fecha: s.fechaDestino, titulo: 'Destino', usuario: '', tipo: 2, descripcion: s.nombreMovil + ': ' + _finalizacion + _destino });
                }
                if (s.fechaQRU)
                    $scope.timeLine.push({ fecha: s.fechaQRU, titulo: 'QRU ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
            });

            //Cargo los mensajes
            $scope.registroSeleccionado.mensajes.forEach(function (s) {
                $scope.timeLine.push({ fecha: s.fecha, titulo: 'Mensaje ', descripcion: s.mensaje, usuario: '', tipo: 4 })
            });

            //Cierre del evento
            if ($scope.registroSeleccionado.fechaCierre)
                $scope.timeLine.push({ fecha: $scope.registroSeleccionado.fechaCierre, titulo: 'Cierre del evento', usuario: '', tipo: 3 });

        },

        cerrarRegistro: function () {
            if (!confirm("¿Esta seguro que desea cerrar este registro?"))
                return;

            $scope.loading = true;
            RegistrosService.cerrarRegistro($scope.registroSeleccionado._id).then(function (response) {
                if (response.status == 200) {
                    $scope.mostrarBotonGuardar = false;
                    //Actualizo los datos
                    $scope.actualizarRegistros();
                }
                else
                    if (response.status == 400)
                        alert(response.data)
                    else
                        alert("Error del servidor. " + response.status);
                $scope.loading = false;
            });
        },

        /*******************   MENSAJES   ****************************/

        enviarMensaje: function () {
            if ($scope.txtMensaje.value) {
                var mensaje= {mensaje:$scope.txtMensaje.value, fecha:null};
                $scope.registroSeleccionado.mensajes.push(mensaje);
            }
        },

        /*******************************************************/

        guardarCambios: function () {
            $scope.loading = true;
            RegistrosService.guardarCambios($scope.registroSeleccionado).then(function (data) {

                if (data.status == 200) {
                    $scope.mostrarBotonGuardar = false;
                    //Actualizo los datos
                    $scope.actualizarRegistros();
                }
                else
                    alert("Error");
                $scope.loading = false;
            });
        },

        cancelarCambios: function () {
            //Elimino el watch
            $scope.StopWatch();

            if ($scope.registroSeleccionado._id == 0) {
                $scope.registroSeleccionado = null;
                $scope.mostrarBotonGuardar = false;
                return;
            }
            $scope.registroSeleccionado = JSON.parse(JSON.stringify($filter('filter')($scope.registros, { id: $scope.registroSeleccionado._id })[0]));
            $scope.mostrarBotonGuardar = false;

            //Vuelvo a crear el watch
            $scope.InitWatch();
        },

        seleccionarRegistro: function (_id) {
            //Controlo que guarde los cambios
            if ($scope.mostrarBotonGuardar && $scope.registroSeleccionado.fechaCierre == null) {
                alert("Por favor guarde los cambios para poder continuar. Gracias");
                return;
            }

            //Elimino el watch
            $scope.StopWatch();

            if (_id)
                $scope.registroSeleccionado = JSON.parse(JSON.stringify($filter('filter')($scope.registros, { _id: _id })[0]));
            else {
                //var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coords: { latitude: null, longitude: null }, fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [] }
                var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coordenadas: [], fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [] }
                $scope.registroSeleccionado = JSON.parse(JSON.stringify(nuevoRegistro));
            }

            //si tiene coords centro el mapa
            if ($scope.registroSeleccionado.coordenadas){
                //Asocio el marker_alta.coords a coordenadas
                $scope.marker_alta.coords.longitude = $scope.registroSeleccionado.coordenadas[0];
                $scope.marker_alta.coords.latitude = $scope.registroSeleccionado.coordenadas[1];
                //Centro el mapa
                $scope.map_alta.control.refresh({ latitude: $scope.registroSeleccionado.coordenadas[1], longitude: $scope.registroSeleccionado.coordenadas[0] });
              }

            $scope.mostrarBotonGuardar = false;

            //Verifico si tiene pacientes y si es necesario agregar uno en blanco
            //Filtro los objectos que estan vacios
            var emptyObj = $filter('filter')($scope.registroSeleccionado.pacientes, function (value) {
                if (value.edad == "" && value.nombre == "")
                    return true
            });
            if (emptyObj && emptyObj.length == 0)
                //creo un nuevo registro en blanco para que puedan seguir agregando
                $scope.registroSeleccionado.pacientes.push({ nombre: '', edad: '', sexo: '', observacion: '' });

            //Vuelvo a crear el watch
            $scope.InitWatch();
            //Genero el timeline
            //$scope.generarObjetoTimeLine();

        },

        BuscarDomicilio: function () {
            if ($scope.registroSeleccionado.direccion.length < 3)
                return;
            SearchService.search($scope.registroSeleccionado.direccion, 'neuquen').then(function (response) {
                if (response.status == 200) {
                    var calles = [];
                    for (var i = 0, len = response.data.length; i < len; i++) {
                        calles.push(response.data[i].nombre);
                    }
                    $scope.streetSearchResult = calles;
                }
                else
                    alert("Error - verifique la conexión a internet.");
            });
        },

        /*calles:[],//colocar todo el array de objetos json con las calles
        bulk: function () {
            $scope.calles.forEach(function (c) {
                SearchService.InsertIntoElastic(c.nombre, c.ciudad);
            });
        },*/

        GeoCode: function () {
            $scope.googleMapLoading = true;
            SearchService.geoCode($scope.registroSeleccionado.direccion).then(function (resp) {
                if (resp.length > 0) {
                    $scope.marker_alta.coords.latitude = resp[0].lat;
                    $scope.marker_alta.coords.longitude = resp[0].lon;
                    //Centro el mapa
                    $scope.map_alta.control.refresh({ latitude: resp[0].lat, longitude: resp[0].lon });
                }
                $scope.googleMapLoading = false;
            });
        },

        //initGoogleSearch: function () {
        //    if ($scope.googleSearchInit == false) {
        //        //Inicializo el google search autocomplete

        //        var options = {
        //            componentRestrictions: { country: 'AR' }
        //        };
        //        var input = document.getElementById('txtDireccion');

        //        var autocomplete = new google.maps.places.Autocomplete(input, options);
        //        autocomplete.addListener('place_changed', function () {

        //            var place = autocomplete.getPlace();
        //            if (place.geometry) {
        //                $scope.registroSeleccionado.coords.latitude = place.geometry.location.lat();
        //                $scope.registroSeleccionado.coords.longitude = place.geometry.location.lng();
        //                //Centro el mapa
        //                $scope.map_alta.control.refresh({ latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng() });

        //            }
        //        });
        //    }
        //},

        actualizarRegistros: function () {
            $scope.loading = true;
            $scope.registros = [];
            RegistrosService.listar().then(function (data) {
                $scope.registros = data;
                $scope.seleccionarRegistro($scope.registroSeleccionado._id);
                $scope.loading = false;
            });
        },

        crearNuevoRegistro: function () {
            $scope.seleccionarRegistro(null);
        },

        StopWatch: function () {
            if ($scope.watchRegistros)
                $scope.watchRegistros();
            if ($scope.watchCoords)
                $scope.watchCoords();
        },

        InitWatch: function () {
            $scope.watchRegistros = $scope.$watch('registroSeleccionado', function (newVal, oldVal) {
                if (angular.equals(newVal, oldVal) || !angular.equals(oldVal.salidas, newVal.salidas)) {
                    return; // simply skip that
                }

                if (!angular.equals(oldVal.pacientes, newVal.pacientes)) {
                    //Filtro los objectos que estan vacios
                    var emptyObj = $filter('filter')(newVal.pacientes, function (value) {
                        if (value.edad == "" && value.nombre == "") {
                            return true
                        }
                    });
                    if (emptyObj && emptyObj.length == 0)
                        //creo un nuevo registro en blanco para que puedan seguir agregando
                        $scope.registroSeleccionado.pacientes.push({ nombre: '', edad: '', sexo: '', observacion: '' });
                }
                $scope.mostrarBotonGuardar = true;
            }, true);

            //Observo los cambios en las coordenadas
            $scope.watchCoords = $scope.$watch('marker_alta.coords', function (newVal, oldVal) {
                if (angular.equals(newVal, oldVal)) {
                    return; // simply skip that
                }
                else {
                  $scope.registroSeleccionado.coordenadas= [newVal.longitude, newVal.latitude];
                  console.log("actualizo coordenadas en el watch");
                }
                $scope.mostrarBotonGuardar = true;
            }, true);
        },

        init: function () {
            $scope.loadingPrincipal = true;
            RegistrosService.listar().then(function (data) {
                $scope.registros = data;

                UtilService.getConstantes().then(function (data) {
                    $scope.finalizaciones = data.tipos_salida;
                    $scope.moviles = data.moviles;
                  });
/*
                SalidasService.getFinalizaciones().then(function (data) {
                    $scope.finalizaciones = data;

                    SalidasService.getDestinos().then(function (data) {
                        $scope.destinos = data;

                        SalidasService.getMoviles().then(function (data) {
                            $scope.moviles = data;
                            $scope.loadingPrincipal = false;
                        });
                    });
                });*/
            });
        }


    });
    $scope.init();

}]);
