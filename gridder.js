angular
.module('app', ['ngStorage'])
.controller('gridder', ['$scope', '$localStorage', function($scope, $localStorage) {
  // for grid sizing and spacing (in pixels)
  $scope.vOffset = 19;
  $scope.hOffset = 19;
  $scope.spacing = 17.7;

  $scope.clear = clear;
  $scope.markRegion = markRegion;
  setUpBoard();

  return;

  // Controller-dependent local functions

  function clear() {
    delete $localStorage.grid;
    setUpBoard();
  }

  /**
   * set up the board at $scope.grid if there's a version in local storage use that
   * link the $scope version to the localstorage version
   * also generate regions
   */
  function setUpBoard() {
    if ($localStorage.grid) {
      fixMyMistake($localStorage);
      $scope.grid = $localStorage.grid;
    }
    else {
      $scope.grid = getStates();
      $localStorage.grid = $scope.grid;
    }
    $scope.regions = generateRegionLookup($scope.grid);
  }
}]);

/**
 * given a cell (with a .state and a .region number) and the array of regions
 * set each cell within the .region region to the nextState
 * @warning mutates cell .region numbers
 */
function markRegion(cell, regions) {
  var region = cell && cell.region;
  var newState = cell && cell.state && nextState(cell.state);
  if (!newState || Number(region) !== region || !regions[region]) {
    return;
  }
  regions[region].forEach(function(cell) {
    cell.state = newState;
  });

  function nextState(state) {
    return ({
      blank: 'redDot',
      redDot: 'filled',
      filled: 'blank',
    }[state] || state );
  }
}

/**
 * Generate a region array where each element is at the appropriate region number and contains
 * all the cells that are in that region
 */
function generateRegionLookup(states) {
  var regions = [];
  states.forEach(function(row) {
    row.forEach(function(cell) {
     var region = cell && cell.region;
     if (Number(region) !== region) {
       return;
     }
     regions[region] = regions[region] || [];
     regions[region].push(cell);
    });
  });
  return regions;
}

/**
 * I made a mistake in combining two small regions, this fixes it even for people that were already solving
 */
function fixMyMistake($localStorage) {
    if ($localStorage.grid[6][4].region === 176) {
      $localStorage.grid[6][4].region = 200;
    }
    if ($localStorage.grid[6][5].region === 176) {
      $localStorage.grid[6][5].region = 200;
    }
}

// generateStates is not necessary for this puzzle any more as I generated region data
/*
var numColumns = 31;
var numRows = 17;
function generateStates(x, y) {
  var states = [];
  while (x >= 0) {
    states[x] = [];
    var y_copy = y;
    while (y_copy >= 0) {
      states[x][y_copy] = {state: 'blank', region: null};
      y_copy--;
    }
    x--;
  }
  return states;
}
*/

// TODO put this data somewhere else
function getStates() {
  return [
    [
      {
        "state": "blank",
        "region": 0
      },
      {
        "state": "blank",
        "region": 0
      },
      {
        "state": "blank",
        "region": 0
      },
      {
        "state": "blank",
        "region": 1
      },
      {
        "state": "blank",
        "region": 1
      },
      {
        "state": "blank",
        "region": 2
      },
      {
        "state": "blank",
        "region": 2
      },
      {
        "state": "blank",
        "region": 3
      },
      {
        "state": "blank",
        "region": 4
      },
      {
        "state": "blank",
        "region": 5
      },
      {
        "state": "blank",
        "region": 5
      },
      {
        "state": "blank",
        "region": 5
      },
      {
        "state": "blank",
        "region": 6
      },
      {
        "state": "blank",
        "region": 6
      },
      {
        "state": "blank",
        "region": 7
      },
      {
        "state": "blank",
        "region": 8
      },
      {
        "state": "blank",
        "region": 9
      },
      {
        "state": "blank",
        "region": 9
      },
      {
        "state": "blank",
        "region": 10
      },
      {
        "state": "blank",
        "region": 10
      },
      {
        "state": "blank",
        "region": 11
      },
      {
        "state": "blank",
        "region": 12
      },
      {
        "state": "blank",
        "region": 13
      },
      {
        "state": "blank",
        "region": 13
      },
      {
        "state": "blank",
        "region": 13
      },
      {
        "state": "blank",
        "region": 14
      },
      {
        "state": "blank",
        "region": 14
      },
      {
        "state": "blank",
        "region": 15
      },
      {
        "state": "blank",
        "region": 16
      },
      {
        "state": "blank",
        "region": 16
      },
      {
        "state": "blank",
        "region": 16
      },
      {
        "state": "blank",
        "region": 17
      }
    ],
    [
      {
        "state": "blank",
        "region": 0
      },
      {
        "state": "blank",
        "region": 18
      },
      {
        "state": "blank",
        "region": 18
      },
      {
        "state": "blank",
        "region": 19
      },
      {
        "state": "blank",
        "region": 20
      },
      {
        "state": "blank",
        "region": 21
      },
      {
        "state": "blank",
        "region": 2
      },
      {
        "state": "blank",
        "region": 3
      },
      {
        "state": "blank",
        "region": 4
      },
      {
        "state": "blank",
        "region": 23
      },
      {
        "state": "blank",
        "region": 5
      },
      {
        "state": "blank",
        "region": 24
      },
      {
        "state": "blank",
        "region": 24
      },
      {
        "state": "blank",
        "region": 6
      },
      {
        "state": "blank",
        "region": 7
      },
      {
        "state": "blank",
        "region": 8
      },
      {
        "state": "blank",
        "region": 9
      },
      {
        "state": "blank",
        "region": 25
      },
      {
        "state": "blank",
        "region": 25
      },
      {
        "state": "blank",
        "region": 10
      },
      {
        "state": "blank",
        "region": 12
      },
      {
        "state": "blank",
        "region": 12
      },
      {
        "state": "blank",
        "region": 12
      },
      {
        "state": "blank",
        "region": 13
      },
      {
        "state": "blank",
        "region": 26
      },
      {
        "state": "blank",
        "region": 14
      },
      {
        "state": "blank",
        "region": 14
      },
      {
        "state": "blank",
        "region": 15
      },
      {
        "state": "blank",
        "region": 27
      },
      {
        "state": "blank",
        "region": 16
      },
      {
        "state": "blank",
        "region": 28
      },
      {
        "state": "blank",
        "region": 29
      }
    ],
    [
      {
        "state": "blank",
        "region": 0
      },
      {
        "state": "blank",
        "region": 30
      },
      {
        "state": "blank",
        "region": 18
      },
      {
        "state": "blank",
        "region": 19
      },
      {
        "state": "blank",
        "region": 21
      },
      {
        "state": "blank",
        "region": 21
      },
      {
        "state": "blank",
        "region": 3
      },
      {
        "state": "blank",
        "region": 3
      },
      {
        "state": "blank",
        "region": 22
      },
      {
        "state": "blank",
        "region": 23
      },
      {
        "state": "blank",
        "region": 5
      },
      {
        "state": "blank",
        "region": 31
      },
      {
        "state": "blank",
        "region": 31
      },
      {
        "state": "blank",
        "region": 32
      },
      {
        "state": "blank",
        "region": 32
      },
      {
        "state": "blank",
        "region": 8
      },
      {
        "state": "blank",
        "region": 8
      },
      {
        "state": "blank",
        "region": 33
      },
      {
        "state": "blank",
        "region": 33
      },
      {
        "state": "blank",
        "region": 10
      },
      {
        "state": "blank",
        "region": 12
      },
      {
        "state": "blank",
        "region": 34
      },
      {
        "state": "blank",
        "region": 26
      },
      {
        "state": "blank",
        "region": 26
      },
      {
        "state": "blank",
        "region": 26
      },
      {
        "state": "blank",
        "region": 35
      },
      {
        "state": "blank",
        "region": 14
      },
      {
        "state": "blank",
        "region": 36
      },
      {
        "state": "blank",
        "region": 27
      },
      {
        "state": "blank",
        "region": 37
      },
      {
        "state": "blank",
        "region": 29
      },
      {
        "state": "blank",
        "region": 29
      }
    ],
    [
      {
        "state": "blank",
        "region": 39
      },
      {
        "state": "blank",
        "region": 30
      },
      {
        "state": "blank",
        "region": 18
      },
      {
        "state": "blank",
        "region": 19
      },
      {
        "state": "blank",
        "region": 40
      },
      {
        "state": "blank",
        "region": 40
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 42
      },
      {
        "state": "blank",
        "region": 42
      },
      {
        "state": "blank",
        "region": 42
      },
      {
        "state": "blank",
        "region": 43
      },
      {
        "state": "blank",
        "region": 43
      },
      {
        "state": "blank",
        "region": 32
      },
      {
        "state": "blank",
        "region": 44
      },
      {
        "state": "blank",
        "region": 8
      },
      {
        "state": "blank",
        "region": 45
      },
      {
        "state": "blank",
        "region": 33
      },
      {
        "state": "blank",
        "region": 47
      },
      {
        "state": "blank",
        "region": 47
      },
      {
        "state": "blank",
        "region": 34
      },
      {
        "state": "blank",
        "region": 34
      },
      {
        "state": "blank",
        "region": 34
      },
      {
        "state": "blank",
        "region": 35
      },
      {
        "state": "blank",
        "region": 35
      },
      {
        "state": "blank",
        "region": 35
      },
      {
        "state": "blank",
        "region": 36
      },
      {
        "state": "blank",
        "region": 36
      },
      {
        "state": "blank",
        "region": 38
      },
      {
        "state": "blank",
        "region": 38
      },
      {
        "state": "blank",
        "region": 38
      }
    ],
    [
      {
        "state": "blank",
        "region": 39
      },
      {
        "state": "blank",
        "region": 30
      },
      {
        "state": "blank",
        "region": 30
      },
      {
        "state": "blank",
        "region": 175
      },
      {
        "state": "blank",
        "region": 176
      },
      {
        "state": "blank",
        "region": 177
      },
      {
        "state": "blank",
        "region": 178
      },
      {
        "state": "blank",
        "region": 178
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 179
      },
      {
        "state": "blank",
        "region": 179
      },
      {
        "state": "blank",
        "region": 181
      },
      {
        "state": "blank",
        "region": 145
      },
      {
        "state": "blank",
        "region": 43
      },
      {
        "state": "blank",
        "region": 43
      },
      {
        "state": "blank",
        "region": 44
      },
      {
        "state": "blank",
        "region": 44
      },
      {
        "state": "blank",
        "region": 46
      },
      {
        "state": "blank",
        "region": 46
      },
      {
        "state": "blank",
        "region": 47
      },
      {
        "state": "blank",
        "region": 47
      },
      {
        "state": "blank",
        "region": 48
      },
      {
        "state": "blank",
        "region": 48
      },
      {
        "state": "blank",
        "region": 49
      },
      {
        "state": "blank",
        "region": 49
      },
      {
        "state": "blank",
        "region": 35
      },
      {
        "state": "blank",
        "region": 50
      },
      {
        "state": "blank",
        "region": 51
      },
      {
        "state": "blank",
        "region": null
      },
      {
        "state": "blank",
        "region": 52
      },
      {
        "state": "blank",
        "region": 38
      },
      {
        "state": "blank",
        "region": 53
      }
    ],
    [
      {
        "state": "blank",
        "region": 101
      },
      {
        "state": "blank",
        "region": 102
      },
      {
        "state": "blank",
        "region": 30
      },
      {
        "state": "blank",
        "region": 175
      },
      {
        "state": "blank",
        "region": 176
      },
      {
        "state": "blank",
        "region": 177
      },
      {
        "state": "blank",
        "region": 178
      },
      {
        "state": "blank",
        "region": 178
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 180
      },
      {
        "state": "blank",
        "region": 180
      },
      {
        "state": "blank",
        "region": 182
      },
      {
        "state": "blank",
        "region": 145
      },
      {
        "state": "blank",
        "region": 145
      },
      {
        "state": "blank",
        "region": 145
      },
      {
        "state": "blank",
        "region": 144
      },
      {
        "state": "blank",
        "region": 44
      },
      {
        "state": "blank",
        "region": 46
      },
      {
        "state": "blank",
        "region": 142
      },
      {
        "state": "blank",
        "region": 125
      },
      {
        "state": "blank",
        "region": 47
      },
      {
        "state": "blank",
        "region": 124
      },
      {
        "state": "blank",
        "region": 124
      },
      {
        "state": "blank",
        "region": 123
      },
      {
        "state": "blank",
        "region": 50
      },
      {
        "state": "blank",
        "region": 50
      },
      {
        "state": "blank",
        "region": 50
      },
      {
        "state": "blank",
        "region": 51
      },
      {
        "state": "blank",
        "region": 56
      },
      {
        "state": "blank",
        "region": 56
      },
      {
        "state": "blank",
        "region": 54
      },
      {
        "state": "blank",
        "region": 53
      }
    ],
    [
      {
        "state": "blank",
        "region": 101
      },
      {
        "state": "blank",
        "region": 101
      },
      {
        "state": "blank",
        "region": 101
      },
      {
        "state": "blank",
        "region": 174
      },
      {
        "state": "blank",
        "region": 200
      },
      {
        "state": "blank",
        "region": 200
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 41
      },
      {
        "state": "blank",
        "region": 183
      },
      {
        "state": "blank",
        "region": 182
      },
      {
        "state": "blank",
        "region": 182
      },
      {
        "state": "blank",
        "region": 146
      },
      {
        "state": "blank",
        "region": null
      },
      {
        "state": "blank",
        "region": 143
      },
      {
        "state": "blank",
        "region": 143
      },
      {
        "state": "blank",
        "region": 142
      },
      {
        "state": "blank",
        "region": 142
      },
      {
        "state": "blank",
        "region": 142
      },
      {
        "state": "blank",
        "region": 125
      },
      {
        "state": "blank",
        "region": 125
      },
      {
        "state": "blank",
        "region": 125
      },
      {
        "state": "blank",
        "region": 123
      },
      {
        "state": "blank",
        "region": 123
      },
      {
        "state": "blank",
        "region": 123
      },
      {
        "state": "blank",
        "region": 122
      },
      {
        "state": "blank",
        "region": 50
      },
      {
        "state": "blank",
        "region": 51
      },
      {
        "state": "blank",
        "region": 58
      },
      {
        "state": "blank",
        "region": 56
      },
      {
        "state": "blank",
        "region": 56
      },
      {
        "state": "blank",
        "region": 55
      }
    ],
    [
      {
        "state": "blank",
        "region": 103
      },
      {
        "state": "blank",
        "region": 103
      },
      {
        "state": "blank",
        "region": 103
      },
      {
        "state": "blank",
        "region": 174
      },
      {
        "state": "blank",
        "region": 174
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 183
      },
      {
        "state": "blank",
        "region": 183
      },
      {
        "state": "blank",
        "region": 146
      },
      {
        "state": "blank",
        "region": 146
      },
      {
        "state": "blank",
        "region": 146
      },
      {
        "state": "blank",
        "region": 143
      },
      {
        "state": "blank",
        "region": 143
      },
      {
        "state": "blank",
        "region": 142
      },
      {
        "state": "blank",
        "region": 141
      },
      {
        "state": "blank",
        "region": 141
      },
      {
        "state": "blank",
        "region": 132
      },
      {
        "state": "blank",
        "region": 125
      },
      {
        "state": "blank",
        "region": 125
      },
      {
        "state": "blank",
        "region": 123
      },
      {
        "state": "blank",
        "region": 121
      },
      {
        "state": "blank",
        "region": 121
      },
      {
        "state": "blank",
        "region": 122
      },
      {
        "state": "blank",
        "region": 122
      },
      {
        "state": "blank",
        "region": 111
      },
      {
        "state": "blank",
        "region": 58
      },
      {
        "state": "blank",
        "region": 58
      },
      {
        "state": "blank",
        "region": 58
      },
      {
        "state": "blank",
        "region": 57
      }
    ],
    [
      {
        "state": "blank",
        "region": 104
      },
      {
        "state": "blank",
        "region": 103
      },
      {
        "state": "blank",
        "region": 172
      },
      {
        "state": "blank",
        "region": 173
      },
      {
        "state": "blank",
        "region": 174
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": null
      },
      {
        "state": "blank",
        "region": 167
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 183
      },
      {
        "state": "blank",
        "region": 165
      },
      {
        "state": "blank",
        "region": 147
      },
      {
        "state": "blank",
        "region": 147
      },
      {
        "state": "blank",
        "region": 146
      },
      {
        "state": "blank",
        "region": 138
      },
      {
        "state": "blank",
        "region": 140
      },
      {
        "state": "blank",
        "region": 140
      },
      {
        "state": "blank",
        "region": 141
      },
      {
        "state": "blank",
        "region": 132
      },
      {
        "state": "blank",
        "region": 132
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 126
      },
      {
        "state": "blank",
        "region": 121
      },
      {
        "state": "blank",
        "region": 121
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 112
      },
      {
        "state": "blank",
        "region": 112
      },
      {
        "state": "blank",
        "region": 111
      },
      {
        "state": "blank",
        "region": 110
      },
      {
        "state": "blank",
        "region": 60
      },
      {
        "state": "blank",
        "region": 57
      },
      {
        "state": "blank",
        "region": 57
      }
    ],
    [
      {
        "state": "blank",
        "region": 104
      },
      {
        "state": "blank",
        "region": 103
      },
      {
        "state": "blank",
        "region": 172
      },
      {
        "state": "blank",
        "region": 173
      },
      {
        "state": "blank",
        "region": 173
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 167
      },
      {
        "state": "blank",
        "region": 166
      },
      {
        "state": "blank",
        "region": 165
      },
      {
        "state": "blank",
        "region": 165
      },
      {
        "state": "blank",
        "region": 165
      },
      {
        "state": "blank",
        "region": 147
      },
      {
        "state": "blank",
        "region": 139
      },
      {
        "state": "blank",
        "region": 138
      },
      {
        "state": "blank",
        "region": 138
      },
      {
        "state": "blank",
        "region": 140
      },
      {
        "state": "blank",
        "region": 140
      },
      {
        "state": "blank",
        "region": 132
      },
      {
        "state": "blank",
        "region": 131
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 126
      },
      {
        "state": "blank",
        "region": 126
      },
      {
        "state": "blank",
        "region": 121
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": null
      },
      {
        "state": "blank",
        "region": 112
      },
      {
        "state": "blank",
        "region": 111
      },
      {
        "state": "blank",
        "region": 110
      },
      {
        "state": "blank",
        "region": 60
      },
      {
        "state": "blank",
        "region": 59
      },
      {
        "state": "blank",
        "region": 59
      }
    ],
    [
      {
        "state": "blank",
        "region": 105
      },
      {
        "state": "blank",
        "region": 107
      },
      {
        "state": "blank",
        "region": 172
      },
      {
        "state": "blank",
        "region": 172
      },
      {
        "state": "blank",
        "region": 169
      },
      {
        "state": "blank",
        "region": 169
      },
      {
        "state": "blank",
        "region": 168
      },
      {
        "state": "blank",
        "region": 163
      },
      {
        "state": "blank",
        "region": 163
      },
      {
        "state": "blank",
        "region": 163
      },
      {
        "state": "blank",
        "region": 165
      },
      {
        "state": "blank",
        "region": 147
      },
      {
        "state": "blank",
        "region": 147
      },
      {
        "state": "blank",
        "region": 139
      },
      {
        "state": "blank",
        "region": 139
      },
      {
        "state": "blank",
        "region": 138
      },
      {
        "state": "blank",
        "region": 134
      },
      {
        "state": "blank",
        "region": 133
      },
      {
        "state": "blank",
        "region": 133
      },
      {
        "state": "blank",
        "region": 131
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 120
      },
      {
        "state": "blank",
        "region": 114
      },
      {
        "state": "blank",
        "region": 112
      },
      {
        "state": "blank",
        "region": 109
      },
      {
        "state": "blank",
        "region": 99
      },
      {
        "state": "blank",
        "region": 98
      },
      {
        "state": "blank",
        "region": 97
      },
      {
        "state": "blank",
        "region": 59
      }
    ],
    [
      {
        "state": "blank",
        "region": 105
      },
      {
        "state": "blank",
        "region": 105
      },
      {
        "state": "blank",
        "region": 171
      },
      {
        "state": "blank",
        "region": 170
      },
      {
        "state": "blank",
        "region": 170
      },
      {
        "state": "blank",
        "region": 170
      },
      {
        "state": "blank",
        "region": 162
      },
      {
        "state": "blank",
        "region": 162
      },
      {
        "state": "blank",
        "region": 163
      },
      {
        "state": "blank",
        "region": 164
      },
      {
        "state": "blank",
        "region": 164
      },
      {
        "state": "blank",
        "region": 148
      },
      {
        "state": "blank",
        "region": 148
      },
      {
        "state": "blank",
        "region": 149
      },
      {
        "state": "blank",
        "region": 139
      },
      {
        "state": "blank",
        "region": 138
      },
      {
        "state": "blank",
        "region": 134
      },
      {
        "state": "blank",
        "region": 133
      },
      {
        "state": "blank",
        "region": null
      },
      {
        "state": "blank",
        "region": 129
      },
      {
        "state": "blank",
        "region": 127
      },
      {
        "state": "blank",
        "region": 127
      },
      {
        "state": "blank",
        "region": 119
      },
      {
        "state": "blank",
        "region": 119
      },
      {
        "state": "blank",
        "region": 113
      },
      {
        "state": "blank",
        "region": 113
      },
      {
        "state": "blank",
        "region": 112
      },
      {
        "state": "blank",
        "region": 99
      },
      {
        "state": "blank",
        "region": 99
      },
      {
        "state": "blank",
        "region": 98
      },
      {
        "state": "blank",
        "region": 97
      },
      {
        "state": "blank",
        "region": 61
      }
    ],
    [
      {
        "state": "blank",
        "region": 105
      },
      {
        "state": "blank",
        "region": 106
      },
      {
        "state": "blank",
        "region": 160
      },
      {
        "state": "blank",
        "region": 161
      },
      {
        "state": "blank",
        "region": 161
      },
      {
        "state": "blank",
        "region": 161
      },
      {
        "state": "blank",
        "region": 157
      },
      {
        "state": "blank",
        "region": 162
      },
      {
        "state": "blank",
        "region": 154
      },
      {
        "state": "blank",
        "region": 154
      },
      {
        "state": "blank",
        "region": 153
      },
      {
        "state": "blank",
        "region": 150
      },
      {
        "state": "blank",
        "region": 150
      },
      {
        "state": "blank",
        "region": 149
      },
      {
        "state": "blank",
        "region": 139
      },
      {
        "state": "blank",
        "region": 137
      },
      {
        "state": "blank",
        "region": 134
      },
      {
        "state": "blank",
        "region": 130
      },
      {
        "state": "blank",
        "region": 130
      },
      {
        "state": "blank",
        "region": 129
      },
      {
        "state": "blank",
        "region": 127
      },
      {
        "state": "blank",
        "region": 117
      },
      {
        "state": "blank",
        "region": 118
      },
      {
        "state": "blank",
        "region": 119
      },
      {
        "state": "blank",
        "region": 113
      },
      {
        "state": "blank",
        "region": 113
      },
      {
        "state": "blank",
        "region": 108
      },
      {
        "state": "blank",
        "region": 99
      },
      {
        "state": "blank",
        "region": 96
      },
      {
        "state": "blank",
        "region": 96
      },
      {
        "state": "blank",
        "region": 95
      },
      {
        "state": "blank",
        "region": 61
      }
    ],
    [
      {
        "state": "blank",
        "region": 105
      },
      {
        "state": "blank",
        "region": 106
      },
      {
        "state": "blank",
        "region": 160
      },
      {
        "state": "blank",
        "region": null
      },
      {
        "state": "blank",
        "region": 159
      },
      {
        "state": "blank",
        "region": 161
      },
      {
        "state": "blank",
        "region": 157
      },
      {
        "state": "blank",
        "region": 155
      },
      {
        "state": "blank",
        "region": 155
      },
      {
        "state": "blank",
        "region": 154
      },
      {
        "state": "blank",
        "region": 85
      },
      {
        "state": "blank",
        "region": 152
      },
      {
        "state": "blank",
        "region": 151
      },
      {
        "state": "blank",
        "region": 87
      },
      {
        "state": "blank",
        "region": 137
      },
      {
        "state": "blank",
        "region": 137
      },
      {
        "state": "blank",
        "region": 135
      },
      {
        "state": "blank",
        "region": 130
      },
      {
        "state": "blank",
        "region": 128
      },
      {
        "state": "blank",
        "region": 128
      },
      {
        "state": "blank",
        "region": 127
      },
      {
        "state": "blank",
        "region": 117
      },
      {
        "state": "blank",
        "region": 117
      },
      {
        "state": "blank",
        "region": 116
      },
      {
        "state": "blank",
        "region": 115
      },
      {
        "state": "blank",
        "region": 108
      },
      {
        "state": "blank",
        "region": 108
      },
      {
        "state": "blank",
        "region": 100
      },
      {
        "state": "blank",
        "region": 96
      },
      {
        "state": "blank",
        "region": 96
      },
      {
        "state": "blank",
        "region": 95
      },
      {
        "state": "blank",
        "region": 61
      }
    ],
    [
      {
        "state": "blank",
        "region": 79
      },
      {
        "state": "blank",
        "region": 80
      },
      {
        "state": "blank",
        "region": 160
      },
      {
        "state": "blank",
        "region": 159
      },
      {
        "state": "blank",
        "region": 159
      },
      {
        "state": "blank",
        "region": 158
      },
      {
        "state": "blank",
        "region": 157
      },
      {
        "state": "blank",
        "region": 156
      },
      {
        "state": "blank",
        "region": 155
      },
      {
        "state": "blank",
        "region": 84
      },
      {
        "state": "blank",
        "region": 85
      },
      {
        "state": "blank",
        "region": 151
      },
      {
        "state": "blank",
        "region": 151
      },
      {
        "state": "blank",
        "region": 87
      },
      {
        "state": "blank",
        "region": 137
      },
      {
        "state": "blank",
        "region": 135
      },
      {
        "state": "blank",
        "region": 135
      },
      {
        "state": "blank",
        "region": 89
      },
      {
        "state": "blank",
        "region": 128
      },
      {
        "state": "blank",
        "region": 128
      },
      {
        "state": "blank",
        "region": 90
      },
      {
        "state": "blank",
        "region": 117
      },
      {
        "state": "blank",
        "region": 116
      },
      {
        "state": "blank",
        "region": 116
      },
      {
        "state": "blank",
        "region": 91
      },
      {
        "state": "blank",
        "region": 92
      },
      {
        "state": "blank",
        "region": 108
      },
      {
        "state": "blank",
        "region": 93
      },
      {
        "state": "blank",
        "region": 94
      },
      {
        "state": "blank",
        "region": 94
      },
      {
        "state": "blank",
        "region": 95
      },
      {
        "state": "blank",
        "region": 62
      }
    ],
    [
      {
        "state": "blank",
        "region": 79
      },
      {
        "state": "blank",
        "region": 80
      },
      {
        "state": "blank",
        "region": 160
      },
      {
        "state": "blank",
        "region": 159
      },
      {
        "state": "blank",
        "region": 158
      },
      {
        "state": "blank",
        "region": 158
      },
      {
        "state": "blank",
        "region": 157
      },
      {
        "state": "blank",
        "region": 83
      },
      {
        "state": "blank",
        "region": 84
      },
      {
        "state": "blank",
        "region": 84
      },
      {
        "state": "blank",
        "region": 85
      },
      {
        "state": "blank",
        "region": 151
      },
      {
        "state": "blank",
        "region": 86
      },
      {
        "state": "blank",
        "region": 87
      },
      {
        "state": "blank",
        "region": 73
      },
      {
        "state": "blank",
        "region": 136
      },
      {
        "state": "blank",
        "region": 135
      },
      {
        "state": "blank",
        "region": 89
      },
      {
        "state": "blank",
        "region": 89
      },
      {
        "state": "blank",
        "region": 90
      },
      {
        "state": "blank",
        "region": 90
      },
      {
        "state": "blank",
        "region": 69
      },
      {
        "state": "blank",
        "region": 116
      },
      {
        "state": "blank",
        "region": 68
      },
      {
        "state": "blank",
        "region": 91
      },
      {
        "state": "blank",
        "region": 92
      },
      {
        "state": "blank",
        "region": 65
      },
      {
        "state": "blank",
        "region": 93
      },
      {
        "state": "blank",
        "region": 94
      },
      {
        "state": "blank",
        "region": 62
      },
      {
        "state": "blank",
        "region": 62
      },
      {
        "state": "blank",
        "region": 62
      }
    ],
    [
      {
        "state": "blank",
        "region": 79
      },
      {
        "state": "blank",
        "region": 78
      },
      {
        "state": "blank",
        "region": 81
      },
      {
        "state": "blank",
        "region": 81
      },
      {
        "state": "blank",
        "region": 81
      },
      {
        "state": "blank",
        "region": 82
      },
      {
        "state": "blank",
        "region": 77
      },
      {
        "state": "blank",
        "region": 83
      },
      {
        "state": "blank",
        "region": 76
      },
      {
        "state": "blank",
        "region": 75
      },
      {
        "state": "blank",
        "region": 85
      },
      {
        "state": "blank",
        "region": 74
      },
      {
        "state": "blank",
        "region": 86
      },
      {
        "state": "blank",
        "region": 87
      },
      {
        "state": "blank",
        "region": 73
      },
      {
        "state": "blank",
        "region": 73
      },
      {
        "state": "blank",
        "region": 88
      },
      {
        "state": "blank",
        "region": 88
      },
      {
        "state": "blank",
        "region": 89
      },
      {
        "state": "blank",
        "region": 70
      },
      {
        "state": "blank",
        "region": 70
      },
      {
        "state": "blank",
        "region": 69
      },
      {
        "state": "blank",
        "region": 68
      },
      {
        "state": "blank",
        "region": 68
      },
      {
        "state": "blank",
        "region": 91
      },
      {
        "state": "blank",
        "region": 67
      },
      {
        "state": "blank",
        "region": 65
      },
      {
        "state": "blank",
        "region": 65
      },
      {
        "state": "blank",
        "region": 64
      },
      {
        "state": "blank",
        "region": 64
      },
      {
        "state": "blank",
        "region": 62
      },
      {
        "state": "blank",
        "region": 63
      }
    ],
    [
      {
        "state": "blank",
        "region": 79
      },
      {
        "state": "blank",
        "region": 78
      },
      {
        "state": "blank",
        "region": 78
      },
      {
        "state": "blank",
        "region": 77
      },
      {
        "state": "blank",
        "region": 77
      },
      {
        "state": "blank",
        "region": 77
      },
      {
        "state": "blank",
        "region": 77
      },
      {
        "state": "blank",
        "region": 76
      },
      {
        "state": "blank",
        "region": 76
      },
      {
        "state": "blank",
        "region": 75
      },
      {
        "state": "blank",
        "region": 75
      },
      {
        "state": "blank",
        "region": 74
      },
      {
        "state": "blank",
        "region": 74
      },
      {
        "state": "blank",
        "region": 73
      },
      {
        "state": "blank",
        "region": 73
      },
      {
        "state": "blank",
        "region": 72
      },
      {
        "state": "blank",
        "region": 72
      },
      {
        "state": "blank",
        "region": 71
      },
      {
        "state": "blank",
        "region": 71
      },
      {
        "state": "blank",
        "region": 71
      },
      {
        "state": "blank",
        "region": 70
      },
      {
        "state": "blank",
        "region": 69
      },
      {
        "state": "blank",
        "region": 68
      },
      {
        "state": "blank",
        "region": 67
      },
      {
        "state": "blank",
        "region": 67
      },
      {
        "state": "blank",
        "region": 67
      },
      {
        "state": "blank",
        "region": 66
      },
      {
        "state": "blank",
        "region": 65
      },
      {
        "state": "blank",
        "region": 64
      },
      {
        "state": "blank",
        "region": 64
      },
      {
        "state": "blank",
        "region": 63
      },
      {
        "state": "blank",
        "region": 63
      }
    ]
  ];
}
