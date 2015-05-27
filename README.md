# grunt-cssuglifier

> This plugin minifies the CSS class names in a given CSS file. Additionally a JSON mapping file and a JS mapping file can be created automatically for usage within other grunt tasks or other parts of your application.

> By default this plugin preserves class name suffixes so it can be used for easier handling BEM style modifiers.

> Example input:

```css
.block {
    display: block;
}

.block--inactive {
    display: none
}

.block__element {
    display: none;
    border: 1px solid #000;
}

.block__element--active {
    border: 1px solid #f00;
}
```

> Example output:

```css
.b5 {
    display: block;
}

.b5--inactive {
    display: none
}

.c28 {
    display: none;
    border: 1px solid #000;
}

.c28--active {
    border: 1px solid #f00;
}
```


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
      classPrefix: '\\.',
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

#### options.classPrefix
Type: `String`
Default value: `'\\.'`

If you prefer to use the script for something else than classes (for example IDs) this is what you have to change.
Please note the *double* backslash in front of the dot in the default value. As this string will be passed to RegExp, it has to be escaped.

An example usage to replace class names & IDs:
```
...
options: {
  ...
  'classPrefix': '[\\.#]+'
  ...
}
...
```

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
...
options: {
  ...
  'actualLongClassName': 'ugly'
  ...
}
...
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

