appModule.directive("kmlmanager", ['$filter',  function ($filter) {
  return {
    restrict: "E",
    scope: {
      kml: '=kml',
      map: '=map'
    },
    templateUrl: 'directives/templates/kml.html',
    link: function (scope, element, attrs) {
      scope.kmlArray = [];
      var kmlLayer=null;

      for (var i = 0;i< scope.kml.length; i++){
        kmlLayer= new google.maps.KmlLayer({
          url:scope.kml[i].url,
          map: scope.kml[i].visible? scope.map:null,
          preserveViewport: true
        });
        scope.kmlArray.push({kml:kmlLayer, visible: scope.kml[i].visible, title: scope.kml[i].title, icon: scope.kml[i].icon});
      }

      scope.ToggleLayer = function(i){
        scope.kmlArray[i].visible = !scope.kmlArray[i].visible;
        //Recorro el array y vuelvo a regenerar los layers para restaurar el orden
        for (var z=0; z < scope.kmlArray.length; z++){
          scope.kmlArray[z].kml.setMap(null)
          if(scope.kmlArray[z].visible)
            scope.kmlArray[z].kml.setMap(scope.map);
        }
      }


      /*scope.kml=attrs.kml;
      scope.map=attrs.map;*/

      /*scope.$watch(attrs.focusMe, function (value) {
      if (value === true) {
      console.log('value=', value);
      //$timeout(function() {
      element[0].focus();
      scope[attrs.focusMe] = false;
      //});
    }
  });*/
}
};

}]);
