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

phonecatApp.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

phonecatApp.service('fileUpload', ['$http', function ($http) {
  this.uploadFileToUrl = function(file, uploadUrl){
    var fd = new FormData();
    fd.append('file', file);
    $http.post(uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
      .success(function(){
      })
      .error(function(){
      });
  }
}]);

phonecatApp.controller('VideoListController', ['$scope', 'fileUpload', function($scope, fileUpload){

  $scope.uploadFile = function(){
    var file = $scope.myFile;
    console.log('file is ' );
    console.dir(file);
    var uploadUrl = "/fileUpload";
    fileUpload.uploadFileToUrl(file, uploadUrl);
  };

}]);