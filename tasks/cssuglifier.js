/*
 * grunt-cssuglifier
 * https://github.com/benjaminschoch/cssuglifier
 *
 * Copyright (c) 2015 benjamin.schoch
 * Licensed under the MIT license.
 */

'use strict';

var md5 = require('MD5');
var path = require('path');
var glob = require("glob");
var getCssFromJs = require('get_css_from_js');
var Buffer = require('buffer').Buffer;

module.exports = function (grunt) {

  grunt.registerMultiTask('cssuglifier', 'CSS class name shortener', function () {
    var defaultOptions = {
      classPrefix: '\\.',
      keepBemModifier: 1,
      bemModifierPrefix: '--',

      createJsonMapFile: true,
      jsonMapFilePath: this.name + '_mapping.json',

      createJSMapFile: 1,
      jsMapVarDefinition: 'var ' + this.name + 'Map',
      jsMapFilePath: this.name + '_mapping.js',

      prependMapJson: '',
      appendMapJson: '',

      fileNameSuffix: '.ugly'
    };

    // append config values from gruntfile
    var appConfig = grunt.config.get(this.name);
    for (var key in appConfig) if (appConfig.hasOwnProperty(key)) {
      defaultOptions[key] = appConfig[key];
    }

    var options = this.options(defaultOptions);

    var srcFiles = [];
    this.files.forEach(function (file) {
      var addFiles = file.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });
      srcFiles = srcFiles.concat(addFiles);
    });

    var useGlobbing = (typeof options.files.src === 'string' && options.files.src.indexOf('*') >= 0);

    // fallback to overwrite mode
    if (typeof options.files.dest === "undefined") {
      options.files.dest = srcFiles;
    } else if (typeof options.files.dest === "string" && !options.files.dest.match('.css')) {
      var destDir = path.normalize(options.files.dest);
      if (destDir.substring(-1) == '/') {
        destDir = destDir.substring(0, destDir.length - 1);
      }
      options.files.dest = [];
      var subDir = '';
      for (var i = 0; i < srcFiles.length; i++) {
        if (useGlobbing) {
          var subDirBase = options.files.src.replace(/^([^\*]+).*$/, '$1') + '';
          var dirName = path.dirname(srcFiles[i]) + '/';
          subDir = dirName.replace(subDirBase, '');
        }
        subDir = '/' + subDir;
        var basename = path.basename(srcFiles[i]);
        options.files.dest[i] = destDir + subDir + basename
      }
    }

    if (options.files.dest.length !== srcFiles.length) {
      grunt.log.warn("Source & destination definition don't match.");
      return false;
    }

    var mapped = prepareJsonMap(options);
    var fileSizeTotal = 0;
    var newFileSizeTotal = 0;

    srcFiles.forEach(function (src, id) {
      if (!grunt.file.exists(src)) {
        grunt.log.warn('Source file "' + src + '" not found.');
        return false;
      }

      var fileContent = grunt.file.read(src);

      /** parse CSS file */
      if (src.match(/.*\.css$/)) {
        var regexStr = '(' + options.classPrefix + ')(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\\{]*\\})';
        var regex = new RegExp(regexStr, 'g');
        var result = fileContent.replace(regex, function (className, prefix) {
          className = sanitizeClassName(className);
          var suffix = '';
          if (options.keepBemModifier && className.indexOf(options.bemModifierPrefix)) {
            var classNameParts = className.split(options.bemModifierPrefix);
            if (classNameParts.length === 2) {
              className = classNameParts[0];
              suffix = '--' + classNameParts[1];
            }
          }
          var anonymizedClassName = '__ERROR__';
          if (mapped.hasOwnProperty(className)) {
            anonymizedClassName = mapped[className];
          } else {
            anonymizedClassName = uniqueAnonymizedName(className, mapped);
            mapped[className] = anonymizedClassName;
          }
          anonymizedClassName = prefix + anonymizedClassName + suffix;
          return anonymizedClassName;
        });

        var destFileName = options.files.dest[id];

        destFileName = destFileName.replace(/^(.*)(\.\D+)$/, '$1' + options.fileNameSuffix + '$2');

        grunt.file.write(destFileName, result);

        var fileSize = Buffer.byteLength(fileContent) / 1024;
        fileSizeTotal += fileSize;
        var newFileSize = Buffer.byteLength(result) / 1024;
        newFileSizeTotal += newFileSize;
        var savedKB = (fileSize - newFileSize);
        var savedPercent = (savedKB / fileSize * 100);
        var savedMessage = path.basename(destFileName) + ' -> saved ' + savedPercent.toFixed(2) + '% (from ' + fileSize.toFixed(2) + ' to ' + newFileSize.toFixed(2) + ' KB)';
        grunt.log.oklns(savedMessage)
      }

      /** parse JS file */
      if (src.match(/.*\.js/)) {
        var classNamesFromJS = getCssFromJs(src);
        for (var c = 0; c < classNamesFromJS.length; c++) {
          var className = sanitizeClassName(classNamesFromJS[c]);
          var suffix = '';
          if (options.keepBemModifier && className.indexOf(options.bemModifierPrefix)) {
            var classNameParts = className.split(options.bemModifierPrefix);
            if (classNameParts.length === 2) {
              className = classNameParts[0];
              suffix = '--' + classNameParts[1];
            }
          }
          var anonymizedClassName = '__ERROR__';
          if (mapped.hasOwnProperty(className)) {
            anonymizedClassName = mapped[className];
          } else {
            anonymizedClassName = uniqueAnonymizedName(className, mapped);
            mapped[className] = anonymizedClassName;
          }
        }
      }
    });

    mapped = appendJsonMap(mapped, options);

    var jsContent = JSON.stringify(mapped);
    jsContent = jsContent.replace(/\s+/, '');

    if (options.createJsonMapFile) {
      grunt.file.write(options.jsonMapFilePath, jsContent);
    }

    if (options.createJSMapFile) {
      jsContent = options.jsMapVarDefinition + ' = ' + jsContent + ';';
      grunt.file.write(options.jsMapFilePath, jsContent);
    }

    grunt.log.oklns('---------------------------------------------------');

    var savedKB = (fileSizeTotal - newFileSizeTotal);
    var savedPercent = (savedKB / fileSizeTotal * 100);
    var savedMessage = 'CSS uglification: saved ' + savedPercent.toFixed(2) + '% (' + savedKB.toFixed(2) + ' KB)';
    grunt.log.oklns(savedMessage)

  });

  var prepareJsonMap = function (options) {
    var map = {};
    if (typeof options.prependMapJson === "string" && options.prependMapJson.length) {
      if (!grunt.file.exists(options.prependMapJson)) {
        grunt.log.warn('Source file "' + options.prependMapJson + '" not found.');
      }

      var additionalMap = grunt.file.readJSON(options.prependMapJson);
      for (var key in additionalMap) {
        if (additionalMap.hasOwnProperty(key)) {
          map[key] = additionalMap[key];
        }
      }
    }

    return map;
  };

  var appendJsonMap = function (generatedMap, options) {
    var src = options.appendMapJson;
    if (typeof src === "string" && src.length) {
      if (!grunt.file.exists(src)) {
        grunt.log.warn('Source file "' + src + '" not found.');
      }

      var additionalMap = grunt.file.readJSON(src);
      for (var key in additionalMap) {
        if (additionalMap.hasOwnProperty(key)) {
          generatedMap[key] = additionalMap[key];
        }
      }
    }

    return generatedMap;
  };

  var anonymizeName = function (name, strLen) {
    name = md5(name);
    name = name.substring(0, strLen);
    if (name.match(/^\d+.*$/)) {
      name = name.replace(/^(\d{1})(.*)$/, function (n, p1, p2) {
        return 'abcdefghijklmnopqrstuvwxyz'.charAt(p1) + '' + p2;
      });
    }
    return name;
  };

  var uniqueAnonymizedName = function (name, alreadyMapped) {
    var incomingName = name;
    var limitCrypt = 30;
    var actualStringLength = incomingName.length;
    var maxStringLength = Math.ceil(actualStringLength * .8);
    var success = false;
    for (var i = 0; i < limitCrypt; i++) {
      for (var strLen = 2; strLen <= maxStringLength; strLen++) {
        name = anonymizeName(name, strLen);
        if (!objectValueExists(name, alreadyMapped)) {
          success = true;
          break;
        }
        if (strLen === actualStringLength && !objectValueExists(incomingName, alreadyMapped)) {
          name = incomingName;
          success = true;
          break;
        }
      }

      if (success) {
        break;
      }
    }

    if (!success) {
      name = incomingName;
    }

    return name;
  };

  var sanitizeClassName = function (className) {
    className = className.replace(/^\.(.*)$/, '$1');
    return className;
  };

  var objectValueExists = function (term, obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === term) {
        return true;
      }
    }
    return false;
  }

};
