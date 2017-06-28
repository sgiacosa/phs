appModule.controller('EventoController', ['$scope', '$location', '$routeParams', 'RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http', 'SweetAlert', '$timeout', 'mySocket', function ($scope, $location, $routeParams, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http, SweetAlert, $timeout, mySocket) {
  angular.extend($scope, {
    evento: {},
    loading: false,
    loadingPrincipal: true,
    savingEvent: false,
    nuevaSalida: false,
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
    avoidGeoCode: false,
    finalizaciones: [],
    destinos: [],
    moviles: [],
    showmap: false,
    cityCoords: { latitude: -38.9513715362757, longitude: -68.0589395877441 },
    map_alta: { center: { latitude: -38.9513715362757, longitude: -68.0589395877441 }, zoom: 14, control: {} },
    marker_alta: {
      id: 0,
      coords: {
        latitude: null,
        longitude: null
      },
      options: { draggable: true }
    },
    kml: [{
      url: 'http://www.google.com/maps/d/u/0/kml?mid=1WUYfyxf3toKH8LvIqU3IR-mphPo&lid=zV713s5UBi9s.k-L9mgOq5eas',
      visible: false,
      title: "Cuadrículas",
      icon: 'fa fa-car'
    },
    {
      url: 'http://www.google.com/maps/d/u/0/kml?mid=1WUYfyxf3toKH8LvIqU3IR-mphPo&lid=zV713s5UBi9s.kkXrY9io13H0',
      visible: false,
      title: "Comisarias",
      icon: 'fa fa-home'
    },
    {
      url: 'https://sien.neuquen.gov.ar/kml4.kml',
      visible: false,
      title: "Z1",
      icon: 'fa fa-map'
    }
    ],

    initSocket: function () {
      console.log('init socket');
      mySocket.on('dbChange', function (data) {
        //Verifico si el registro que cambió es sobre el que estoy trabajando
        if (data._id == $scope.registroSeleccionado._id) {
          $scope.registroSeleccionado = data;
          $scope.initData();
        }
      });
    },

    enviarMovil: function (idMovil) {
      if ($scope.cambiosSinGuardar()) return;

      $scope.loading = true;
      SalidasService.nuevaSalida(idMovil, $scope.registroSeleccionado._id).then(function (data) {
        if (data.status == 200) {
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else
          SweetAlert.swal("Atención", data.data, "error");
        $scope.nuevaSalida = false;
        $scope.loading = false;
      });
    },

    //Cuando el equipo se sube al movil y se pone en  movimiento
    indicarMovimiento: function (_idSalida) {
      if ($scope.cambiosSinGuardar()) return;
      $scope.loading = true;
      SalidasService.indicarMovimiento($scope.registroSeleccionado._id, _idSalida).then(function (data) {
        if (data.status == 200) {
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },

    indicarArribo: function (_idSalida) {
      if ($scope.cambiosSinGuardar()) return;

      $scope.loading = true;
      SalidasService.indicarArribo($scope.registroSeleccionado._id, _idSalida).then(function (data) {
        if (data.status == 200) {
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },

    indicarDestino: function (salida) {
      if ($scope.cambiosSinGuardar()) return;

      $scope.loading = true;
      SalidasService.indicarDestino($scope.registroSeleccionado._id, salida).then(function (data) {
        if (data.status == 200) {
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },
    indicarQRU: function (_idSalida) {
      if ($scope.cambiosSinGuardar()) return;

      $scope.loading = true;
      SalidasService.indicarQRU($scope.registroSeleccionado._id, _idSalida).then(function (data) {
        if (data.status == 200) {
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else {
          SweetAlert.swal("Atención", data.data, "error");
          $scope.loading = false;
        }
      });
    },

    cancelarSalida: function (_idSalida) {
      if ($scope.cambiosSinGuardar()) return;

      SweetAlert.swal({
        title: "Está seguro que desea cancelar este despacho?",
        text: "Una vez cancelado no podrá ser modificado",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, cancelar el despacho.",
        closeOnConfirm: true,
        closeOnCancel: true
      },
        function (respuesta) {
          if (!respuesta)
            return;
          $scope.loading = true;
          SalidasService.indicarCancelacion($scope.registroSeleccionado._id, _idSalida).then(function (data) {
            if (data.status == 200) {
              //Actualizo los datos 
              $scope.registroSeleccionado = data.data;
              $scope.initData();
            }
            else {
              SweetAlert.swal("Atención", data.data, "error");
              $scope.loading = false;
            }
          });
        });


    },


    prepareNuevaSalida: function () {
      $scope.nuevaSalida = true;
      //Verifico disponibilidad y posicion de los moviles
      $scope.moviles = [];
      $scope.loadingDistances = true;
      SalidasService.getMovilesDisponibles($scope.registroSeleccionado.coordenadas).then(function (data) {
        for (var i = 0; i < data.data.length; i++) {

          //solo moviles disponibles
          if (data.data[i].estado == "1") {
            $scope.moviles.push(data.data[i]);
          }

        }
        $scope.loadingDistances = false;
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
          $scope.timeLine.push({ fecha: s.fechaDestino, titulo: 'Destino', usuario: '', tipo: 2, descripcion: s.nombreMovil + ': ' + s.tipoSalida.nombre + ' ' + s.tipoSalida.destino });
        }
        if (s.fechaQRU)
          $scope.timeLine.push({ fecha: s.fechaQRU, titulo: 'QRU ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
        if (s.fechaCancelacion)
          $scope.timeLine.push({ fecha: s.fechaCancelacion, titulo: 'Cancelado ', descripcion: s.nombreMovil, usuario: '', tipo: 2 })
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
      if ($scope.cambiosSinGuardar()) return;

      SweetAlert.swal({
        title: "Está seguro que desea cerrar este evento?",
        text: "Una vez modificado no podrá ser modificado",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, cerrar el evento",
        closeOnConfirm: true,
        closeOnCancel: true
      },
        function (respuesta) {
          if (!respuesta)
            return;
          $scope.loading = true;
          RegistrosService.cerrarRegistro($scope.registroSeleccionado._id).then(function (response) {
            if (response.status == 200) {
              $scope.mostrarBotonGuardar = false;
              //Actualizo los datos
              $scope.registroSeleccionado = response.data;
              $scope.initData();
            }
            else
              if (response.status == 403) {
                $timeout(function () {
                  SweetAlert.swal("Atención", response.data, "info");
                }, 100);
              }
              else
                $timeout(function () {
                  SweetAlert.swal("Error en el servidor", response.data, "error");
                }, 100);

            $scope.loading = false;
          });
        });
    },

    /*******************   MENSAJES   ****************************/

    enviarMensaje: function () {
      if ($scope.txtMensaje.value) {
        var mensaje = { mensaje: $scope.txtMensaje.value, fecha: null };
        $scope.registroSeleccionado.mensajes.push(mensaje);
        $scope.txtMensaje.value = "";
      }
    },

    /*******************************************************/

    guardarCambios: function () {
      $scope.loading = true;
      $scope.savingEvent = true;
      RegistrosService.guardarCambios($scope.registroSeleccionado).then(function (data) {

        if (data.status == 200) {
          $scope.mostrarBotonGuardar = false;
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else
          SweetAlert.swal("Atención", "Error al intentar guardar los datos.", "error");
        $scope.loading = false;
        $scope.savingEvent = false;
      });
    },

    cancelarCambios: function () {
      //Elimino el watch
      $scope.StopWatch();
      $location.path('/');

    },

    initData: function (_id) {
      //Elimino el watch
      $scope.StopWatch();
      //si tiene coords el array centro el mapa //IMPORTANTE [LON, LAT]
      if ($scope.registroSeleccionado.coordenadas && $scope.registroSeleccionado.coordenadas.length == 2) {
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
      $scope.generarObjetoTimeLine();

      //
      $scope.$on('$destroy', function () {
        mySocket.removeAllListeners();
      });

    },

    BuscarDomicilio: function () {
      if (!$scope.registroSeleccionado.direccion || $scope.registroSeleccionado.direccion.length < 3)
        return;
      var term = $scope.registroSeleccionado.direccion;
      if ($scope.registroSeleccionado.direccion.indexOf(' y ') != -1) {
        term = $scope.registroSeleccionado.direccion.substr($scope.registroSeleccionado.direccion.indexOf(' y ') + 3);
      }

      SearchService.searchAddress(term, 'neuquen').then(function (response) {
        if (response.status == 200) {
          var calles = [];
          var premisa = "";
          //Verifico si estaba haciendo una busqueda de interseccion de una direccion
          if ($scope.registroSeleccionado.direccion.indexOf(' y ') != -1) {
            premisa = $scope.registroSeleccionado.direccion.substr(0, $scope.registroSeleccionado.direccion.indexOf(' y ') + 3);
          }
          for (var i = 0, len = response.data.length; i < len; i++) {
            calles.push({ text: premisa + '' + response.data[i]._source.nombre, obj: response.data[i] });
          }
          $scope.streetSearchResult = calles;
        }
        else
          SweetAlert.swal("Error", "Verifique su conexión a internet", "error");
      });
    },

    DomicilioSelected: function (s) {
      if (s != undefined) {
        switch (s.obj._index) {
          case 'escuelas':
            $scope.avoidGeoCode = true;
            $scope.marker_alta.coords.latitude = s.obj._source.latitude;
            $scope.marker_alta.coords.longitude = s.obj._source.longitude;
            //Centro el mapa
            $scope.map_alta.control.refresh({ latitude: s.obj._source.latitude, longitude: s.obj._source.longitude });
            break;
          default:
            $scope.avoidGeoCode = false;
            break;
        }
      }
    },

    UbicarPuntoFormaManual: function () {
      $scope.marker_alta.coords = $scope.cityCoords;
    },

    GeoCode: function () {
      if ($scope.avoidGeoCode || !$scope.registroSeleccionado.direccion || $scope.registroSeleccionado.direccion.length < 3)
        return;
      $scope.googleMapLoading = true;
      SearchService.geoCode($filter('lowercase')($scope.registroSeleccionado.direccion)).then(function (resp) {
        if (resp.length > 0) {
          $scope.marker_alta.coords.latitude = resp[0].lat;
          $scope.marker_alta.coords.longitude = resp[0].lon;
          //Centro el mapa
          $scope.map_alta.control.refresh({ latitude: resp[0].lat, longitude: resp[0].lon });
        }
        else {
          $scope.marker_alta.coords.latitude = null;
          $scope.marker_alta.coords.longitude = null;
        }
        $scope.googleMapLoading = false;
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
          if (newVal.latitude == null && newVal.longitude == null)
            $scope.registroSeleccionado.coordenadas = null;
          else
            $scope.registroSeleccionado.coordenadas = [newVal.longitude, newVal.latitude];
        }
        $scope.mostrarBotonGuardar = true;
      }, true);
    },

    cambiosSinGuardar: function () {
      if ($scope.mostrarBotonGuardar) {
        SweetAlert.swal("Atención", "Para continuar guarde los cambios.", "info");
        return true
      }
      else
        return false;
    },

    init: function () {

      $scope.loadingPrincipal = true;
      if ($routeParams.id != "0") {
        RegistrosService.getById($routeParams.id).then(function (data) {
          $scope.registroSeleccionado = data;
          $scope.initData();
          $scope.initSocket();
          UtilService.getConstantes().then(function (data) {
            $scope.finalizaciones = data.tipos_salida;
            //$scope.moviles = data.moviles;
            $scope.loadingPrincipal = false;
          });
        });
      }
      else {
        console.log("Nuevo Registro");
        var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', referenciaDireccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coordenadas: [], fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [], mensajes: [] }
        $scope.registroSeleccionado = JSON.parse(JSON.stringify(nuevoRegistro));
        $scope.initData();
        UtilService.getConstantes().then(function (data) {
          $scope.finalizaciones = data.tipos_salida;
          //$scope.moviles = data.moviles;
          $scope.loadingPrincipal = false;
        });
      }
    }


  });
  $scope.init();
}]);
