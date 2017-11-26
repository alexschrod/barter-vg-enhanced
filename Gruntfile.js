/* 
 * Copyright (C) 2017 Alexander Krivács Schrøder <alexschrod@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global module, require */

let resolve = require('rollup-plugin-node-resolve');
let commonJs = require('rollup-plugin-commonjs');

let licenseBanner = require('./licenseBanner');
let userScriptBanner = require('./userScriptBanner');

let baseFileName = 'barter-vg-enhancer';

module.exports = function (grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			css: {
				files: [
					'**/*.sass',
					'**/*.scss'
				],
				tasks: ['build']
			},
			js: {
				files: [
					'assets/js/*.js',
					'Gruntfile.js'
				],
				tasks: ['build']
			},
			templates: {
				files: [
					'templates/*.*'
				],
				tasks: ['build']
			}
		},
		compass: {
			dist: {
				options: {
					sassDir: 'assets/sass',
					cssDir: 'assets/generated',
					outputStyle: 'compressed'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				verbose: true
			},
			all: ['Gruntfile.js', 'assets/js/*.js']
		},
		jscs: {
			src: 'assets/js/*.js',
			options: {
				config: '.jscsrc',
				fix: false
			}
		},
		concat: {
			options: {
				separator: '',
				stripBanners: true
			},
			variables: {
				src: [
					'assets/templates/variables.pre.template',
					'assets/generated/css.variables.pass1.js',
					'assets/generated/angular.variables.pass1.js',
					'assets/templates/variables.post.template'
				],
				dest: 'assets/generated/variables.pass2.js'
			},
			source: {
				options: {
					banner: `${licenseBanner}\n${userScriptBanner}\n`
				},
				src: [
					'assets/generated/rollup.js'
				],
				dest: `dist/${baseFileName}.user.js`
			}
		},
		uglify: {
			options: {
				banner: licenseBanner + '\n' + userScriptBanner
			},
			target: {
				files: {
					[`dist/${baseFileName}.min.user.js`]: [`dist/${baseFileName}.user.js`]
				}
			}
		},
		filesToJavascript: {
			css: {
				options: {
					inputFilesFolder: 'assets/generated',
					inputFileExtension: 'css',
					outputBaseFile: 'assets/templates/variables.empty.template',
					outputBaseFileVariable: 'variables.css',
					outputFile: 'assets/generated/css.variables.pass1.js'
				}
			},
			angularTemplates: {
				options: {
					inputFilesFolder: 'assets/generated',
					inputFileExtension: 'html',
					outputBaseFile: 'assets/templates/variables.empty.template',
					outputBaseFileVariable: 'variables.angular',
					outputFile: 'assets/generated/angular.variables.pass1.js'
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					//'assets/generated/output.html': 'assets/templates/input.html'
				}
			}
		},
		rollup: {
			options: {
				plugins: [
					resolve({
						browser: true
					}),
					commonJs()
				]
			},
			main: {
				files: {
					'assets/generated/rollup.js': 'assets/js/app.js'
				}
			}
		}
	});

	// Load the Grunt tasks.
	require('load-grunt-tasks')(grunt);

	// Register the tasks.
	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', [
		'jshint',             // Check for lint
		'jscs',               // Check code style
		//'compass',            // Compile CSS
		//'htmlmin',            // Minify HTML templates
		'filesToJavascript',  // Convert HTML templates to JS variables
		'concat:variables',   // Create finished variable.pass2.js file
		'rollup:main',        // Rollup all the javascript files into one
		'concat:source',      // Add banner to rollup result
		'uglify',             // Minify the javascript
	]);
};
