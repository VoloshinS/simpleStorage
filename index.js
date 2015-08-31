/*global localStorage: false, escape: false, unescape: false */
var moment = require('moment');
var _ = require('underscore');

require('./SimpleInheritance');

var Storage = Class.extend({
  init: function(opts){
    this.name = opts.name || 'SimpleBrowserStorage';
    this.expiresTime = opts.expiresTime || 10;
    this.expired = false;

    var state   = this.getState() || {},
        expires = state.expires,
        willExpire = {expires: moment()._d};

    if (!expires || moment().diff(expires, 'minutes') > this.expiresTime) {
      this.setState(willExpire);
      this.expired = true;
    } else {
      this.setState(state);
      this.expired = false;
    }
  },
  stateIsExpired: function() {
    return this.expired;
  }
});

var LocalStorage = Storage.extend({
  init: function(opts) {
    this._super(opts);
  },
  setState: function(value) {
    localStorage.setItem(this.name, JSON.stringify(value));
  },
  getState: function() {
    return JSON.parse(localStorage.getItem(this.name));
  }
});

var CookieStorage = Storage.extend({
  init: function(opts) {
    this._super(opts);
  },
  setState: function(value) {
    var d = new Date();
    var days100 = 100 * 24 * 60 * 60 * 1000;
    d.setTime(d.getTime() + days100);
    var expires = "expires=" + d.toUTCString();
    var cookie = [this.name, '=', escape(JSON.stringify(value)), ';', expires].join('');
    document.cookie = cookie;
  },
  getState: function() {
    var result = document.cookie.match(new RegExp(this.name + '=([^;]+)'));
    return result ? JSON.parse(unescape(result[1])) : result;
  }
});

var hasLocalStorage = (function() {
  try {
    var mod = 'test';
    localStorage.setItem(mod, mod);
    localStorage.removeItem(mod);
    return true;
  } catch (exception) {
    return false;
  }
}());

module.exports = function(opts) {
  if (hasLocalStorage) {
    return new LocalStorage(opts);
  } else {
    return new CookieStorage(opts);
  }
};
