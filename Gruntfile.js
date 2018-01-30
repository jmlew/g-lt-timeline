module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.initConfig({
    shell: {
      options : {
        stdout: true
      },
      npm_install: {
        command: 'npm install'
      }
    },

    connect: {
      options: {
        base: 'app/'
      },
      webserver: {
        options: {
          port: 8888,
          keepalive: true
        }
      },
      devserver: {
        options: {
          port: 8888
        }
      }
    },

    open: {
      devserver: {
        path: 'http://localhost:8888'
      }
    },

    sass: {
      dist: {
        files: {
          'app/styles/app.css' : 'app/styles/app.scss',
          'app/styles/timeline.css' : 'app/styles/timeline.scss',
        }
      }
    },

    watch: {
      js: {
        files: ['app/scripts/**/*.js'],
        tasks: ['concat:scripts'],
        options: {livereload: true}
      },
      css: {
        files: ['app/styles/*.css'],
        tasks: ['concat:styles'],
      },
      sass: {
        files: ['app/styles/*.scss'],
        tasks: ['sass'],
      }
    },

    concat: {
      styles: {
        dest: './app/assets/app.css',
        src: [
          'app/styles/*.css',
        ]
      },
      scripts: {
        options: {
          // separator: ';',
          sourceMap :true,
          // sourceMapStyle: 'link'
        },
        dest: './app/assets/app.js',
        src: [
          'app/scripts/app.js',
          'app/scripts/timeline/timeline_service.js',
          'app/scripts/timeline/timeline.js',
          'app/scripts/reporting/reporting.js',
        ]
      }
    }
  });

  //installation-related
  grunt.registerTask('install', ['shell:npm_install']);

  //development
  grunt.registerTask('dev', [
    'concat:styles',
    'concat:scripts',
    'connect:devserver',
    'open:devserver',
    'watch',
  ]);

  //server daemon
  grunt.registerTask('serve', ['connect:webserver']);

  //defaults
  grunt.registerTask('default', ['dev']);
};
