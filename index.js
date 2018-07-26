'use strict';

const fs = require('fs');
const path  = require('path');
const uglify = require('uglify-js');
const exec = require('child_process').exec;

const nodeEnv = process.env.NODE_ENV;

module.exports = setup;
module.exports.concatenateJs = concatenateJs;
module.exports.concatenateJsAndSave = concatenateJsAndSave;
module.exports.concatenateJsAndSaveMultiple = concatenateJsAndSaveMultiple;
module.exports.setupCleanupOnExit = setupCleanupOnExit;


/*
  OPTIONS: {
    config
  }
*/

function setup(options) {
  return function(req, res) {
    const jsName = req.params.jsName;
    const type = jsName.replace(/\.[0-9a-z]+$/i, '');
    const module = options.config[type];

    if (!module) {
      return res.status(404).send('Not found');
    }

    concatenateJs(module).then(code => {
      if (nodeEnv === 'production') {
        // Set Cache-Control header to one day
        res.header('Cache-Control', 'public, max-age=86400');
      }

      res.contentType('text/javascript').send(code);
    }).catch(console.error);
  };
}


function concatenateJs(module) {
  return new Promise(resolve => {
    let code = '';

    module.forEach(jsFile => {
      const extension = path.extname(jsFile);
      const baseName = path.basename(jsFile, extension);
      const contents = extension === '.json' ? 'var ' + baseName + ' = ' + fs.readFileSync(jsFile, 'utf8') + ';' : fs.readFileSync(jsFile, 'utf8');
      code += contents;
    });

    resolve(code);
  }).catch(console.error);
}


/*
  OPTIONS: {
    originPath,
    destinationPath,
    file,
    minify (default: true),
    config
  }
*/

function concatenateJsAndSave(options) {
  const file = options.file;
  const type = file.replace(/\.[0-9a-z]+$/i, '');
  const jsPath = path.join(options.originPath, file);

  if (typeof options.minify === undefined) {
    options.minify = true;
  }

  return concatenateJs(options.config[type]).then(code => {
    if (options.minify) {
      const minified = uglify.minify(code).code;
      code = typeof minified !== 'undefined' ? minified : code;
    }

    return code;
  }).then(code => {
    return new Promise((resolve, reject) => {
      fs.writeFile(jsPath, code, error => {
        if (error) {
          reject(error);
        }

        resolve(file);
      });
    }).catch(error => {
      throw new Error(error);
    });
  }).catch(console.error);
}


/*
  OPTIONS: {
    originPath,
    destinationPath,
    files (must match the types in the configuration!),
    minify (default: true),
    config
  }
*/

function concatenateJsAndSaveMultiple(options) {
  if (typeof options.minify === undefined) {
    options.minify = true;
  }

  return new Promise((resolve, reject) => {
    options.files.forEach(toConcatenateFile => {
      const newOptions = {
        originPath: options.originPath,
        destinationPath: options.destinationPath,
        file: toConcatenateFile,
        minify: options.minify,
        config: options.config
      };

      concatenateJsAndSave(newOptions).then(jsFile => {
        console.log('Created', jsFile);
      }).catch(error => {
        reject(error);
      });
    });

    resolve();
  }).catch(error => {
    throw new Error(error);
  });
}


/*
  OPTIONS: {
    path,
    files
  }
*/

function setupCleanupOnExit(options) {
  console.log('Exiting, running JS cleanup');

  options.files.forEach(file => {
    const jsFile = path.join(options.path, file);

    exec(`rm -r ${jsFile}`, function(error) {
      if (error) {
        throw new Error(error);
      }

      console.log('Deleted', file);
    });
  });
}
