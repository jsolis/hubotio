'use strict';

var mongoose = require('mongoose'),
    superagent = require('superagent'),
    Thing = mongoose.model('Thing'),
    HubotPlugin = mongoose.model('HubotPlugin'),
    Client = require('npm-pkginfo'),
    async = require('async'),
    moment = require('moment');

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
      console.log('ERROR: skipping getting npmInfo for ' + issue.npmName);
    } else {
      //console.log('got npmInfo', issue.npmName + ': ' + npmInfo.description);
      callback(issue, npmInfo);
    }
  });
}

function saveHubotPlugin(issue, npmInfo) {
  var created = issue.created_at ? moment(issue.created_at).toDate() : '';
  var updated = issue.updated_at ? moment(issue.updated_at).toDate() : '';
  var closed = issue.closed_at ? moment(issue.closed_at).toDate() : '';
  
  var options = {upsert: true, multi: false};
  var doc = {
    name: npmInfo.name,
    avatarUrl: issue.user.avatar_url,
    githubUrl: issue.githubUrl,
    npmjsUrl: issue.npmjsUrl,
    npmjsDescription: npmInfo.description || '',
    homepage: npmInfo.homepage || '',
    keywords: npmInfo.keywords || [],
    created: created,
    updated: updated,
    closed: closed
  };
  HubotPlugin.update({name: npmInfo.name}, doc, options, function (err, numberAffected, raw) {
    //console.log('updated ' + numberAffected);
  });
}

function gatherPluginData(issues) {
  for (var i=0; i < issues.length; i++) {
    var issue = issues[i];
    // collect the parts to build the document from
    var issueBodyURLs = parseUrls(issue.body);
    issue.npmjsUrl = issueBodyURLs.npmjs || '';
    issue.githubUrl = issueBodyURLs.github || '';
    issue.npmName = getNPMName(issue.npmjsUrl || issue.githubUrl);

    getNPMInfo(issue, saveHubotPlugin);
  }
}

// deletes all first - just for testing
function loadAllHubotPlugins() {
  superagent.get('https://api.github.com/repos/hubot-scripts/packages/issues')
  .end(function(error, response) {
    HubotPlugin.remove({}, function(error) {
      if (error) {
        console.log("ERROR REMOVING");
      }
      gatherPluginData(response.body);
    });
  });
}

function deleteOnePlugin() {
  HubotPlugin.remove({name: 'hubot-sentimental'}, function(error) {
    if (error) {
      console.log("ERROR REMOVING");
    }
    // print out how many records we have after removing that one
    HubotPlugin.find(function(err, plugins) {
      console.log('# plugins after delete: ' + plugins.length);
    });
  });
}

function loadNewHubotPlugins() {
  superagent.get('https://api.github.com/repos/hubot-scripts/packages/issues')
  .end(function(error, response) {
    gatherPluginData(response.body);
  });
}

exports.loadAllHubotPlugins = function(req, res) {
  loadAllHubotPlugins();
  //deleteOnePlugin();
  res.json({status: 'OK'});
};

exports.hubotPlugins = function(req, res) {
  async.parallel([
    function(callback) {
      HubotPlugin.find(function(err, plugins) {
        if (!err) {
          console.log('# plugins: ' + plugins.length);
          callback();
          return res.json(plugins);
        } else {
          callback(err);
        }
      });
    },
    function(callback) {
      console.log('running loadNewHubotPlugins');
      loadNewHubotPlugins();
      callback();
    }
  ], function(err) {
    //if (err) return next(err);
    if (err) res.send(err);

    console.log('finally called');
  });
};
