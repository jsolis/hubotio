'use strict';

angular.module('hubotioApp')
  .controller('HomeCtrl', function ($scope, $http) {
    $http.get('/api/hubotPlugins').success(function(plugins) {
      console.log(plugins);
      $scope.plugins = plugins;
    });
  });
