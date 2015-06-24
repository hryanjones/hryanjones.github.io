angular
.module('app', ['ngStorage'])
.controller('gridder', ['$scope', '$localStorage', '$http', function($scope, $localStorage, $http) {

    $scope.clear = clear;
    $scope.setNextState = setNextState;
    $scope.alerts = validate().newAlerts();
    $scope.conjectures = conjectures();

    $scope.jsonUrl = './example.json';
    loadPuzzle($scope.jsonUrl);

    $scope.loadPuzzle = loadPuzzle; // for switching to a different puzzle

    return;

    // Controller-dependent local functions

    function clear() {
        // delete $localStorage.grid;
        loadPuzzle($scope.jsonUrl);
    }

    /**
     * set up the board at $scope.grid if there's a version in local storage use that
     * link the $scope version to the localstorage version
     * also generate regions
     */
    function setUpBoard(data) {
        // if ($localStorage.grid) {
        //     $scope.grid = $localStorage.grid;
        // }
        // else {
        //     $scope.grid = getStates();
        //     $localStorage.grid = $scope.grid;
        // }
        // $scope.regions = generateRegionLookup($scope.grid);
        $scope.grid = generate().newEmptyGrid(data.numRows, data.numColumns, data.nodeNumbers);
        $scope.validate = validate(data.numRows, data.numColumns);
    }

    /**
     * function to load static puzzle size and nodeNumbers
     */
    function loadPuzzle(jsonUrl) {
        delete $scope.buildData;
        delete $scope.grid;

        $scope.puzzleLoadRequest = $http
        .get(jsonUrl, {cache: true})
        .success(function(data) {
            setUpBoard(data);
            delete $scope.puzzleLoadRequest;
        })
        .error(function(err) {
            if (err !== 'Not found\n') { return; } // FIXME, need to make sure this is the same error on github.io

            // buildMode
            $scope.buildData = {
                numRows: 3,
                numColumns: 6,
                nodeNumbers: {}
            };

            setUpBoard($scope.buildData);
            $scope.addNodeNumber = generate().addNodeNumber; // only for buildMode
            $scope.setUpBoard = setUpBoard; // only for build mode

        });
    }

}]);

function generate() {
    return    {
        newEmptyGrid: newEmptyGrid,
        addNodeNumber: addNodeNumber,
    }

    /**
     * At each grid point generate a node. This node is usually accompanied by two connections.
     * One to the horizontal (to the right) and one vertical (below), with the exception of the last
     * column and the last row. Each node has four connection points which will point to an existing connection or null.
     * @arg {int} numRows -- Number of rows of the grid
     * @arg {int} numColumns
     */
    function newEmptyGrid(numRows, numColumns, nodeNumbers) {
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
                var connectionRight = lastColumn ? null : newConnection('horizontal');
                var connectionBelow = lastRow ? null : newConnection('vertical');

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
                state: null,    // a node, if it has a number, may possibly have a state of "invalid" for purposes of notifying
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
     * Create a new connection with a state and whether or not it's a conjecture.
     *     Possible states are:
     *         * null -- standing for empty grid line
     *         * active -- standing for a filled in line
     *         * unpossible -- standing for a line that user has marked which shouldn't be filled
     *     conjecture could be:
     *         * false -- the user is pretty sure the state is correct
     *         * true -- the user wants this marked as a conjecture
     *     invalid is either false or true
     *     type is either 'vertical' or 'horizontal' TODO add validation
    */
        function newConnection(type) {
            return {
                state: null,
                conjecture: false,
                invalidReasons: {
                    connectsSameNodes: false,
                    moreThanOneBend: false,
                },
                type: type,
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
     * In order to make it simple to create a new puzzle the nodeNumbers need to be generated, which is most easily done
     * by explicitly setting these in a separate data structure. This function sets the node in a "sparse array", a.k.a.
     * an object (double-nested of course)
     */
    function addNodeNumber(nodeNumbers, row, column, value) {
        nodeNumbers[row] = nodeNumbers[row] || {};
        nodeNumbers[row][column] = value;
    }

}

function setNextState(connection, conjecturesEnabled) {
    connection.state = nextState(connection.state);
    if (!connection.state) {
        connection.conjecture = false;
        return;
    }

    if (conjecturesEnabled) {
        connection.conjecture = true;
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
}

function validate(numColumns, numRows) {
    var LIMIT = numColumns * numRows; //max number of connections to follow, prevents infinite while loop
    return {
        newAlerts: newAlerts,
        nodes: validateNodes,
        connection: validateConnection,
    }

    /**
     * a data structure to contain the count of validation alerts we've seen for notifying users
     */
    function newAlerts() {
        return { // a count of how many errors we've found for a given type
            overloadedNode: 0,
            branchInEmptyNode: 0,
            connectsSameNodes: 0,
            moreThanOneBend: 0,
        }
    }

    function validateNodes(nodes, alerts) {
        nodes.forEach(function(n) {
            validateNode(n, alerts);
        });
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

        incrementAlerts(alerts, alertType, node.invalid);

        if (!node.invalid) { // don't create extra alerts
            node.connections.all.forEach(function(conn) {
                validateConnection(conn, alerts);
            });
        }
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

    function incrementAlerts(alerts, alertType, increment) {
        if (!alerts || alerts[alertType] === undefined) {
            console.error('alerts ', alerts, ', alertType', alertType);
            throw Error('alertType not found in alerts');
        }

        if (increment) {
            alerts[alertType] += 1;
            return;
        }

        if (alerts[alertType] === 0) { return; }

        alerts[alertType] -= 1;

    }

    function validateConnection(connection, alerts) {
        if (!connection.state) { return; }
        if (connection.state === 'active') {
            if (connectedToInvalidNodes(connection)) { // let's not overwhelm users
                return;
            }
            if (connectedToInvalidConnections(connection)) {
                connection.invalidReasons.moreThanOneBend = true;
                // the other type can't be extended
                return;
            }
        }

        validateconnectsSameNodes(connection, alerts);
        validateNoMoreThanOneBend(connection, alerts);

        function connectedToInvalidNodes(connection) {
            return connection.nodes[0].invalid || connection.nodes[1].invalid;
        }
        function connectedToInvalidConnections(connection) {
            var otherConn = findNextConnection(connection, connection.nodes[0]);
            if (otherConn && otherConn.invalidReasons.moreThanOneBend) { return true ;}
            otherConn = findNextConnection(connection, connection.nodes[1]);
            return (otherConn && otherConn.invalidReasons.moreThanOneBend);
        }
    }

    /**
     * traverse along a longer connection. If it terminates in two non-empty nodes, make sure they're not the same number
     * @FIXME -- this is very similar to validateNoMoreThanOneBend, combine in an intelligible way
     */
    function validateconnectsSameNodes(connection, alerts) {
        var nodeA = traverseLongConnection('findEndNode', connection, connection.nodes[0]);
        var nodeB = traverseLongConnection('findEndNode', connection, connection.nodes[1]);

        // it's only invalid when the long connection is joined by the changed connection and it is active
        var invalidState = connection.state === 'active' && nodesAreSameNumber(nodeA, nodeB);

        if (invalidState === connection.invalidReasons.connectsSameNodes) { return; }

        // if our invalid state has changed, we need to traverse along and change invalid states
        setLongConnectionInvalidState(connection, connection.nodes, 'connectsSameNodes', invalidState);

        incrementAlerts(alerts, 'connectsSameNodes', invalidState);

        /**
         * Two nodes are only considered to be the same number when they both have existing numbers and they're the same
         */
        function nodesAreSameNumber(nodeA, nodeB) {
            return !isEmptyNode(nodeA) && !isEmptyNode(nodeB) && nodeA.number === nodeB.number;
        }
    }

    /**
     * when a node has become unpossible we need to verify any other active connections that connect to this
     * connections end node. This is especially for the case where there's a branching error, but an existing
     * double nodes connected error (because of the branching, the double nodes connected won't be registered
     * so this is to especially check for them).
     * @TODO rewrite this long-winded and probably incomprehensible doc into something succinct and understandable
     * @FIXME it seems we don't need this...
     */
    function validateOtherConnections(connection, alerts, validateFunction) {
        connection.nodes.forEach(function(node) {
            node.connections.all.forEach(function(conn) {
                if (conn.state !== 'active' || conn === connection) { return; }

                validateFunction(conn, alerts);
            });
        });
    }

    function validateNoMoreThanOneBend(connection, alerts) {
        var looseEnds = getLooseEnds(connection);
        if (looseEnds.length === 2) { // this removed connection was in the middle of a bad path
            // first decrement our alert counter
            incrementAlerts(alerts, 'moreThanOneBend', true);
        }
        if (looseEnds.length) {
            looseEnds.forEach(function(conn) { // redo the check on the connections that are still active
                validateNoMoreThanOneBend(conn, alerts)
            });
            connection.invalidReasons.moreThanOneBend = false; // reset the removed connections invalid status
            return;
        }

        // yuck, if a segment is removed in the middle we need to decrement our alerts counter and revalidate both sides

        var numberOfBends = traverseLongConnection('getNumberOfBends', connection, connection.nodes[0]) +
            traverseLongConnection('getNumberOfBends', connection, connection.nodes[1]);

        var invalidState = numberOfBends > 1;

        if (invalidState === connection.invalidReasons.moreThanOneBend) { return; }

        setLongConnectionInvalidState(connection, connection.nodes, 'moreThanOneBend', invalidState);

        incrementAlerts(alerts, 'moreThanOneBend', invalidState);

        /**
         * If this connection was removed from a bad path return the "loose ends" or the active connection(s) that
         * continue the rest of the path. Otherwise return empty array.
         */
        function getLooseEnds(connection) {
            if (!invalidConnectionWasRemoved(connection)) { return []; }

            return connection.nodes.map(function(node) {
                return findNextConnection(connection, node);
            })
            .filter(function(n) { return n; }); // remove empty neighbors
        }

        function invalidConnectionWasRemoved(connection) {
            return (connection.state === 'unpossible' && connection.invalidReasons.moreThanOneBend);
        }
    }

    function setLongConnectionInvalidState(connection, nodes, reason, state) {
        var callback = getConnectionCallback(reason, state);
        nodes.forEach(function(node) {
            traverseLongConnection('findEndNode', connection, node, callback);
        });

        /**
         * get a connection callback to feed into traverseLongConnection('findEndNode',  Each connection along a long connection will have this callback
         * applied. For this specific case we're creating a function to set the .invalid state of the connection to true or false
         * @FIXME document betterly
         */
        function getConnectionCallback(reason, state) {
            return function(connection) {
                if (connection.state === 'active') {
                    connection.invalidReasons[reason] = state;
                    return;
                }
                connection.invalidReasons[reason] = false; // only active connections can be considered invalid
            }
        }
    }

    /**
     * This function starts at a connection and traveling in the direction of the given node will travel down the
     * connection and return what you want depending on action, either 'findEndNode' or 'getNumberOfBends'
     * If connectionCallback is given we'll also call this action on every connection we encounter
     */
    function traverseLongConnection(action, connection, node, connectionCallback) {
        // action can be either 'findEnd Node' or 'getNumberOfBends'
        var limit = LIMIT;

        // Need a sane limit in here because it's possible for someone to make a closed loop
        // Half the total number of connections seems good, which is just M times N
        // FIXME make it so that this number gets updated automatically and is stored somewhere on the top level of validation
        if (connectionCallback) {
            connectionCallback(connection);
        }

        var numberOfBends = 0;
        var prevConnType;

        while (limit) {
            limit--;
            prevConnType = connection.type;

            //leap frog from connection to node to connection
            connection = findNextConnection(connection, node);

            if (!connection) {
                if (action === 'findEndNode') {
                    return node;
                }
                if (action === 'getNumberOfBends') {
                    return numberOfBends;
                }
                throw new Error ('Should not get here, something is messed up in traverseLongConnection');
            }

            if (connection.type !== prevConnType) {
                numberOfBends += 1;
            }
            node = findNextNode(node, connection);

            if (!connectionCallback) { continue; }
            connectionCallback(connection);
        }

        console.error('node = ', node, ', connection = ', connection);
        throw new Error('Did not find an end node. Should not happen. Might need to increase limit.');
    }

    function findNextConnection(connection, node) {
        if (isLongConnectionEnd(node, connection)) { return null; }
        var conn;

        for (var i = 0; i < node.connections.all.length; i++) {
            conn = node.connections.all[i];
            if (conn.state !== 'active') { continue; }
            if (conn === connection) { continue; }
            return conn;
        }

        console.error('node = ', node, ', connection = ', connection);
        throw new Error('There might be a bug in isLongConnectionEnd, could not find another end to connection at node');
    }

    function findNextNode(node, connection) {
        return connection.nodes[0] === node ? connection.nodes[1] : connection.nodes[0];
    }

    /**
     * TODO is this only used by findNextConnection? if so, then make it a sub function
     */
    function isLongConnectionEnd(node, enteringConnection) {
        if (!isEmptyNode(node)) { return true; } // numbered nodes are considered the end

        var activeConns = numberActiveConnections(node);

        // it's an end if there are more than three active connections as this means a user has broken a node-style rule
        if (activeConns > 2) { return true; }

        // if the entering connection is active and there are two connections, it must clearly continue on
        if (activeConns === 2 && enteringConnection.state === 'active') { return false; }

        // if the entering connection is not active and there is one active connection it continues along that thread
        if (activeConns === 1 && enteringConnection.state !== 'active') { return false; }

        // all other possibilities are a node end
        return true;
    }

    function isEmptyNode(node) {
        return Number(node.number) !== node.number;
    }
}

function conjectures() {
    return {
        enabled: false,
        clear: clearConjectures,
        accept: acceptConjectures,
    };

    function applyFunctionToAllConnections(callback, connections) {
        connections.vertical.forEach(applyToRow);
        connections.horizontal.forEach(applyToRow);

        function applyToRow(row) {
            row.forEach(callback);
        }
    }

    function clearConjectures(connections) {
        applyFunctionToAllConnections(
            function(conn) {
                if (conn.conjecture) {
                    conn.state = null;
                    removeConjectureFlag(conn);
                }
            },
            connections
        );
    }

    function acceptConjectures(connections) {
        applyFunctionToAllConnections(removeConjectureFlag, connections);
    }

    function removeConjectureFlag(connection) {
        connection.conjecture = false;
    }

}

