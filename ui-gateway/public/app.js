// Define the `phonecatApp` module
var phonecatApp = angular.module('phonecatApp', ['ngFileUpload']);


// Define the `VideoListController` controller on the `phonecatApp` module
phonecatApp.controller('VideoListController', function VideoListController($scope, $http) {
  $scope.videos = [];
  refreshVideoStatuses = function () {
    $http.get('/videos')
      .success(function (data, status, headers, config) {
        $scope.videos = data;
        //console.log("Video data: " + JSON.stringify(data));
      })
      .error(function (data, status, header, config) {
        console.log();
      });
  };

  $scope.init = function () {
    refreshVideoStatuses()
  };

  $scope.refreshVideoStatuses = function () {
    refreshVideoStatuses()
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

  $scope.name = 'world';
});

phonecatApp.controller('MyCtrl', ['$scope', 'Upload', function ($scope, Upload) {
  // upload later on form submit or something similar
  $scope.submit = function() {
    console.log("AAAAAA");
    if ($scope.form.file.$valid && $scope.file) {
      $scope.upload($scope.file);
    }
  };

  // upload on file select or drop
  $scope.upload = function (file) {
    Upload.upload({
      url: 'upload/url',
      data: {file: file, 'username': $scope.username}
    }).then(function (resp) {
      console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    }, function (evt) {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
  };
  // for multiple files:
  $scope.uploadFiles = function (files) {
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        //Upload.upload({..., data: {file: files[i]}, ...})...;
      }
      // or send them all together for HTML5 browsers:
      //Upload.upload({..., data: {file: files}, ...})...;
    }
  }
}]);