'use strict';

var mongoose = require('mongoose'),
    superagent = require('superagent'),
    Thing = mongoose.model('Thing'),
    HubotPlugin = mongoose.model('HubotPlugin'),
    Client = require('npm-pkginfo'),
    async = require('async');

var client = new Client({
  cacheStore: new Client.stores.memory()
});

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
  var re = /(https?:\/\/[^\s)]+)/g;
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

function getNPMName(npmjsUrl) {
  var results = /([\w-]*)$/.exec(npmjsUrl);
  return results && results[1];
}

function getNPMInfo(issue, callback) {
  client.get(issue.npmName, function (err, npmInfo) {
    if (err) {
      //callback();
      console.log('ERROR getting npmInfo for ' + issue.npmName);
    } else {
      console.log('got npmInfo', issue.npmName + ': ' + npmInfo.description);
      callback(issue, npmInfo);
    }
  });
}

function saveHubotPlugin(issue, npmInfo) {
  // create document
  var plugin = new HubotPlugin({
    name: npmInfo.name,
    avatarUrl: issue.user.avatar_url,
    githubUrl: issue.githubUrl,
    npmjsUrl: issue.npmjsUrl,
    npmjsDescription: npmInfo.description,

    homepage: npmInfo.homepage,
    keywords: npmInfo.keywords
  });
  plugin.save(function() {
    //console.log('created ' + plugin.name);
  });
}

function gatherPluginData(issues) {
  for (var i=0; i < issues.length; i++) {
    var issue = issues[i];
    // collect the parts to build the document from
    var issueBodyURLs = parseUrls(issue.body);
    issue.npmjsUrl = issueBodyURLs.npmjs;
    issue.githubUrl = issueBodyURLs.github;
    issue.npmName = getNPMName(issue.npmjsUrl || issue.githubUrl);

    getNPMInfo(issue, saveHubotPlugin);
  }
}

/*function batchSaveToMongo(plugins, res) {
  HubotPlugin.create(plugins, function(err) {
    if (err) {
      console.error(err);
    } else {
      res.json({status: 'success', records: plugins.length});
    }
  });
}*/

exports.loadHubotPlugins = function(req, res) {
  superagent.get('https://api.github.com/repos/hubot-scripts/packages/issues')
  .end(function(error, response) {
    HubotPlugin.remove({}, function(error) {
      if (error) {
        console.log("ERROR REMOVING");
      }
      /*var plugins = [];
      async.series([
        gatherPluginData(response.body, plugins),
        console.log('plugins', plugins.length),
        batchSaveToMongo(plugins, res)
      ]);*/
      gatherPluginData(response.body);
      res.json({status: 'OK'});
    });
  });
};
