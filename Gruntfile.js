module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        src: '/tmp/concatenated.js',
        dest: 'public/js/funktion.fm.js'
      }
    },

    less: {
      prod: {
        files: {
          'public/css/funktion.fm.css': 'frontend/funktion.fm.less'
        }
      }
    },

    browserify: {
      dist: {
        files: {
          '/tmp/browserified.js': ['frontend/main.js'],
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'frontend/vendor/jquery-2.0.3.js',
          'frontend/vendor/jquery.mousewheel.js',
          'frontend/vendor/jquery.jscrollpane.js',
          '/tmp/browserified.js'
        ],
        dest: '/tmp/concatenated.js',
      },
    },

    copy: {
      main: {
        files: [
          {src: ['/tmp/concatenated.js'], dest: 'public/js/funktion.fm.js', filter: 'isFile'}
        ]
      }
    },

    watch: {
      scripts: {
        files: [
          'frontend/**/*.js',
          'frontend/*.js',
          'frontend/funktion.fm.less',
          'Gruntfile.js'
        ],
        tasks: ['devBuild'],
        options: {
          spawn: false,
        },
      },
    },


  })

  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-browserify')

  grunt.registerTask('default', ['less', 'browserify', 'concat', 'uglify'])
  grunt.registerTask('devBuild', ['less', 'browserify', 'concat', 'copy'])

}
