'use strict';

var mongoose = require('mongoose'),
    Thing = mongoose.model('Thing'),
    HubotPlugin = mongoose.model('HubotPlugin');

/**
 * Get awesome things
 */
exports.awesomeThings = function(req, res) {
  return Thing.find(function (err, things) {
    if (!err) {
      return res.json(things);
    } else {
      return res.send(err);
    }
  });
};

exports.hubotPlugins = function(req, res) {
  /*HubotPlugin.create({
    name : 'Dummy Plugin',
    avatarUrl : 'http://dummyavatar.com/',
    npmjsUrl: 'http://npmjs.org/dummymodule',
    npmjsDescription: 'This does stuff and stuff'
  });*/
  var pluginsResp = HubotPlugin.find(function(err, plugins) {
    if (!err) {
      return res.json(plugins);
    } else {
      return res.send(err);
    }
  });
  //console.log('plugins found', pluginsResp);
  return pluginsResp;
};