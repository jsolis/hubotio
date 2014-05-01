'use strict';

angular.module('hubotioApp')
  .controller('HomeCtrl', function ($scope, $http) {
    $http.get('https://api.github.com/repos/hubot-scripts/packages/issues').success(function(issues) {
      $scope.issues = issues;
    });
  });
