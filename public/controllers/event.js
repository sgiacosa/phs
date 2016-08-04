appModule.controller('EventoController', ['$scope', '$location', '$routeParams', 'RegistrosService', '$filter', 'SalidasService', 'MensajesService', 'SearchService', 'UtilService', '$http','SweetAlert','$timeout','uiGmapPropMap', function ($scope, $location, $routeParams, RegistrosService, $filter, SalidasService, MensajesService, SearchService, UtilService, $http, SweetAlert,$timeout, uiGmapPropMap) {
  angular.extend($scope, {
    evento:{},
    loading: false,
    loadingPrincipal: true,
    nuevaSalida:false,
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
    kml:[{
      url:'http://www.google.com/maps/d/u/0/kml?mid=1WUYfyxf3toKH8LvIqU3IR-mphPo&lid=zV713s5UBi9s.k-L9mgOq5eas',
      visible: false,
      title: "Cuadrículas",
      icon:'fa fa-car'
    },
    {
      url:'http://www.google.com/maps/d/u/0/kml?mid=1WUYfyxf3toKH8LvIqU3IR-mphPo&lid=zV713s5UBi9s.kkXrY9io13H0',
      visible: false,
      title: "Comisarias",
      icon:'fa fa-home'
    },
  ],


  indicarArribo: function (_idSalida) {
    $scope.loading = true;
    SalidasService.indicarArribo($scope.registroSeleccionado._id, _idSalida).then(function (data) {
      if (data.status == 200){
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else {
        SweetAlert.swal("Atención",data.data, "error");
        $scope.loading = false;
      }
    });
  },

  indicarDestino: function (salida) {
    $scope.loading = true;
    SalidasService.indicarDestino($scope.registroSeleccionado._id, salida).then(function (data) {
      if (data.status == 200){
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else {
        SweetAlert.swal("Atención",data.data, "error");
        $scope.loading = false;
      }
    });
  },
  indicarQRU: function (_idSalida) {
    $scope.loading = true;
    SalidasService.indicarQRU($scope.registroSeleccionado._id, _idSalida).then(function (data) {
      if (data.status == 200)
      {
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else {
        SweetAlert.swal("Atención",data.data, "error");
        $scope.loading = false;
      }
    });
  },

  prepareNuevaSalida: function(){
    $scope.nuevaSalida=true;
    //Verifico disponibilidad y posicion de los moviles
    $scope.moviles=[];
    SalidasService.getMovilesDisponibles($scope.registroSeleccionado.coordenadas).then(function(data){
      for(var i=0; i< data.data.length; i++){
        if (!$scope.registroSeleccionado.coordenadas){
          //solo moviles disponibles
          if(data.data[i].estado == "1"){
            $scope.moviles.push({_id: data.data[i]._id, nombre: data.data[i].nombre, distancia: "-" });
          }
        }
        else{
          //solo moviles disponibles
          if(data.data[i].obj.estado == "1"){
            $scope.moviles.push({_id: data.data[i].obj._id, nombre: data.data[i].obj.nombre, distancia: data.data[i].dis });
          }
        }
      }
    });
  },

  enviarMovil: function (idMovil) {
    $scope.loading = true;
    SalidasService.nuevaSalida(idMovil, $scope.registroSeleccionado._id).then(function (data) {
      if (data.status == 200){
        //Actualizo los datos
        $scope.registroSeleccionado = data.data;
        $scope.initData();
      }
      else
      SweetAlert.swal("Atención",data.data, "error");
      $scope.nuevaSalida = false;
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
        //var _finalizacion = $filter('filter')($scope.finalizaciones, { id: s.idTipoFinalizacion })[0].descripcion;
        //var _destino = s.idDestino ? (' -> ' + $filter('filter')($scope.destinos, { id: s.idDestino })[0].descripcion) : '';
        $scope.timeLine.push({ fecha: s.fechaDestino, titulo: 'Destino', usuario: '', tipo: 2, descripcion: s.nombreMovil + ': ' + s.tipoSalida.nombre + ' ' + s.tipoSalida.destino });
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
    SweetAlert.swal({
      title: "Está seguro que desea cerrar este evento?",
      text: "Una vez modificado no podrá ser modificado",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, cerrar el evento",
      closeOnConfirm: true,
      closeOnCancel: true},
      function(respuesta){
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
          if (response.status == 403){
            $timeout(function () {
              SweetAlert.swal("Atención",response.data, "info");
            }, 100);
          }
          else
          $timeout(function () {
            SweetAlert.swal("Error en el servidor",response.data, "error");
          }, 100);

          $scope.loading = false;
        });
      });
    },

    /*******************   MENSAJES   ****************************/

    enviarMensaje: function () {
      if ($scope.txtMensaje.value) {
        var mensaje= {mensaje:$scope.txtMensaje.value, fecha:null};
        $scope.registroSeleccionado.mensajes.push(mensaje);
        $scope.txtMensaje.value = "";
      }
    },

    enviarSMS: function () {
      if ($scope.txtSms.length > 0) {
        var mensaje= {_id: $scope.registroSeleccionado._id, mensaje:$scope.txtSms};
        MensajesService.nuevoSMS(mensaje).then(function (response) {
          if (response.status == 200) {
            $scope.txtSms = "";
            //Actualizo los datos
            $scope.registroSeleccionado = response.data;
            $scope.initData();
          }
        });

      }
    },

    generarTextoSMS: function(){
      var mensaje ="";
      mensaje += " Recibe pedido: "+$filter('date')($scope.registroSeleccionado.fechaRegistro, 'HH:mm');
      if ($scope.registroSeleccionado.direccion)
      mensaje += " Direccion: "+$scope.registroSeleccionado.direccion;
      if ($scope.registroSeleccionado.observaciones)
      mensaje += " Anotación: "+$scope.registroSeleccionado.observaciones;
      if ($scope.registroSeleccionado.reporte)
      mensaje += "Reporte: "+$scope.registroSeleccionado.reporte;
      for (var i=0; i<$scope.registroSeleccionado.mensajes.length;i++)
      mensaje += " Mensaje: "+$scope.registroSeleccionado.mensajes[i].mensaje;
      for (var i=0; i<$scope.registroSeleccionado.salidas.length;i++)
      mensaje += " Asiste: "+$scope.registroSeleccionado.salidas[i].nombreMovil;
      if ($scope.registroSeleccionado.fechaCierre)
      mensaje += " Finaliza: "+$filter('date')($scope.registroSeleccionado.fechaCierre, 'HH:mm');

      $scope.txtSms = mensaje;
    },


    /*******************************************************/

    guardarCambios: function () {
      $scope.loading = true;
      RegistrosService.guardarCambios($scope.registroSeleccionado).then(function (data) {

        if (data.status == 200) {
          $scope.mostrarBotonGuardar = false;
          //Actualizo los datos
          $scope.registroSeleccionado = data.data;
          $scope.initData();
        }
        else
        SweetAlert.swal("Atención","Error al intentar guardar los datos.", "error");
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

    initData: function (_id) {
      //Controlo que guarde los cambios
      if ($scope.mostrarBotonGuardar && $scope.registroSeleccionado.fechaCierre == null) {
        SweetAlert.swal("Atención","Por favor guarde los cambios para poder continuar. Gracias", "info");
        return;
      }

      //Elimino el watch
      $scope.StopWatch();

      /*if (_id)
      $scope.registroSeleccionado = JSON.parse(JSON.stringify($filter('filter')($scope.registros, { _id: _id })[0]));
      else {
      //var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coords: { latitude: null, longitude: null }, fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [] }
      var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coordenadas: [], fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [] }
      $scope.registroSeleccionado = JSON.parse(JSON.stringify(nuevoRegistro));
    }*/

    //si tiene coords el array centro el mapa //IMPORTANTE [LON, LAT]
    if ($scope.registroSeleccionado.coordenadas && $scope.registroSeleccionado.coordenadas.length == 2){
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

  },

  BuscarDomicilio: function () {
    debugger;
    if (!$scope.registroSeleccionado.direccion || $scope.registroSeleccionado.direccion.length < 3)
    return;
    SearchService.searchAddress($scope.registroSeleccionado.direccion, 'neuquen').then(function (response) {
      if (response.status == 200) {
        var calles = [];
        for (var i = 0, len = response.data.length; i < len; i++) {
          calles.push(response.data[i].nombre);
        }
        $scope.streetSearchResult = calles;
      }
      else
      SweetAlert.swal("Error","Verifique su conexión a internet", "error");
    });
  },

  GeoCode: function () {
    if (!$scope.registroSeleccionado.direccion || $scope.registroSeleccionado.direccion.length < 3)
    return;
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

  aaaactualizarRegistros: function () {
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
      }
      $scope.mostrarBotonGuardar = true;
    }, true);
  },

  init: function () {
    $scope.loadingPrincipal = true;
    if($routeParams.id != "0"){
      RegistrosService.getById($routeParams.id).then(function (data) {
        $scope.registroSeleccionado = data;
        $scope.initData();
        UtilService.getConstantes().then(function (data) {
          $scope.finalizaciones = data.tipos_salida;
          //$scope.moviles = data.moviles;
          $scope.loadingPrincipal = false;
        });
      });
    }
    else {
      console.log("Nuevo Registro");
      var nuevoRegistro = { nombreContacto: '', telefonoContacto: '', direccion: '', clasificacion: 0, observaciones: '', observacionesClasificacion: '', coordenadas: [], fechaRegistro: null, fechaCierre: null, idUsuario: '', pacientes: [], salidas: [], mensajes:[] }
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
