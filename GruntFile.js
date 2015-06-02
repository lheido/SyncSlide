module.exports = function(grunt) {

    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    update: true
                },
                files: {
                    "public/css/syncSlide.css": "assets/scss/syncSlide.scss"
                }
            }
        },
        uglify: {
            my_target: {
                options: {
                    beautify: false
                },
                files: {
                    'public/js/Sync.js': ['assets/js/Sync.js'],
                }
            }
        },
        watch: {
            styles: {
                files: ['**/*.scss'],
                tasks: ['sass:dist']
            },
            scripts: {
                files: ["assets/js/*.js"],
                tasks: ['uglify:my_target']
            },
            html: {
                files: ["assets/**/*.html"],
                tasks: ['copy:html']
            },
            options: {
                livereload: true
            }
        },
        copy: {
            html: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets/html/',
                        src: ['*.html'],
                        dest: 'public/html/'
                    },
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['sass:dist']);
}
