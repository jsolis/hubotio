'use strict';

var mongoose = require('mongoose'),
    superagent = require('superagent'),
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

function parseUrls(body) {
  var re = /(https?:\/\/[^\s]+)/g;
  var matches;
  var urls = {};
  while ((matches = re.exec(body)) !== null) {
    var url = matches[1];
    if (url.indexOf('github') > -1) {
      urls.github = url;
    } else if (url.indexOf('npmjs') > -1) {
      urls.npmjs = url;
    }
  }
  return urls;
}

exports.loadHubotPlugins = function(req, res) {
  superagent.get('https://api.github.com/repos/hubot-scripts/packages/issues')
  .end(function(error, response) {
    HubotPlugin.remove({}, function(error) {
      if (error) {
        console.log("ERROR REMOVING");
      }
      var plugins = [];
      var issues = response.body;
      for (var i=0; i < issues.length; i++) {
        var issue = issues[i];
        var issueBodyURLs = parseUrls(issue.body);
        var npmjsUrl = issueBodyURLs.npmjs;
        var githubUrl = issueBodyURLs.github;
        var plugin = new HubotPlugin({
          name: issue.title,
          avatarUrl: issue.user.avatar_url,
          githubUrl: githubUrl,
          npmjsUrl: npmjsUrl,
          npmjsDescription: 'This does stuff and stuff',
          foobar: 'is not in schema'
        });
        plugins.push(plugin);
      }
      HubotPlugin.create(plugins, function(err) {
        if (err) console.error(err);
      });
      res.json({status: 'success', records: issues.length});
    });
  });
};
