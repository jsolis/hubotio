'use strict';

angular.module('hubotioApp')
  .controller('HomeCtrl', function ($scope, $http) {
    $http.get('https://api.github.com/repos/hubot-scripts/packages/issues').success(function(issues) {
      console.log(issues);
      for (var i=0; i < issues.length; i++) {
        var issue = issues[i];
        var body = issue.body;
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
        issue.urls = urls;
      }
      $scope.issues = issues;
    });
  });
