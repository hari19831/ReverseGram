(function() {
  var ApplicationMenu, EventEmitter, Menu, app, ipc, ipcMain, path, season, _, _ref;

  _ref = require('electron'), Menu = _ref.Menu, app = _ref.app, ipcMain = _ref.ipcMain;

  path = require('path');

  season = require('season');

  _ = require('underscore-plus');

  EventEmitter = require('events').EventEmitter;

  ipc = ipcMain;

  module.exports = ApplicationMenu = (function() {
    _.extend(ApplicationMenu.prototype, EventEmitter.prototype);

    function ApplicationMenu(options) {
      var menuJson, template;
      this.version = options.version, this.devMode = options.devMode;
      menuJson = season.resolve(path.join(process.resourcesPath, 'app.asar', 'menus', "" + process.platform + ".json"));
      template = season.readFileSync(menuJson);
      this.substituteVersion(template.menu);
      this.template = this.translateTemplate(template.menu, options.pkg);
      global.application.autoUpdateManager.on('state-changed', (function(_this) {
        return function(state) {
          console.log("ApplicationMenu: autoUpdateManager:state-changed == " + state);
          return _this.showUpdateMenuItem(state);
        };
      })(this));
    }

    ApplicationMenu.prototype.attachToWindow = function(window) {
      var item;
      this.menu = Menu.buildFromTemplate(_.deepClone(this.template));
      Menu.setApplicationMenu(this.menu);
      if (this.devMode) {
        item = _.find(this.flattenMenuItems(this.menu), function(_arg) {
          var label;
          label = _arg.label;
          return label === 'Toggle Developer Tools';
        });
        if (item != null) {
          return item.visible = true;
        }
      }
    };

    ApplicationMenu.prototype.wireUpMenu = function(menu, command) {
      return menu.click = (function(_this) {
        return function() {
          return _this.emit(command);
        };
      })(this);
    };

    ApplicationMenu.prototype.translateTemplate = function(template, pkgJson) {
      var emitter, item, _i, _len;
      emitter = this.emit;
      for (_i = 0, _len = template.length; _i < _len; _i++) {
        item = template[_i];
        if (item.metadata == null) {
          item.metadata = {};
        }
        if (item.label) {
          item.label = (_.template(item.label))(pkgJson);
        }
        if (item.command) {
          this.wireUpMenu(item, item.command);
        }
        if (item.submenu) {
          this.translateTemplate(item.submenu, pkgJson);
        }
      }
      return template;
    };

    ApplicationMenu.prototype.acceleratorForCommand = function(command, keystrokesByCommand) {
      var firstKeystroke, key, keys, modifiers, _ref1;
      firstKeystroke = (_ref1 = keystrokesByCommand[command]) != null ? _ref1[0] : void 0;
      if (!firstKeystroke) {
        return null;
      }
      modifiers = firstKeystroke.split('-');
      key = modifiers.pop();
      modifiers = modifiers.map(function(modifier) {
        return modifier.replace(/shift/ig, "Shift").replace(/cmd/ig, "Command").replace(/ctrl/ig, "Ctrl").replace(/alt/ig, "Alt");
      });
      keys = modifiers.concat([key.toUpperCase()]);
      return keys.join("+");
    };

    ApplicationMenu.prototype.flattenMenuItems = function(menu) {
      var index, item, items, _ref1;
      items = [];
      _ref1 = menu.items || {};
      for (index in _ref1) {
        item = _ref1[index];
        items.push(item);
        if (item.submenu) {
          items = items.concat(this.flattenMenuItems(item.submenu));
        }
      }
      return items;
    };

    ApplicationMenu.prototype.flattenMenuTemplate = function(template) {
      var item, items, _i, _len;
      items = [];
      for (_i = 0, _len = template.length; _i < _len; _i++) {
        item = template[_i];
        items.push(item);
        if (item.submenu) {
          items = items.concat(this.flattenMenuTemplate(item.submenu));
        }
      }
      return items;
    };

    ApplicationMenu.prototype.substituteVersion = function(template) {
      var item;
      if ((item = _.find(this.flattenMenuTemplate(template), function(_arg) {
        var label;
        label = _arg.label;
        return label === 'VERSION';
      }))) {
        return item.label = "Version " + this.version;
      }
    };

    ApplicationMenu.prototype.showUpdateMenuItem = function(state) {
      var checkForUpdateItem, checkingForUpdateItem, downloadingUpdateItem, installUpdateItem;
      checkForUpdateItem = _.find(this.flattenMenuItems(this.menu), function(_arg) {
        var label;
        label = _arg.label;
        return label === 'Check for Update';
      });
      checkingForUpdateItem = _.find(this.flattenMenuItems(this.menu), function(_arg) {
        var label;
        label = _arg.label;
        return label === 'Checking for Update';
      });
      downloadingUpdateItem = _.find(this.flattenMenuItems(this.menu), function(_arg) {
        var label;
        label = _arg.label;
        return label === 'Downloading Update';
      });
      installUpdateItem = _.find(this.flattenMenuItems(this.menu), function(_arg) {
        var label;
        label = _arg.label;
        return label === 'Restart and Install Update';
      });
      if (!((checkForUpdateItem != null) && (checkingForUpdateItem != null) && (downloadingUpdateItem != null) && (installUpdateItem != null))) {
        return;
      }
      checkForUpdateItem.visible = false;
      checkingForUpdateItem.visible = false;
      downloadingUpdateItem.visible = false;
      installUpdateItem.visible = false;
      switch (state) {
        case 'idle':
        case 'error':
        case 'no-update-available':
          return checkForUpdateItem.visible = true;
        case 'checking':
          return checkingForUpdateItem.visible = true;
        case 'downloading':
          return downloadingUpdateItem.visible = true;
        case 'update-available':
          return installUpdateItem.visible = true;
      }
    };

    return ApplicationMenu;

  })();

}).call(this);
