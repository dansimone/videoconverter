'use strict';

var app = angular.module('app', ['angularFileUpload']);

/**
 * Angular controller that handles:
 * 1) File upload
 */
app.controller('AppController', ['$scope', '$http', 'FileUploader', function ($scope, $http, FileUploader) {
  $scope.name = 'world';

  $scope.videos = [];

  $scope.init = function () {
    $scope.refreshVideoStatuses();
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
    return $scope.videos.filter(function checkAdult(video) {
      return video.status == "PENDING";
    });
  };

  $scope.getInProgressVideos = function () {
    return $scope.videos.filter(function checkAdult(video) {
      return video.status == "IN_PROGRESS";
    });
  };

  $scope.getCompletedVideos = function () {
    return $scope.videos.filter(function checkAdult(video) {
      return video.status == "COMPLETED";
    });
  };

  var uploader = $scope.uploader = new FileUploader({
    url: 'upload?id=bar111'
  });

  // FILTERS

  uploader.filters.push({
    name: 'customFilter',
    fn: function (item /*{File|FileLikeObject}*/, options) {
      return this.queue.length < 10;
    }
  });

  // CALLBACKS

  uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
    console.info('onWhenAddingFileFailed', item, filter, options);
  };
  uploader.onAfterAddingFile = function (fileItem) {
    console.info('onAfterAddingFile', fileItem);
  };
  uploader.onAfterAddingAll = function (addedFileItems) {
    console.info('onAfterAddingAll', addedFileItems);
  };
  uploader.onBeforeUploadItem = function (item) {
    console.info('onBeforeUploadItem', item);
  };
  uploader.onProgressItem = function (fileItem, progress) {
    console.info('onProgressItem', fileItem, progress);
  };
  uploader.onProgressAll = function (progress) {
    console.info('onProgressAll', progress);
  };
  uploader.onSuccessItem = function (fileItem, response, status, headers) {
    console.info('onSuccessItem', fileItem, response, status, headers);
  };
  uploader.onErrorItem = function (fileItem, response, status, headers) {
    console.info('onErrorItem', fileItem, response, status, headers);
  };
  uploader.onCancelItem = function (fileItem, response, status, headers) {
    console.info('onCancelItem', fileItem, response, status, headers);
  };
  uploader.onCompleteItem = function (fileItem, response, status, headers) {
    console.info('onCompleteItem', fileItem, response, status, headers);
  };
  uploader.onCompleteAll = function () {
    console.info('onCompleteAll');
  };

  console.info('uploader', uploader);
/*
  refreshVideoStatuses22 = function () {
    $http.get('/videos')
      .success(function (data, status, headers, config) {
        $scope.videos = data;
        //console.log("Video data: " + JSON.stringify(data));
      })
      .error(function (data, status, header, config) {
        console.log();
      });
  };
  */
}]);
