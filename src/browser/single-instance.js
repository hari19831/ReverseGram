(function() {
  var Application, DefaultSocketPath, SingleInstance, app, fs, net, os, path;

  app = require('electron').app;

  fs = require('fs');

  net = require('net');

  os = require('os');

  path = require('path');

  Application = require('./application');

  DefaultSocketPath = process.platform === 'win32' ? '\\\\.\\pipe\\grammarly-desktop-editor-sock' : path.join(os.tmpdir(), "grammarly-desktop-editor-" + process.env.USER + ".sock");

  module.exports = SingleInstance = (function() {
    function SingleInstance() {}

    SingleInstance.socketPath = DefaultSocketPath;

    SingleInstance.open = function(options, createApplication) {
      var client;
      if (createApplication == null) {
        createApplication = function() {
          return new Application(options);
        };
      }
      if ((process.platform !== 'win32' && !fs.existsSync(this.socketPath)) || options.test) {
        createApplication();
        return;
      }
      client = net.connect({
        path: this.socketPath
      }, function() {
        return client.write(JSON.stringify(options), function() {
          client.end();
          return app.quit();
        });
      });
      return client.on('error', function() {
        return createApplication();
      });
    };

    SingleInstance.listenForArgumentsFromNewProcess = function(onNewProcessRun) {
      var server;
      console.log("SingleInstance:listenForArgumentsFromNewProcess, " + this.socketPath);
      this.deleteSocketFile();
      server = net.createServer(function(connection) {
        console.log("SingleInstance:listenForArgumentsFromNewProcess > created server");
        return connection.on('data', function(data) {
          console.log("SingleInstance:listenForArgumentsFromNewProcess !> received DATA");
          return typeof onNewProcessRun === "function" ? onNewProcessRun(JSON.parse(data)) : void 0;
        });
      });
      server.listen(this.socketPath);
      return server.on('error', function(error) {
        return console.error("SingleInstance:listenForArgumentsFromNewProcess !!! ERROR: " + error);
      });
    };

    SingleInstance.deleteSocketFile = function() {
      var error;
      if (process.platform === 'win32') {
        return;
      }
      if (fs.existsSync(this.socketPath)) {
        try {
          return fs.unlinkSync(this.socketPath);
        } catch (_error) {
          error = _error;
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }
    };

    return SingleInstance;

  })();

}).call(this);
