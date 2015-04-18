module.exports = function (grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    var files = ['app/**/*.js', 'Brocfile.js'];

    grunt.initConfig({
        jshint: {
            files: files,
            options: {
                jshintrc: './.jshintrc'
            }
        },
        js_beautify: {
            default_options: {
                options: {
                    end_with_newline: true,
                    max_preserve_newlines: 1
                },
                files: {
                  'application_files': ['app/**/*.js']
                }
            }
        },
        jscs: {
            files: {
                src: files
            },
            options: {
                config: '.jscsrc',
                esnext: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-js-beautify');
    grunt.registerTask('codestyle', ['jshint', 'jscs']);
    grunt.registerTask('test', ['codestyle']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('beautify', ['js_beautify']);
};
