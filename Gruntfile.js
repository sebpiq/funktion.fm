module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        src: '/tmp/browserified.js',
        dest: 'public/js/funktion.fm.js'
      }
    },

    less: {
      prod: {
        files: {
          'public/css/funktion.fm.css': 'frontend/less/funktion.fm.less'
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

    copy: {
      main: {
        files: [
          {src: ['/tmp/browserified.js'], dest: 'public/js/funktion.fm.js', filter: 'isFile'}
        ]
      }
    },

    exec: {
      compileTemplates: {
        cmd: 'node compileTemplates.js'
      }
    },

    watch: {
      scripts: {
        files: [
          'frontend/**/*.js',
          'frontend/*.js',
          'Gruntfile.js'
        ],
        tasks: ['scripts:dev'],
        options: {
          spawn: false,
        },
      },

      less: {
        files: [
          'frontend/less/*.less',
        ],
        tasks: ['less'],
        options: {
          spawn: false,
        },
      },

      templates: {
        files: [
          'templates/**/*.md',
          'templates/**/*.hbs'
        ],
        tasks: ['exec:compileTemplates'],
        options: {
          spawn: false,
        },
      }

    },


  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-exec')

  grunt.registerTask('scripts:dev', ['browserify', 'copy'])
  grunt.registerTask('default', ['less', 'browserify', 'uglify', 'exec:compileTemplates'])
  grunt.registerTask('devBuild', ['less', 'scripts:dev', 'exec:compileTemplates'])

}
