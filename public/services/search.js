appModule.factory('SearchService', ['$http', '$filter', function ($http, $filter) {
      return {
        search: function(searchOptions) {
          return $http({ method: 'post', url: 'api/search/events', data: searchOptions }).then(function (response) {
            return response;
          });
        },
        searchCie10: function (cie10) {
          //Verifico si se encuentra en elastic search
          var searchOptions = {"direccion":cie10};

          return $http({ method: 'post', url: 'api/search/cie10', data: searchOptions }).then(function (response) {
            return response;
          });
        },
        searchAddress: function (direccion, ciudad) {
          //Verifico si se encuentra en elastic search
          var searchOptions = {"direccion":direccion, "ciudad": ciudad};

          return $http({ method: 'post', url: 'api/search/streets', data: searchOptions }).then(function (response) {
            return response;
          });
        },
        geoCode: function (direccion) {

          var _address = direccion.replace(' ','%20');
          return $http({ method: 'get', url: 'https://nominatim.openstreetmap.org/search?street='+_address+'&city=neuquen&format=json' }).then(function (response) {

            if (response.status == 200) {
            }
            else {
              response.data = [];
            }
            return response.data;
          });
        }
      }
    }]);