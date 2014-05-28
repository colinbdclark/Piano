/*global module*/
/*jshint strict:false*/

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        concat: {
            options: {
                separator: ";",
                banner: "<%= ammm.banners.short %>"
            },
            dist: {
                src: [
                    "js/oscillator.js",
                    "js/arpeggiator.js",
                    "js/aria.js",
                    "js/piano.js",
                    "js/grid.js",
                    "js/instrument.js",
                    "js/highlighter.js",
                    "js/gui.js",
                    "js/eventBinder.js"
                ],
                dest: "dist/automm.js"
            }
        },

        uglify: {
            options: {
                banner: "<%= ammm.banners.short %>"
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['*.js'],
                        dest: 'dist/',
                        ext: '.min.js',
                    }
                ]
            }
        },

        clean: {
            all: {
                src: ["dist/"]
            }
        },

        ammm: {
            banners: {
                short: "/*! Automagic Music Maker <%= pkg.version %>, " +
                    "Copyright <%= grunt.template.today('yyyy') %>Myles Borins | " +
                    "automagicmusicmaker.com */\n\n"
            }
        }
    });

    // Load relevant Grunt plugins.
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask("default", ["clean", "concat", "uglify"]);
};
