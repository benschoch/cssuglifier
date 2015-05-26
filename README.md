# grunt-cssuglifier

> The best Grunt plugin ever.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cssuglifier --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cssuglifier');
```

## The "cssuglifier" task

### Overview
In your project's Gruntfile, add a section named `cssuglifier` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cssuglifier: {
    options: {
      keepBemModifier: true,
      bemModifierPrefix: '--',

      createJsonMapFile: true,
      jsonMapFilePath: 'cssuglifier_mapping.json',

      createJSMapFile: 1,
      jsMapFilePath: this.name + '_mapping.js',
      jsMapVarDefinition: 'var cssuglifierMap'
    },
    files: {
      src: '**/*.css',
      dest: 'result'
    }
  },
});
```

### Options

#### files.src
Type: `String|Array`

The path to the source files for uglification.
You can define an array of files

```
...
  files: {
    src: ['src/a.css', 'src/b.css', 'src/c.css'],
    ...
  }
...
```

or you can define as single file

```
...
  files: {
    src: 'src/foo.css',
    ...
  }
...
```

or you can use globbing as well

```
...
  files: {
    src: 'src/**/*.css',
    ...
  }
...
```

#### files.dest
Type: `String`

The target for saving the uglified CSS files.
If this is empty the source files will be *overwritten*.
Subdirectories from the source folder will be preserved.


#### options.keepBemModifier
Type: `Bool`
Default value: `true`

This is for BEM class name usage but actually you can define any kind of suffix that will be preserved if found at the end of a class name.

#### options.bemModifierPrefix
Type: `String`
Default value: `'--'`

Separator between the BEM modifier as described above and the actual class name.

#### options.createJsonMapFile
Type: `Bool`
Default value: `true`

This will create a JSON file that contains an object with the mapping of the transformed class names.
The format is:
```
{
  'actualLongClassName': 'ugly'
}
```

#### options.jsonMapFilePath
Type: `String`
Default value: `'cssuglifier_mapping.json'`

The path to the JSON file described above.

#### options.createJSMapFile
Type: `Boold`
Default value: `true`

Creates a '.js' file similar to the JSON file but the JSON object is wrapped by a variable assignment. This way the result file can be combined into an uglifyJS task or something similar.

#### options.jsMapFilePath
Type: `String`
Default value: `'cssuglifier_mapping.js'`

The path to the JS-file described above.

#### options.jsMapVarDefinition
Type: `String`
Default value: `'var cssuglifierMap'`

The result by default is:
```
var cssuglifierMap = {'actualLongClassName': 'ugly'};
```

You can also change this to an object property assignment.
For example a change to `'myApp.cssMapping'` would result in:
```
myApp.cssMapping = {'actualLongClassName': 'ugly'};
```

### Usage Examples


```js
grunt.initConfig({
  cssuglifier: {
    options: {},
    files: {
      src: 'src/**/*.css',
      dest: 'dest'
    }
  },
});
```

