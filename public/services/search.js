appModule.factory('SearchService', ['$http', '$filter', '$window', '$q', function ($http, $filter, $window, $q) {
  return {
    search: function (searchOptions) {
      return $http({ method: 'post', url: 'api/search/events', data: searchOptions }).then(function (response) {
        return response;
      });
    },
    searchCie10: function (cie10) {
      //Verifico si se encuentra en elastic search
      var searchOptions = { "direccion": cie10 };

      return $http({ method: 'post', url: 'api/search/cie10', data: searchOptions }).then(function (response) {
        return response;
      });
    },
    searchAddress: function (direccion, ciudad) {
      //Verifico si se encuentra en elastic search
      var searchOptions = { "direccion": direccion, "ciudad": ciudad };

      return $http({ method: 'post', url: 'api/search/streets', data: searchOptions }).then(function (response) {
        return response;
      });
    },
    geoCode: function (direccion) {

      var _address = direccion.replace(' ', '%20');
      /*//return $http({ method: 'get', url: 'https://nominatim.openstreetmap.org/search?street='+_address+'&city=neuquen&format=json' }).then(function (response) {
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=736+sarmiento+neuquen&key=AIzaSyBeuihfLrTLC9Y_K_iQUKMRmHEvibpp0Y4';
      return $http({
        method: 'get',
        url: url,
        headers: {
          'Authorization': undefined
        }
      }).then(function (response) {
        debugger;
        if (response.status == 200) {
        }
        else {
          response.data = [];
        }
        return response.data;
      });*/

      var defer = $q.defer();
      var geocoder = new $window.google.maps.Geocoder();
      geocoder.geocode({ address: direccion, componentRestrictions: { locality: 'neuquén' } }, function (results, status) {
        if (status === $window.google.maps.GeocoderStatus.OK) {
          if (results.length > 0) {
            //Verifico si no encontró ninguna dirección evito devolver el punto medio de neuquen
            var datos = [];
            if (results[0].formatted_address != 'Neuquén, Argentina')
              var datos = [{ lat: results[0].geometry.location.lat(), lon: results[0].geometry.location.lng() }];
            defer.resolve(datos)
          }
          else
            defer.resolve([]);

        } else {
          defer.reject();
        }
      });
      return defer.promise;


    }
  }
}]);