'use strict';

module.exports = function(grunt) {

  var lintFiles = [
    'src/*.js',
  ]; // add more over time ... goal should be 100% coverage

  var version = grunt.option('release');
  var fs = require('fs');
  var browser_capabilities;

  if (process.env.SELENIUM_BROWSER_CAPABILITIES !== undefined) {
    browser_capabilities = JSON.parse(process.env.SELENIUM_BROWSER_CAPABILITIES);
  }

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      openpgp: {
        files: {
          'dist/openpgp-keyring.js': [ './src/keyring/index.js' ]
        },
        options: {
          browserifyOptions: {
            standalone: 'openpgp-keyring'
          },
          external: [ 'crypto', 'buffer', 'node-localstorage', 'openpgp' ],
          transform: [
            ["babelify", {
              ignore: ['*.min.js'],
              presets: ["es2015"]
            }]
          ]
        }
      },
      openpgp_debug: {
        files: {
          'dist/openpgp-keyring_debug.js': [ './src/keyring/index.js' ]
        },
        options: {
          browserifyOptions: {
            debug: true,
            standalone: 'openpgp-keyring'
          },
          external: [ 'crypto', 'buffer', 'node-localstorage', 'openpgp' ],
          transform: [
            ["babelify", {
              ignore: ['*.min.js'],
              presets: ["es2015"]
            }]
          ]
        }
      }
      /*,
      unittests: {
        files: {
          'test/lib/unittests-bundle.js': [ './test/unittests.js' ]
        },
        options: {
          external: [ 'crypto', 'buffer' , 'node-localstorage', 'node-fetch', 'openpgp', '../../dist/openpgp', '../../../dist/openpgp' ]
        }
      }
      */
    },
    replace: {
      "openpgp-keyring": {
        src: ['dist/openpgp-keyring.js'],
        dest: ['dist/openpgp-keyring.js'],
        replacements: [{
          from: /OpenPGP-keyring.js VERSION/g,
          to: 'OpenPGP-keyring.js v<%= pkg.version %>'
        }]
      },
      "openpgp-keyring_debug": {
        src: ['dist/openpgp-keyring_debug.js'],
        dest: ['dist/openpgp-keyring_debug.js'],
        replacements: [{
          from: /OpenPGP-keyring.js VERSION/g,
          to: 'OpenPGP-keyring.js v<%= pkg.version %>'
        }]
      }
    },
    uglify: {
      "openpgp-keyring": {
        files: {
          'dist/openpgp-keyring.min.js' : [ 'dist/openpgp-keyring.js' ]
        }
      },
      options: {
        banner: '/*! OpenPGP.js v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
          'this is LGPL licensed code, see LICENSE/our website <%= pkg.homepage %> for more information. */'
      }
    },
    jsbeautifier: {
      files: ['src/**/*.js'],
      options: {
        indent_size: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        keep_function_indentation: false,
        wrap_line_length: 120
      }
    },
    jshint: {
      src: lintFiles,
      build: ['Gruntfile.js', '*.json'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jscs: {
      src: lintFiles,
      build: ['Gruntfile.js'],
      options: {
        config: ".jscsrc",
        esnext: true,
        verbose: true,
      }
    },
    jsdoc: {
      dist: {
        src: ['README.md', 'src'],
        options: {
          destination: 'doc',
          recurse: true
        }
      }
    },
    mocha_istanbul: {
      coverage: {
        src: 'test',
        options: {
          root: '.',
          timeout: 240000,
        }
      }
    },
    mochaTest: {
      unittests: {
        options: {
          reporter: 'spec',
          timeout: 120000
        },
        src: [ 'test/*.js' ]
      }
    },
    /*
    copy: {
      browsertest: {
        expand: true,
        flatten: true,
        cwd: 'node_modules/',
        src: ['mocha/mocha.css', 'mocha/mocha.js', 'chai/chai.js', 'whatwg-fetch/fetch.js'],
        dest: 'test/lib/'
      },
      zlib: {
        expand: true,
        cwd: 'node_modules/zlibjs/bin/',
        src: ['rawdeflate.min.js','rawinflate.min.js','zlib.min.js'],
        dest: 'src/compression/'
      }
    },*/
    clean: ['dist/'],
    connect: {
      dev: {
        options: {
          port: 3001,
          base: '.',
          keepalive: true
        }
      },
      test: {
        options: {
          port: 3000,
          base: '.'
        }
      }
    },
    /*'saucelabs-mocha': {
      all: {
        options: {
          username: 'openpgpjs',
          key: '60ffb656-2346-4b77-81f3-bc435ff4c103',
          urls: ['http://127.0.0.1:3000/test/unittests.html'],
          build: process.env.TRAVIS_BUILD_ID,
          testname: 'Sauce Unit Test for openpgpjs',
          browsers: [browser_capabilities],
          public: "public",
          maxRetries: 3,
          throttled: 2,
          pollInterval: 4000,
          statusCheckAttempts: 200
        }
      },
    },*/
    watch: {
      src: {
        files: ['src/**/*.js'],
        tasks: ['browserify:openpgp', 'browserify:worker']
      },
      test: {
        files: ['test/*.js', 'test/crypto/**/*.js', 'test/general/**/*.js', 'test/worker/**/*.js'],
        tasks: ['browserify:unittests']
      }
    },
  });

  // Load the plugin(s)
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('set_version', function() {
    if (!version) {
      throw new Error('You must specify the version: "--release=1.0.0"');
    }

    patchFile({
      fileName: 'package.json',
      version: version
    });

    patchFile({
      fileName: 'npm-shrinkwrap.json',
      version: version
    });

    patchFile({
      fileName: 'bower.json',
      version: version
    });
  });

  function patchFile(options) {
    var path = './' + options.fileName,
      file = require(path);

    if (options.version) {
      file.version = options.version;
    }

    fs.writeFileSync(path, JSON.stringify(file, null, 2) + '\n');
  }

  // Build tasks
  // 'copy:zlib'
  grunt.registerTask('default', ['clean', 'browserify', 'replace', 'uglify']);
  grunt.registerTask('documentation', ['jsdoc']);
  // Test/Dev tasks
  grunt.registerTask('test', ['jshint', 'jscs', 'mochaTest']);
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
  //grunt.registerTask('saucelabs', ['default', 'copy:browsertest', 'connect:test', 'saucelabs-mocha']);

};
