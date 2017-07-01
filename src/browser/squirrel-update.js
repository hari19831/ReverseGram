(function() {
  var ChildProcess, addToRegistry, appFolder, createShortcuts, deleteFromRegistry, desktopShortcutFileName, exeName, fileKeyPath, fs, installContextMenu, installUriScheme, path, regPath, removeShortcuts, rootAtomFolder, spawn, spawnReg, spawnUpdate, system32Path, uninstallContextMenu, uninstallUriScheme, updateDotExe, updateShortcuts, uriKeyPath;

  ChildProcess = require('child_process');

  fs = require('fs-plus');

  path = require('path');

  appFolder = path.resolve(process.execPath, '..');

  rootAtomFolder = path.resolve(appFolder, '..');

  updateDotExe = path.join(rootAtomFolder, 'Update.exe');

  exeName = path.basename(process.execPath);

  desktopShortcutFileName = 'Grammarly.lnk';

  if (process.env.SystemRoot) {
    system32Path = path.join(process.env.SystemRoot, 'System32');
    regPath = path.join(system32Path, 'reg.exe');
  } else {
    regPath = 'reg.exe';
  }

  fileKeyPath = 'HKCU\\Software\\Classes\\*\\shell\\Grammarly';

  uriKeyPath = 'HKCU\\Software\\Classes\\grammarly';

  spawn = function(command, args, callback) {
    var error, spawnedProcess, stdout;
    stdout = '';
    try {
      spawnedProcess = ChildProcess.spawn(command, args);
    } catch (_error) {
      error = _error;
      process.nextTick(function() {
        return typeof callback === "function" ? callback(error, stdout) : void 0;
      });
      return;
    }
    spawnedProcess.stdout.on('data', function(data) {
      return stdout += data;
    });
    error = null;
    spawnedProcess.on('error', function(processError) {
      return error != null ? error : error = processError;
    });
    return spawnedProcess.on('close', function(code, signal) {
      if (code !== 0) {
        if (error == null) {
          error = new Error("Command failed: " + (signal != null ? signal : code));
        }
      }
      if (error != null) {
        if (error.code == null) {
          error.code = code;
        }
      }
      if (error != null) {
        if (error.stdout == null) {
          error.stdout = stdout;
        }
      }
      return typeof callback === "function" ? callback(error, stdout) : void 0;
    });
  };

  spawnUpdate = function(args, callback) {
    return spawn(updateDotExe, args, callback);
  };

  spawnReg = function(args, callback) {
    return spawn(regPath, args, callback);
  };

  addToRegistry = function(args, callback) {
    args.unshift('add');
    args.push('/f');
    return spawnReg(args, callback);
  };

  deleteFromRegistry = function(keyPath, callback) {
    return spawnReg(['delete', keyPath, '/f'], callback);
  };

  installContextMenu = function(callback) {
    var installMenu;
    installMenu = function(keyPath, arg, callback) {
      var args;
      args = [keyPath, '/ve', '/d', 'Import to Grammarly'];
      return addToRegistry(args, function() {
        args = [keyPath, '/v', 'Icon', '/d', process.execPath];
        return addToRegistry(args, function() {
          args = ["" + keyPath + "\\command", '/ve', '/d', "" + process.execPath + " \"" + arg + "\""];
          return addToRegistry(args, callback);
        });
      });
    };
    return installMenu(fileKeyPath, '%1', callback);
  };

  uninstallContextMenu = function(callback) {
    return deleteFromRegistry(fileKeyPath, callback);
  };

  installUriScheme = function(callback) {
    var args;
    args = [uriKeyPath, '/ve', '/d', 'URL:Grammarly Protocol'];
    return addToRegistry(args, function() {
      args = [uriKeyPath, '/v', 'URL Protocol', '/d', ''];
      return addToRegistry(args, function() {
        args = ["" + uriKeyPath + "\\DefaultIcon", '/ve', '/d', process.execPath];
        return addToRegistry(args, function() {
          args = ["" + uriKeyPath + "\\shell", '/ve', '/d', ''];
          return addToRegistry(args, function() {
            args = ["" + uriKeyPath + "\\shell\\open", '/ve', '/d', ''];
            return addToRegistry(args, function() {
              args = ["" + uriKeyPath + "\\shell\\open\\command", '/ve', '/d', process.execPath];
              return addToRegistry(args, callback);
            });
          });
        });
      });
    });
  };

  uninstallUriScheme = function(callback) {
    return deleteFromRegistry(uriKeyPath, callback);
  };

  createShortcuts = function(callback) {
    return spawnUpdate(['--createShortcut', exeName], callback);
  };

  updateShortcuts = function(callback) {
    var desktopShortcutPath, homeDirectory;
    if (homeDirectory = fs.getHomeDirectory()) {
      desktopShortcutPath = path.join(homeDirectory, 'Desktop', desktopShortcutFileName);
      return fs.exists(desktopShortcutPath, function(desktopShortcutExists) {
        return createShortcuts(function() {
          if (desktopShortcutExists) {
            return callback();
          } else {
            return fs.unlink(desktopShortcutPath, callback);
          }
        });
      });
    } else {
      return createShortcuts(callback);
    }
  };

  removeShortcuts = function(callback) {
    return spawnUpdate(['--removeShortcut', exeName], callback);
  };

  exports.spawn = spawnUpdate;

  exports.existsSync = function() {
    return fs.existsSync(updateDotExe);
  };

  exports.handleStartupEvent = function(app, squirrelCommand) {
    switch (squirrelCommand) {
      case '--squirrel-install':
        createShortcuts(function() {
          return installContextMenu(function() {
            return installUriScheme(function() {
              return app.quit();
            });
          });
        });
        return true;
      case '--squirrel-updated':
        updateShortcuts(function() {
          return installContextMenu(function() {
            return installUriScheme(function() {
              return app.quit();
            });
          });
        });
        return true;
      case '--squirrel-uninstall':
        removeShortcuts(function() {
          return uninstallContextMenu(function() {
            return uninstallUriScheme(function() {
              return app.quit();
            });
          });
        });
        return true;
      case '--squirrel-obsolete':
        app.quit();
        return true;
      default:
        return false;
    }
  };

}).call(this);
