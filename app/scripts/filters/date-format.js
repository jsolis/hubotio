'use strict';

angular.module('hubotioApp')
  .filter('dateFormat', function () {
    return function(input) {
      var formatted = moment(input).fromNow();
      return formatted;
    };
  });
