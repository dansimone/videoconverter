// Define the `phonecatApp` module
var phonecatApp = angular.module('phonecatApp', []);


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