module.exports = function(grunt) {
  // Permite observar cambios en archivos
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Permite concatenar archivos
  grunt.loadNpmTasks('grunt-contrib-concat');
  //Permite minificar archivos
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // on the dev server, only concat
  grunt.registerTask('default', ['concat:lib', 'concat:app']);

  // on production, concat and minify
  grunt.registerTask('prod', ['concat:lib','concat:app', 'uglify']);


  grunt.initConfig({
    // Configuración de watch
    watch: {
      js: {
        files: ['public/js/vendor/**/*.*', 'public/js/app.js', 'public/directives/**/*.*', 'public/controllers/**/*.*', 'public/services/**/*.*' ],
        tasks: ['default']
      }
    },
    // Configuración de la tarea grunt-contrib-concat
    concat: {
      options: {
        stripBanners: false,
        separator: '\n',
      },
      lib: { // Archivos .js
        dest: './public/js/dist/lib.js',
        src: [
          'public/js/vendor/Angular.js',
          'public/js/vendor/Angular-animate-min.js',
          'public/js/vendor/Angular-route.js',
          'public/js/vendor/nools.js',
          'public/js/vendor/lodash.js',
          'public/js/vendor/Angular-Simple-Logger.js',
          'public/js/vendor/Angular-google-maps.js',
          'public/js/vendor/firebase.js',
          'public/js/vendor/AngularFire.min.js',
          'public/js/vendor/ui-bootstrap-tpls-1.1.0.min.js',
          'bower_components/moment/moment.js',
          'bower_components/moment/locale/es.js',
          'bower_components/angular-moment/angular-moment.min.js',
          'bower_components/angular-jwt/dist/angular-jwt.min.js',
          'bower_components/angular-socket-io/socket.min.js',
          'bower_components/socket.io-client/socket.io.js',
          'bower_components/sweetalert/dist/sweetalert.min.js',
          'bower_components/ngSweetAlert/SweetAlert.min.js'
        ]
      },
      app: { // Archivos .js
        dest: './public/js/dist/app.js',
        src: [
          'public/js/App.js',
          'public/directives/flujo.js',
          'public/directives/autocomplete.js',
          'public/directives/kml.js',
          'public/controllers/list.js',
          'public/controllers/event.js',
          'public/controllers/login.js',
          'public/controllers/search.js',
          'public/controllers/main.js',
          'public/controllers/monitor.js'
        ]
      }
    },
    uglify: {
      my_target: {
        files: {
          //'./public/js/dist/lib.js': ['./public/js/dist/lib.js'],
          './public/js/dist/app.js': ['./public/js/dist/app.js']
        }
      }
    }
  });
};
