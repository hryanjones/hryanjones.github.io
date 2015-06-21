angular
.module('app', ['ngStorage'])
.controller('gridder', ['$scope', '$localStorage', function($scope, $localStorage) {
  // for grid sizing and spacing (in pixels)
  // $scope.vOffset = 19;
  // $scope.hOffset = 19;
  // $scope.spacing = 17.7;

  var numColumns = 20;
  var numRows = 10;

  // $scope.clear = clear;
  // $scope.markRegion = markRegion;
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
    // if ($localStorage.grid) {
    //   $scope.grid = $localStorage.grid;
    // }
    // else {
    //   $scope.grid = getStates();
    //   $localStorage.grid = $scope.grid;
    // }
    // $scope.regions = generateRegionLookup($scope.grid);
    $scope.grid = generateEmptyGrid(numRows, numColumns)
  }
}]);

/**
 * At each grid point generate a node. This node is usually accompanied by two connections.
 * One to the horizontal (to the right) and one vertical (below), with the exception of the last
 * column and the last row. Each node has four connection points which will point to an existing connection or null.
 * @arg {int} numRows -- Number of rows of the grid
 * @arg {int} numColumns
 */
function generateEmptyGrid(numRows, numColumns) {
  var grid = newEmptyGrid();

  for (var i = 0; i < numRows; i++) {
    grid.nodes[i] = [];
    var lastRow = (i + 1) === numRows;
    grid.connections.horizontal[i] = [];
    if (!lastRow) {
      grid.connections.vertical[i] = [];
    }

    for (var j = 0; j < numColumns; j++) {
      var lastColumn = (j + 1) === numColumns;

      // connections made on previous iterations
      var connectionAbove = i ? grid.connections.vertical[i-1][j] : null;
      var connectionLeft = j ? grid.connections.horizontal[i][j-1] : null;

      // new connections to create
      var connectionRight = lastColumn ? null : newConnection();
      var connectionBelow = lastRow ? null : newConnection();

      // populate new connections and node into the grid
      if (connectionRight) {
        grid.connections.horizontal[i][j] = connectionRight;
      }
      if (connectionBelow) {
        grid.connections.vertical[i][j] = connectionBelow;
      }
      grid.nodes[i][j] = newNode(connectionAbove, connectionRight, connectionBelow, connectionLeft);
    }
  }
  return grid;

  function newEmptyGrid() {
    return {
      nodes: [],
      connections: {horizontal: [], vertical: []}
    };
  }

  function newNode(above, right, below, left) {
    var node = {
      state: null,  // a node, if it has a number, may possibly have a state of "invalid" for purposes of notifying
                    // the puzzler that they've screwed up
      number: null, // If the node has a number (fixed and defined by the puzzle) it goes here
      connections: {} // pointers to connections in different directions
    };

    // TODO there's probably a cleaner way to do the below
    if (above) {
      node.connections.above = above;
    }
    if (right) {
      node.connections.right = right;
    }
    if (below) {
      node.connections.below = below;
    }
    if (left) {
      node.connections.left = left;
    }
    return node;
  }

/**
 * Create a new connection with a state and whether or not it's a guess.
 *   Possible states are:
 *     * null -- standing for empty grid line
 *     * active -- standing for a filled in line
 *     * unpossible -- standing for a line that user has marked which shouldn't be filled
 *   guess could be:
 *     * null -- this should always be guess when state is null
 *     * false -- the user is pretty sure the state is correct
 *     * true -- the user wants this marked as a guess
*/
  function newConnection() {
    return {
      state: null,
      guess: null
    };
  }
}

