(function() {
  module.exports = {
    grammarly: {
      mainNoWWW: 'https://grammarly.com',
      main: 'https://www.grammarly.com/',
      subscribe: 'https://www.grammarly.com/subscribe',
      resetpassword: 'https://www.grammarly.com/resetpassword',
      upgrade: 'https://www.grammarly.com/upgrade',
      mailto: 'support@grammarly.com',
      signin: 'https://www.grammarly.com/signin',
      signup: 'https://www.grammarly.com/signup?page=free&utm_medium=internal&utm_source=signupHook&utm_campaign=desktop_app'
    },
    support: {
      mainPage: 'https://support.grammarly.com',
      connectionTroubleshooting: 'https://support.grammarly.com/hc/en-us/articles/115000090331--Unexpected-error-has-occurred-while-connecting-to-Grammarly'
    },
    update: {
      windows: 'https://update.grammarly.com/desktop-editor/windows',
      osx: 'https://update.grammarly.com/desktop-editor/osx'
    },
    authUrl: 'https://auth.grammarly.com/v3',
    doxUrl: 'https://dox.grammarly.com',
    editorUrl: 'https://app.grammarly.com/',
    cookie: {
      url: 'https://grammarly.com',
      domain: '.grammarly.com'
    },
    regexp: {
      appGrammarly: /app\.grammarly\.com/,
      httpsAppGrammarly: /https?:\/\/app\.grammarly\.com/,
      doxGetId: /^https:\/\/dox\.grammarly\.com\/documents\/(\d+)\/download.*$/i,
      upgrade: /^https:\/\/www\.grammarly\.com\/upgrade\?.*$/i,
      subscribe: /https?:\/\/www\.grammarly\.com\/subscribe/
    }
  };

}).call(this);
