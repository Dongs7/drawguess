/**
 * Created by Yang on 15/8/3.
 */
var myApp = angular.module('play',[]);

myApp.controller('play', ['$scope', function($scope) {
    $scope.greeting = 'Hola!';
}]);