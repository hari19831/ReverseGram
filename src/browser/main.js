(function() {
  var Application, BrowserWindow, SingleInstance, app, fs, nslog, parseCommandLine, path, setupCoffeeScript, spawn, start, url, _ref;

  _ref = require('electron'), app = _ref.app, BrowserWindow = _ref.BrowserWindow;

  url = require('url');

  path = require('path');

  fs = require('fs-plus');

  spawn = require('child_process').spawn;

  Application = require('./application');

  SingleInstance = require('./single-instance');

  nslog = console.log;

  global.shellStartTime = Date.now();

  process.on('uncaughtException', function(error) {
    if (error == null) {
      error = {};
    }
    if (error.message != null) {
      nslog(error.message);
    }
    if (error.stack != null) {
      return nslog(error.stack);
    }
  });

  parseCommandLine = function() {
    var args, devMode, exitWhenDone, filesToUpload, help, logFile, openDevTools, packageDirectoryPath, packageManifest, packageManifestPath, resourcePath, specDirectory, test, version, yargs;
    version = app.getVersion();
    yargs = require('yargs').alias('d', 'dev').boolean('d').describe('d', 'Run in development mode.').alias('h', 'help').boolean('h').describe('h', 'Print this usage message.').alias('l', 'log-file').string('l').describe('l', 'Log all output to file.').alias('r', 'resource-path').string('r').describe('r', 'Set the path to the App source directory and enable dev-mode.').alias('s', 'spec-directory').string('s').describe('s', 'Set the directory from which to run package specs (default: Atom\'s spec directory).').alias('t', 'test').boolean('t').describe('t', 'Run the specified specs and exit with error code on failures.').alias('v', 'version').boolean('v').describe('v', 'Print the version.').alias('o', 'opendevtools').boolean('o').describe('o', 'Automatically open Developer Tools');
    args = yargs.parse(process.argv.slice(1));
    process.stdout.write(JSON.stringify(args) + "\n");
    if (args.help) {
      help = "";
      yargs.showHelp(function(s) {
        return help += s;
      });
      process.stdout.write(help + "\n");
      process.exit(0);
    }
    if (args.version) {
      process.stdout.write("" + version + "\n");
      process.exit(0);
    }
    devMode = args['dev'];
    test = args['test'];
    exitWhenDone = test;
    specDirectory = args['spec-directory'];
    logFile = args['log-file'];
    openDevTools = args.opendevtools;
    filesToUpload = args._;
    if (args['resource-path']) {
      devMode = true;
      resourcePath = args['resource-path'];
    } else {
      if (specDirectory != null) {
        packageDirectoryPath = path.join(specDirectory, '..');
        packageManifestPath = path.join(packageDirectoryPath, 'package.json');
        if (fs.statSyncNoException(packageManifestPath)) {
          try {
            packageManifest = JSON.parse(fs.readFileSync(packageManifestPath));
            if (packageManifest.name === 'atom') {
              resourcePath = packageDirectoryPath;
            }
          } catch (_error) {}
        }
      }
      if (devMode) {
        if (resourcePath == null) {
          resourcePath = global.devResourcePath;
        }
      }
    }
    if (!fs.statSyncNoException(resourcePath)) {
      resourcePath = path.join(process.resourcesPath, 'app.asar');
    }
    resourcePath = path.resolve(resourcePath);
    return {
      resourcePath: resourcePath,
      version: version,
      devMode: devMode,
      test: test,
      exitWhenDone: exitWhenDone,
      specDirectory: specDirectory,
      logFile: logFile,
      openDevTools: openDevTools,
      filesToUpload: filesToUpload
    };
  };

  setupCoffeeScript = function() {
    var CoffeeScript;
    CoffeeScript = null;
    return require.extensions['.coffee'] = function(module, filePath) {
      var coffee, js;
      if (CoffeeScript == null) {
        CoffeeScript = require('coffee-script');
      }
      coffee = fs.readFileSync(filePath, 'utf8');
      js = CoffeeScript.compile(coffee, {
        filename: filePath
      });
      return module._compile(js, filePath);
    };
  };

  start = function() {
    var SquirrelUpdate, addFilesToUpload, args, squirrelCommand;
    if (process.platform === 'win32') {
      SquirrelUpdate = require('./squirrel-update');
      squirrelCommand = process.argv[1];
      if (SquirrelUpdate.handleStartupEvent(app, squirrelCommand)) {
        return;
      }
    }
    app.commandLine.appendSwitch('js-flags', '--harmony');
    args = parseCommandLine();
    addFilesToUpload = function(event, pathToUpload) {
      console.log("BROWSER:addFilesToUpload => " + pathToUpload);
      event.preventDefault();
      return args.filesToUpload.push(pathToUpload);
    };
    app.on('open-file', addFilesToUpload);
    if (args.devMode) {
      app.commandLine.appendSwitch('remote-debugging-port', '8315');
    }
    return app.on('ready', function() {
      var cwd, _ref1;
      setupCoffeeScript();
      require('../babel').register();
      app.removeListener('open-file', addFilesToUpload);
      cwd = ((_ref1 = args.executedFrom) != null ? _ref1.toString() : void 0) || process.cwd();
      args.filesToUpload = args.filesToUpload.map(function(fileToUpload) {
        var normalizedPath;
        normalizedPath = fs.normalize(fileToUpload);
        if (cwd) {
          return path.resolve(cwd, normalizedPath);
        } else {
          return path.resolve(pathToOpen);
        }
      });
      console.log("filesToUpload is " + (JSON.stringify(args.filesToUpload)));
      if (args.devMode) {
        require(path.join(args.resourcePath, 'src', 'coffee-cache')).register();
        Application = require(path.join(args.resourcePath, 'src', 'browser', 'application'));
      } else {
        Application = require('./application');
      }
      SingleInstance.open(args, function() {
        return new Application(args);
      });
      if (!args.test) {
        return console.log("App load time: " + (Date.now() - global.shellStartTime) + "ms");
      }
    });
  };

  start();

}).call(this);
