/*
 * grunt-cssuglifier
 * https://github.com/benjaminschoch/cssuglifier
 *
 * Copyright (c) 2015 benjamin.schoch
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: {
      tests: ['dest']
    },

    cssuglifier: {
      options: {
        addJQueryPluginToJS: 1
      },
      files: {
        src: 'src/**/*.css',
        dest: 'dest'
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'cssuglifier'
  ]);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test']);

};
