'use strict';

var my_app = angular.module('app', ['ngAnimate', 'ngTouch', 'ngSanitize', 'ui.bootstrap']);

(function(window, document, undefined) {
var valInArr = function(val, arr) {
  for (var c = arr.length - 1; c >= 0; c--)
    if (arr[c] == val)
      return true;
  return false;
};


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


my_app.factory('$entries', ['$socket', '$sce', function($socket, $sce)
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

  this.listenForSessions = function(callback)
  {
    $socket.on('sessions', function(data) {
      var replies = [];
      for (var i = data.replies[0].length - 1; i >= 0; i--)
      {
        if (!valInArr(data.replies[0][i].split('[_-_]')[1], replies))
          replies.push(data.replies[0][i].split('[_-_]')[1]);
      };
      callback(replies);
    });
  };
  this.askForSessionsIn = function(course)
  {
    $socket.emit('redis_command', {chan:'sessions', redis:['LRANGE', course, 0, -1]});
  };


  this.listenForChapters = function(callback)
  {
    $socket.on('chapters', function(data) {
      callback(data.replies[0]);
    });
  };
  this.askForChaptersIn = function(session)
  {
    $socket.emit('redis_command', {chan:'chapters', redis:['HKEYS', session]});
  };


  this.listenForParts = function(callback)
  {
    $socket.on('parts', function(data) {
      var replies = [];
      data.replies[0] = JSON.parse(data.replies[0]);
      for (var i = data.replies[0].length - 1; i >= 0; i--) {
        var keys = Object.keys(data.replies[0][i].videos)
        for (var c = keys.length - 1; c >= 0; c--) {
          if (typeof data.replies[0][i].videos[keys[c]] == "string")
            data.replies[0][i].videos[keys[c]] = $sce.trustAsResourceUrl(data.replies[0][i].videos[keys[c]]);
        };
      };
      callback(data.replies[0]);
    });
  };
  this.askForPartsIn = function(session, chapter)
  {
    $socket.emit('redis_command', {chan:'parts', redis:['HGET', session, chapter]});
  }
  this.savePartsIn = function(course, chapter, parts, callback)
  {
    $socket.emit('redis_command', {chan:'nowere', redis:['HSET', course, chapter, JSON.stringify(parts)]}, callback);
  };


  this.deleteKey = function(key)
  {
    $socket.emit('redis_command', {chan:'nowere', redis:['DEL', key]});
  };
  this.deleteListCourse = function()
  {
    this.deleteKey('france-universite-numerique-mooc');
  };



  return this;
}]);


my_app.controller('coursesController', ['$scope', '$entries', function($scope, $entries)
{
  $scope.courses = [];
  $scope.sessions = [];
  $scope.chapters = [];
  $scope.parts = [];
  $entries.listenForCourses(function(courses) {
    for (var i = courses.length - 1; i >= 0; i--) {
      if (!valInArr($scope.courses, courses[i]))
        $scope.courses.push(courses[i]);
    };
  });
  $entries.listenForSessions(function(sessions) {
    for (var i = sessions.length - 1; i >= 0; i--) {
      if (!valInArr($scope.sessions, sessions[i]))
        $scope.sessions.push(sessions[i]);
    };
  });
  $entries.listenForChapters(function(chapters) {
    for (var i = chapters.length - 1; i >= 0; i--) {
      if (!valInArr($scope.chapters, chapters[i]))
        $scope.chapters.push(chapters[i]);
    };
  });
  $entries.listenForParts(function(parts) {
    $scope.parts = parts;
  });
  $entries.askForCourses();

  $scope.refreshListCourses = function() {
    $scope.courses = [];
    $scope.sessions = [];
    $scope.chapters = [];
    $scope.parts = [];
    $entries.askForCourses();
  };
  $scope.getSessions = function(course) {
    $scope.sessions = [];
    $scope.chapters = [];
    $scope.parts = [];
    $entries.askForSessionsIn(course);
  }
  $scope.getChapters = function(session) {
    $scope.chapters = [];
    $scope.parts = [];
    $entries.askForChaptersIn($scope.course+'[_-_]'+session);
  }
  $scope.getParts = function(chapter) {
    $entries.askForPartsIn($scope.course+'[_-_]'+$scope.session, chapter);
  }




  $scope.deletePart = function(index) {
    $scope.parts.splice(index, 1);
    $entries.savePartsIn($scope.course+'[_-_]'+$scope.session, $scope.chapter, $scope.parts, function() {
      $entries.askForPartsIn($scope.course+'[_-_]'+$scope.session, $scope.chapter);
    });
  }

  $scope.deleteList = function(index) {
    for (var i = $scope.sessions.length - 1; i >= 0; i--) {
      $entries.deleteKey($scope.course+'[_-_]'+$scope.sessions[i]);
      $scope.sessions.splice(i, 1);
    };
    for (var i = $scope.courses.length - 1; i >= 0; i--) {
      $entries.deleteKey($scope.courses[i]);
      $scope.courses.splice(i, 1);
    };
    $entries.deleteListCourse();
    $scope.chapters = [];
    $scope.parts = [];
  }

}]);


})(window, window.angular);
