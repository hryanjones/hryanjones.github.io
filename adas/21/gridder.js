angular
.module('app', ['ngStorage'])
.controller('gridder', ['$scope', '$localStorage', function($scope, $localStorage) {

  var numColumns = 8; // TODO load this along with nodeNumbers so that you can have different puzzles loaded with the same puzzle engine
  var numRows = 8;

  $scope.nodeNumbers = getNodeNumbers() || {};
  $scope.buildMode = !(getNodeNumbers()) || /build/.test(window.location.search);
  $scope.addNodeNumber = addNodeNumber;

  $scope.clear = clear;
  $scope.nextState = nextState;
  $scope.validateNode = validateNode;
  $scope.alerts = { // a count of how many errors we've found for a given type
    overloadedNode: 0,
    branchInEmptyNode: 0,
  }
  setUpBoard();

  return;

  // Controller-dependent local functions

  function clear() {
    // delete $localStorage.grid;
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
    $scope.grid = generateEmptyGrid(numRows, numColumns, $scope.nodeNumbers);
  }
}]);

/**
 * At each grid point generate a node. This node is usually accompanied by two connections.
 * One to the horizontal (to the right) and one vertical (below), with the exception of the last
 * column and the last row. Each node has four connection points which will point to an existing connection or null.
 * @arg {int} numRows -- Number of rows of the grid
 * @arg {int} numColumns
 */
function generateEmptyGrid(numRows, numColumns, nodeNumbers) {
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

      var number = nodeNumbers && nodeNumbers[i] && nodeNumbers[i][j];
      grid.nodes[i][j] = newNode(connectionAbove, connectionRight, connectionBelow, connectionLeft, number);
    }
  }

  setPointersToNodesOnConnections(grid);

  return grid;

  function newEmptyGrid() {
    return {
      nodes: [],
      connections: {horizontal: [], vertical: []}
    };
  }

  function newNode(above, right, below, left, number) {
    var node = {
      state: null,  // a node, if it has a number, may possibly have a state of "invalid" for purposes of notifying
                    // the puzzler that they've screwed up
      number: Number(number) === number ? number : null, // If the node has a number (fixed and defined by the puzzle)
                                                         // it goes here
      connections: { // pointers to connections in different directions
        all: []
      },
      invalid: false,
    };

    // TODO there's probably a cleaner way to do the below
    if (above) {
      node.connections.above = above;
      node.connections.all.push(above);
    }
    if (right) {
      node.connections.right = right;
      node.connections.all.push(right);
    }
    if (below) {
      node.connections.below = below;
      node.connections.all.push(below);
    }
    if (left) {
      node.connections.left = left;
      node.connections.all.push(left);
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
 *   invalid is either false or true
*/
  function newConnection() {
    return {
      state: null,
      guess: null,
      invalid: false,
      nodes: [], // this is where pointers to the two nodes this connection connects will be placed
    };
  }

  /**
   * Cycle through all the nodes, for each connection on each node, add a pointer to the node
   */
  function setPointersToNodesOnConnections(grid) {
    grid.nodes.forEach(function(row) {
      row.forEach(function(node) {
        node.connections.all.forEach(function(connection) {
          connection.nodes.push(node); // DANGER this is creating a circular reference, which may cause problems in the future!
        })
      })
    })

  }
}

/**
 * cycle to the nextState given state
 * null -> 'unpossible' -> 'active' -> null (etc.)
 */
function nextState(state) {
  return {
    'null': 'active',
    'active': 'unpossible',
    // 'unpossible': 'active'
  }[state] || null;
}

/**
 * In order to make it simple to create a new puzzle the nodeNumbers need to be generated, which is most easily done
 * by explicitly setting these in a separate data structure. This function sets the node in a "sparse array", a.k.a.
 * an object (double-nested of course)
 */
function addNodeNumber(nodeNumbers, row, column, value) {
  nodeNumbers[row] = nodeNumbers[row] || {};
  nodeNumbers[row][column] = value;
}

/**
 * set .valid attr to false if the number of active connections to this node are greater than it's node.number
 * also, for empty nodes the number is 2 because branching is not allowed on an empty node
 */
function validateNode(node, alerts) {
  var initialState = node.invalid;

  var maxConns = isEmptyNode(node) ? 2 : node.number;
  var numConns = numberActiveConnections(node);

  node.invalid = numConns > maxConns;

  if (initialState === node.invalid) { return; }

  // Add-to or subtract-from alert count for types of node alerts

  var alertType = isEmptyNode(node) ? 'branchInEmptyNode' : 'overloadedNode';

  if (node.invalid) {
    alerts[alertType] += 1;
    return;
  }

  if (alerts[alertType] === 0) {return;}

  alerts[alertType] -= 1;
}

function numberActiveConnections(node) {
  var numConns = 0;

  node.connections.all.forEach(function(conn) {
    if (conn.state === 'active') {
      numConns += 1;
    }
  });
  return numConns;
}

/**
 * traverse along a longer connection. If it terminates in two non-empty nodes, make sure they're not the same number
 * @TODO the hard part of this one is going to be the "undoing"
 */
function validateSameNodesNotConnected(connection) {
}

function isEmptyNode(node) {
  return Number(node.number) !== node.number;
}

/**
 * function to hold the hard-coded puzzle nodeNumbers
 */
function getNodeNumbers() {
  return {
    "0": {
      "2": 1,
      "4": 2
    },
    "1": {
      "1": 2,
      "3": 1,
      "6": 4
    },
    "2": {
      "0": 2,
      "2": 2
    },
    "4": {
      "1": 3,
      "5": 3,
      "7": 3
    },
    "5": {
      "4": 2,
      "6": 2
    },
    "6": {
      "3": 2
    },
    "7": {
      "1": 3
    }
  };
  // return false;
}
