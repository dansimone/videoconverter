/**
 * Angular JS controller for ui-gateway frontend.
 */

'use strict';
var app = angular.module('app', ['angularFileUpload']);

/**
 * Our controller that handles:
 * 1) File upload
 */
app.controller('AppController', ['$scope', '$http', 'FileUploader', function ($scope, $http, FileUploader) {
  $scope.name = 'world';

  $scope.videos = [];

  $scope.init = function () {
    $scope.refreshVideoStatuses();
  };

  //
  // File upload stuff
  //
  var uploader = $scope.uploader = new FileUploader({
    url: 'upload'
  });
  // Filter so that only video files are accepted
  uploader.filters.push({
    name: 'customFilter',
    fn: function(item) {
      return /video.*/.test(item.type);
    }
  });
  // Upload callbacks
  uploader.onAfterAddingAll = function (addedFileItems) {
    for (var i = 0; i < addedFileItems.length; i++) {
      addedFileItems[i].url += '?name=' + addedFileItems[i].file.name;
    }
    uploader.uploadAll();
  };
  uploader.onCompleteItem = function (fileItem, response, status, headers) {
    console.info('onCompleteItem', fileItem, response, status, headers);
    uploader.removeFromQueue(fileItem);
  };
  uploader.onCancelItem = function(fileItem, response, status, headers) {
    console.info('onCancelItem', fileItem, response, status, headers);
  };
  // Upload helper functions
  $scope.uploadQueueEmpty = function () {
    return $scope.uploader.queue.length == 0;
  };

  $scope.refreshVideoStatuses = function () {
    $http.get('/videos')
      .success(function (data, status, headers, config) {
        $scope.videos = data;
        //console.log("Video data: " + JSON.stringify(data));
      })
      .error(function (data, status, header, config) {
        console.log();
      });
  };

  $scope.getPendingVideos = function () {
    return $scope.videos.filter(function filter(video) {
      return video.status == "PENDING";
    });
  };
  $scope.getInProgressVideos = function () {
    return $scope.videos.filter(function filter(video) {
      return video.status == "IN_PROGRESS";
    });
  };
  $scope.getCompletedVideos = function () {
    return $scope.videos.filter(function filter(video) {
      return video.status == "COMPLETED";
    });
  };
}]);
