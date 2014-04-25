'use strict';

var my_app = angular.module('app', ['ngAnimate', 'ngTouch', 'ngSanitize', 'ui.bootstrap']);

(function(window, document, undefined) {


my_app.factory('$socket', ['$rootScope', function ($rootScope) {
  if (typeof io != 'undefined')
    var socket = io.connect();
  return {
    connect: function (url) {
      if (typeof io != 'undefined')
        socket = io.connect(url);
    },
    on: function (eventName, callback) {
      if (typeof socket != 'undefined')
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
    },
    emit: function (eventName, data, callback) {
      if (typeof socket != 'undefined')
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
    }
  };
}]);


my_app.factory('$entries', ['$socket', function($socket)
{
  this.listenForCourses = function(callback)
  {
    $socket.on('courses', function(data) {
      var replies = [];
      for (var i = data.replies[0].length - 1; i >= 0; i--)
      {
        var found = false;
        for (var c = replies.length - 1; c >= 0; c--)
          if (replies[c] == data.replies[0][i])
            found = true;
        if (found == false)
          replies.push(data.replies[0][i]);
      };
      callback(replies);
    });
  };
  this.askForCourses = function()
  {
    $socket.emit('redis_command', {chan:'courses', redis:['LRANGE', 'france-universite-numerique-mooc', 0, -1]});
  };



  this.listenForChapters = function(callback)
  {
    $socket.on('chapters', function(data) {
      var replies = [];
      for (var i = data.replies[0].length - 1; i >= 0; i--)
      {
        var found = false;
        for (var c = replies.length - 1; c >= 0; c--)
          if (replies[c] == data.replies[0][i])
            found = true;
        if (found == false)
          replies.push(data.replies[0][i]);
      };
      callback(replies);
    });
  };
  this.askForChaptersIn = function(course)
  {
    $socket.emit('redis_command', {chan:'chapters', redis:['HKEYS', course]});
  };




  this.listenForParts = function(callback)
  {
    $socket.on('parts', function(data) {
      var replies = [];
      data.replies[0] = JSON.parse(data.replies[0]);
      callback(data.replies[0]);
    });
  };
  this.askForPartsIn = function(course, chapter)
  {
    $socket.emit('redis_command', {chan:'parts', redis:['HGET', course, chapter]});
  };
  this.savePartsIn = function(course, chapter, parts, callback)
  {
    $socket.emit('redis_command', {chan:'nowere', redis:['HSET', course, chapter, JSON.stringify(parts)]}, callback);
  };



  return this;
}]);



// my_app.directive('watchPublicationState', ['$socket', function($socket) {
//   return {
//     restrict: 'A',
//     // priority: 0,
//     scope: {
//       onDelete: '@',
//       pubid: '@watchPublicationState'
//     },
//     link: function ($scope, $element, $attrs)
//     {
//       var socketHandler = function() {
//         $socket.emit('register', {channels:[$scope.pubid]});
//         $socket.on('message', function(msg)
//         {
//           msg = JSON.parse(msg);
//           if (('news' in msg) && ('type' in msg.news) && (msg.news.type == 'pubdeletion'))
//             //Temporary solution
//             //To fix
//             window.location.replace($scope.onDelete);
//         });
//       };
//       socketHandler();
//       $socket.on('connect', socketHandler);
//     }
//   };
// }]);





my_app.controller('coursesController', ['$scope', '$entries', function($scope, $entries)
{
  var current_course = null;
  var current_chapter = null;


  $scope.courses = [];
  $scope.chapters = [];
  $scope.parts = [];
  $entries.listenForCourses(function(courses) {
    for (var i = courses.length - 1; i >= 0; i--) {
      var found = false;
      for (var c = $scope.courses.length - 1; c >= 0; c--)
        if ($scope.courses[c].name == courses[i])
          found = true
      if (found == false)
        $scope.courses.push({active:false, name:courses[i]});
    };
  });
  $entries.listenForChapters(function(chapters) {
    for (var i = chapters.length - 1; i >= 0; i--) {
      var found = false;
      for (var c = $scope.chapters.length - 1; c >= 0; c--)
        if ($scope.chapters[c].name == chapters[i])
          found = true
      if (found == false)
        $scope.chapters.push({active:false, name:chapters[i]});
    };
  });
  $entries.listenForParts(function(parts) {
    $scope.parts = parts;
  });
  $entries.askForCourses();

  $scope.refreshListCourses = function() {
    $entries.askForCourses();
  };

  $scope.selectCourse = function(course) {
    for (var i = $scope.courses.length - 1; i >= 0; i--) {
      $scope.courses[i].active = false;
    };
    course.active = true;
    if (current_course != course.name)
      $scope.chapters = [];
    $entries.askForChaptersIn(course.name);
    current_course = course.name;
  }

  $scope.selectChapter = function(chapter) {
    for (var i = $scope.chapters.length - 1; i >= 0; i--) {
      $scope.chapters[i].active = false;
    };
    chapter.active = true;
    $entries.askForPartsIn(current_course, chapter.name);
    current_chapter = chapter.name;
  }

  $scope.deletePart = function(index) {
    $scope.parts.splice(index, 1);
    $entries.savePartsIn(current_course, current_chapter, $scope.parts, function()
    {
      $entries.askForPartsIn(current_course, current_chapter);
    });
  }

}]);




// my_app.controller('chaptersController', ['$scope', '$entries', function($scope, $entries)
// {

// }]);




// my_app.controller('partsController', ['$scope', '$entries', '$socket', function($scope, $entries, $socket)
// {
// }]);



})(window, window.angular);
