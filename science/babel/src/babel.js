var app = angular.module('app', []);

app.controller('ctrl', ['$scope', ctrl]);

function ctrl($scope) {
    $scope.derp = 'something';
    $scope.capitalize = input => input.toUpperCase();
    $scope.templatize = (name = "mergen") => `OMG ${name}!
        a multiline
        template, this is cray cray`;
    $scope.text = $scope.templatize();

    function playingWithScope() {
        const x = 5;
        let y = 'derp';
        {
           let y = 'not derp';
           console.log(y);
        }
        console.log(y)
        // x = 6;
    }
    playingWithScope();
    var words = 'this is an array of words but some words like words are repeated';

    $scope.set = new Set(words.split(' '));
    console.log($scope.set)
}

