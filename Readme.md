# concatenate-js-middleware

> A module to concatenate JavaScript files on-the-fly or to save them to disk.

*This module is still in its infancy. More documentation and features will be added as it matures.*

## Requirements

This module is tested with Node.js 8 and 9. It might work with Node.js 6 or 7, but is not tested.

## Install

```
npm install --save concatenate-js-middleware
```

## Config

In order to concatenate your JavaScript files, you will need to configure which JavaScript files will be concatenated into which files. In the example below, we have two final JavaScript files: "libs.js" and "scripts.js":

- "libs.js" contains the files "../../node_modules/jquery/dist/jquery.min.js" and "other/lib.js".
- "script.js" contains the files "../public/js/homepage.js" and "../public/js/anotherFile.js".

**jsConfig.js**

```js
'use strict';

const path = require('path');

const libs = [
  '../../node_modules/jquery/dist/jquery.min.js',
  'other/lib.js'
];

const scripts = [
  '../public/js/homepage.js',
  '../public/js/anotherFile.js'
];

module.exports = {
  libs: libs.map(file => {
    return path.join(__dirname, file);
  }),
  scripts: scripts.map(file => {
    return path.join(__dirname, file);
  })
};
```

## Usage

### For on-the-fly compiling

```js
const concatenateJs = require('concatenate-js-middleware');
const jsConfig = require('./config/jsConfig.js');

app.use('/js/:jsName', concatenateJs(jsConfig));
```

### For concatenating and saving as static JavaScript file

```js
const concatenateJs = require('concatenate-js-middleware');
const jsConfig = require('./config/jsConfig.js');

concatenateJs.concatenateJsAndSaveMultiple({
  originPath: path.join(__dirname, 'public/js/'),
  destinationPath: path.join(__dirname, 'public/js/'),
  files: ['libs.js'],
  minify: true,
  config: jsConfig
}).then(...).catch(...);
```


## API

### concatenateJs()

Returns the concatenated JavaScript as a string.

```js
const concatenateJs = require('concatenate-js-middleware');
const jsConfig = require('./config/jsConfig.js');

const jsString = concatenateJs.concatenateJs(jsConfig['libs']).then(...).catch(...);
```

### concatenateJsAndSave()

Concatenates the given JavaScript file.

```js
const concatenateJs = require('concatenate-js-middleware');
const jsConfig = require('./config/jsConfig.js');

concatenateJs.concatenateJsAndSave({
  originPath: path.join(__dirname, 'public/js/'),
  destinationPath: path.join(__dirname, 'public/js/'),
  file: 'libs.js',
  minify: true,
  config: jsConfig
}).then(...).catch(...);
```


### concatenateJsAndSaveMultiple()

Concatenates multiple JavaScript files defined in the "files" option.

```js
const concatenateJs = require('concatenate-js-middleware');
const jsConfig = require('./config/jsConfig.js');

concatenateJs.concatenateJsAndSaveMultiple({
  originPath: path.join(__dirname, 'public/js/'),
  destinationPath: path.join(__dirname, 'public/js/'),
  files: ['libs.js'],
  minify: true,
  config: jsConfig
}).then(...).catch(...);
```

### setupCleanupOnExit()

Deletes the passed directory when the app is exited. The idea is to pass the directory where your compiled CSS files are, so that they can be deleted when the app is exited and recompiled when the app starts.

```js
const concatenateJs = require('concatenate-js-middleware');

process.on('SIGINT', () => {
  try {
    concatenateJs.setupCleanupOnExit({
      path: path.join(__dirname, 'public/js/'),
      files: ['libs.js']
    });
    process.exit(0);
  }
  catch(error) {
    process.exit(1);
  }
});
```


## Maintainer

This modules is maintained by Alex Seifert ([Website](https://www.alexseifert.com), [Github](https://github.com/eiskalteschatten)).
