angular
.module('app', ['ngStorage'])
.controller('gridder', [
    '$scope',
    '$localStorage',
    '$http',
    '$location',
    function($scope, $localStorage, $http, $location) {

        $scope.clear = clear;
        $scope.setNextStateAndGetChanges = setNextStateAndGetChanges;
        $scope.conjectures = conjectures();

        var puzzleName = $location.search().puzzle;

        $scope.setQueryString = setQueryString;
        $scope.jsonUrl = puzzleName ? './' + puzzleName + '.json' : './example.json';
        // $scope.jsonUrl = './nope.json';
        loadPuzzle($scope.jsonUrl);

        $scope.loadPuzzle = loadPuzzle; // for switching to a different puzzle
        $scope.history = history();

        return;

        // Controller-dependent local functions

        function clear() {
            var confirmed = window.confirm('Clear all of the progress on the current puzzle?');

            if (confirmed) {
                $localStorage.history[$scope.jsonUrl] = [];
                loadPuzzle($scope.jsonUrl);
            }
        }

        /**
         * set up the board at $scope.grid if there's a version in local storage use that
         * link the $scope version to the localstorage version
         * also generate regions
         */
        function setUpBoard(data, historyData) {
            $scope.grid = generate().newEmptyGrid(data.numRows, data.numColumns, data.nodeData);

            if (!historyData) {
                console.log('No history data. We\'re likely in build mode.');
                return;
            }
            $scope.history.data = historyData;

            // update the grid to have all the changes so far
            $scope.history.doChanges($scope.history.data, $scope.grid);

            // initialize validation functions with proper number of rows and columns
            $scope.validate = validate(data.numRows, data.numColumns);
            // FIXME alerts are real broke
            $scope.alerts = $scope.validate.alerts;
            // redo node validation
            $scope.validate.redo($scope.grid, $scope.alerts);

            // set Conjecture Mode as on if the last change has a conjecture
            $scope.conjectures.enabled = conjectures().lastChangeHasConjecture($scope.history.data);

            // TODO should have a loading variable so we can prevent user from changing things before this point?
        }

        /**
         * function to load static puzzle size and nodeData
         */
        function loadPuzzle(jsonUrl) {
            delete $scope.buildData;
            delete $scope.grid;

            $scope.puzzleLoadRequest = $http
            .get(jsonUrl, {cache: true})
            .success(function(data) {
                $scope.answer = loadAnswer(jsonUrl, data.answerLength);
                setUpBoard(data, loadHistory(jsonUrl));
                delete $scope.puzzleLoadRequest;
            })
            .error(function(err) {
                if (!/not found/i.test(err)) { return; }
                enterBuildMode();
            });

            /**
             * Loads history from browser local storage. Failing that returns a new history array linked to storage.
             */
            function loadHistory(namespace) {
                $localStorage.history = $localStorage.history || {};
                $localStorage.history[namespace] = $localStorage.history[namespace] || [];
                return $localStorage.history[namespace];
            }

            function loadAnswer(namespace, length) {
                $localStorage.answer = $localStorage.answer || {};
                $localStorage.answer[namespace] = $localStorage.answer[namespace] || new Array(length).join('.').split('.');
                return $localStorage.answer[namespace];
            }

            function enterBuildMode() {
                // buildMode
                $scope.buildData = {
                    numRows: 3,
                    numColumns: 6,
                    nodeData: {}
                };

                setUpBoard($scope.buildData);
                $scope.addNodeAttribute = generate().addNodeAttribute; // only for buildMode
                $scope.setUpBoard = setUpBoard; // only for build mode
            }
        }

        function setQueryString(str) {
            $location.search({puzzle: str});
        }

    }
])
.filter('puzzleNameFormat', function() {
    return puzzleNameFormat;
})
.directive('leftArrow', function() {return {restrict: 'C', template: '&#8592;'} })
.directive('upArrow', function() {return {restrict: 'C', template: '&#8593;'} })
.directive('rightArrow', function() {return {restrict: 'C', template: '&#8594;'} })
.directive('downArrow', function() {return {restrict: 'C', template: '&#8595;'} });

function puzzleNameFormat(jsonUrl) {
    return jsonUrl
    .replace(/^\.\//, '')
    .replace(/\.json$/, '')
    .split('-')
    .map(capitalizeWord)
    .join(' ')

    function capitalizeWord(word) {
        return word.slice(0, 1).toUpperCase() + word.slice(1);
    }
}

function generate() {
    return    {
        newEmptyGrid: newEmptyGrid,
        addNodeAttribute: addNodeAttribute,
    }

    /**
     * @arg {int} numRows -- Number of rows of the grid
     * @arg {int} numColumns
     */
    function newEmptyGrid(numRows, numColumns, nodeData) {
        var grid = {nodes:[]};

        for (var i = 0; i < numRows; i++) {
            grid.nodes[i] = [];
            for (var j = 0; j < numColumns; j++) {
                var data = nodeData && nodeData[i] && nodeData[i][j];
                grid.nodes[i][j] = newNode(i, j, data);
            }
        }

        linkNodesToNeighbors(grid.nodes);

        return grid;

        function newNode(i, j, data) {
            var number = data && data.number;
            var direction = data && data.direction;

            return {
                row: i,
                column: j,
                state: null,
                direction: direction || null,
                number: Number(number) === number ? number : null,
                letter: data && data.letter,
                startOrEnd: data && data.startOrEnd,
                neighbors: [],
                invalidReasons: null,
            };
        }


        /**
         * Cycle through all the nodes and add pointers to all its neighbors.
         */
        function linkNodesToNeighbors(nodes) {
            utility().forAllNodes(nodes, linkNodeToNeighbors);

            /**
             * @WARNING this creates a circular reference, preventing JSON stringifying
             */
            function linkNodeToNeighbors(node) {
                node.neighbors = getNeighbors(node);

                function getNeighbors(node) {
                    return [
                        getNodeAt(node.row - 1, node.column),
                        getNodeAt(node.row + 1, node.column),
                        getNodeAt(node.row, node.column - 1),
                        getNodeAt(node.row, node.column + 1),
                    ].filter(truthy);

                    function getNodeAt(i, j) {
                        return nodes[i] && nodes[i][j];
                    }

                    function truthy(thing) {
                        return !!thing;
                    }
                }
            }
        }
    }

    /**
     * In order to make it simple to create a new puzzle the nodeData need to be generated, which is most easily done
     * by explicitly setting these in a separate data structure. This function sets the node in a "sparse array", a.k.a.
     * an object (double-nested of course)
     */
    function addNodeAttribute(nodeData, row, column, attr, value) {
        nodeData[row] = nodeData[row] || {};
        nodeData[row][column] = nodeData[row][column] || {};
        nodeData[row][column][attr] = value;
    }

}

/**
 * This mutates the node state to update it to the new one. It is marked as a conjecture if conjectures are enabled.
 * Finally, it returns a history change to be stored.
 * TODO break change part into a history function (in history() space) that takes appropriate parameters?
 * @warning mutates the node state and conjecture state
 */
function setNextStateAndGetChanges(node, conjecturesEnabled) {
    console.log(node);

    var newState = nextState(node.state)

    // a change is a part of a history chain
    var change = {
        row: node.row,
        column: node.column,
        state: {
            from: node.state,
            to: newState
        },
        conjecture: conjecturesEnabled,
    };

    // MUTATE!
    node.state = newState;
    node.conjecture = conjecturesEnabled;

    console.log(node);

    return {changes: [change]};

    /**
     * cycle to the nextState given state
     * null -> 'blank' -> 'filled' -> null (etc.)
     */
    function nextState(state) {
        return {
            'null': 'blank',
            'blank': 'filled',
            // 'unpossible': 'active'
        }[state] || null;
    }
}

function validate(numColumns, numRows) {
    if (!numColumns || !numRows) {
        throw new Error('You must initialize validator with number of rows and columns.');
    }
    var LIMIT = numColumns * numRows; //max number of neighbors to follow, prevents infinite while loop
    var alerts = newAlerts();

    return {
        alerts: alerts,
        node: validateNode,
        redo: redoValidation,
    }

    /**
     * a data structure to contain the count of validation alerts we've seen for notifying users
     */
    function newAlerts() {
        return { // a count of how many nodes are invalid due to this
            adjacentFilledNeighbors: 0,
        }
    }

    function validateNodes(nodes) {
        nodes.forEach(function(n) {
            validateNode(n, nodes);
        });
    }

    function validateNode(node, nodes) {
        adjacentFilledNeighborsTest(node, nodes);
    }

    function adjacentFilledNeighborsTest(node, nodes) {
        var invalidReason = 'adjacentFilledNeighbors';
        var alreadyInvalid = node.invalidReasons && node.invalidReasons[invalidReason];
        // console.log('adjacentFilledNeighborsTest, node = ', node, 'alreadyInvalid = ', alreadyInvalid)
        if (!filled(node)) {
            // This node wasn't invalid and can't be now (as it's not filled)
            if (!alreadyInvalid) { return; }

            // node was invalid, but it can't be invalid now because it's not filled
            markValid(node);
            node.neighbors.filter(filled).forEach(recheckNeighbor);
            return;
        }

        var filledNeighbors = node.neighbors.filter(filled);
        if (filledNeighbors.length === 0) { // all is good
            markValid(node);
            return;
        }

        filledNeighbors.push(node);
        filledNeighbors.forEach(markInvalid);

        function recheckNeighbor(n) {
            adjacentFilledNeighborsTest(n, nodes);
        }

        function filled(n) {
            return n && n.state === 'filled';
        }

        function markInvalid(n) {
            addNodeInvalidReason(n, invalidReason);
        }

        function markValid(n) {
            removeNodeInvalidReason(n, invalidReason);
        }
    }

    function addNodeInvalidReason(node, reason) {
        node.invalidReasons = node.invalidReasons || {};
        if (node.invalidReasons[reason]) { return; }
        node.invalidReasons[reason] = true;
        updateAlertCount(alerts, reason, 1);
    }

    function removeNodeInvalidReason(node, reason) {
        if (!node.invalidReasons) {
            // can't remove a value when no invalidReasons set
            return;
        }

        delete node.invalidReasons[reason];
        updateAlertCount(alerts, reason, -1);
        if (Object.keys(node.invalidReasons)) { // reset invalid reasons to null if this is the last reason
            node.invalidReasons = null;
        }
    }

    function updateAlertCount(alerts, alertType, updateAmount) {
        if (!alerts || alerts[alertType] === undefined) {
            console.error('alerts ', alerts, ', alertType', alertType);
            throw Error('alertType not found in alerts');
        }

        if (updateAmount >= 0) {
            alerts[alertType] += updateAmount;
            return;
        }

        if (alerts[alertType] === 0) { return; }

        alerts[alertType] -= 1;
    }


    function redoValidation(grid) {
        alerts = newAlerts();
        clearValidation(grid);
        utility().forAllNodes(grid.nodes, revalidateNode);

        // console.log(grid) // TEMP

        function revalidateNode(node) {
            validateNode(node, grid.nodes);
        }
    }

    function clearValidation(grid) {
        utility().forAllNodes(grid.nodes, resetNodeInvalidState);

        function resetNodeInvalidState(node) {
            node.invalidReasons = null;
        }
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
        lastChangeHasConjecture: lastChangeHasConjecture,
    };

    function clearConjectures(nodes) {
        utility().forAllNodes(nodes, removeStateAndConjecture);

        function removeStateAndConjecture(node) {
            if (node.conjecture) {
                node.state = null;
                removeConjectureFlag(node);
            }
        }
    }

    function acceptConjectures(nodes) {
        utility().forAllNodes(nodes, removeConjectureFlag);
    }

    function removeConjectureFlag(node) {
        node.conjecture = false;
    }

    function lastChangeHasConjecture(history) {
        var lastChange = history.slice(-1)[0];
        return !!(lastChange && changeHasConjecture(lastChange));

        function changeHasConjecture(change) {
            return change.changes.some(function(c) { return c.conjecture; });
        }
    }


}

function history() {
    return {
        doChanges: doChanges,
        clearConjectures: clearConjectures,
        // undoChanges(changes, grid),
    };

    /**
     * Applies the node changes to the grid. If there's a mismatch in initial state of a node it throws
     * an error. TODO how to handle these errors and propogate them up to the user? Ideally they should just not happen
     */
    function doChanges(changes, grid) {
        if (!changes) {
            console.info('Can\'t apply history changes as they do not exist: ', changes);
            return;
        }
        forEachChange(changes, updateNodeBasedOnChange);

        function updateNodeBasedOnChange(change) {
            var nodeToUpdate = grid.nodes[change.row][change.column];
            verifyNodeStateBeforeChange(nodeToUpdate, change);
            nodeToUpdate.state = change.state.to;
            if (change.conjecture) {
                nodeToUpdate.conjecture = true;
            }
        }

        function verifyNodeStateBeforeChange(node, change) {
            if (node.state !== change.state.from) {
                var msg = 'node state differs from expected.'
                console.error(msg + ' node', node, 'change', change);
                // This does appear to happen in the wild so I messed something up somewhere, seems better for users
                // to continue on rather than throwing an error
                // throw new Error(msg);
            }
        }
    }

    function forEachChange(changes, callback) {
        changes.forEach(function(groupOfChanges) {
            groupOfChanges.changes.forEach(callback);
        });
    }

    // FIXME:
    // Has to clear only conjecture changes out of a group of changes
    // Really should just be using the undo feature (which isn't written yet)
    function clearConjectures(changes) {
        while (changes.length && conjectures().lastChangeHasConjecture(changes)) {
            changes.pop();
        }
    }

    function markConjecturesAsTruth(changes) {
        forEachChange(changes, deleteConjectureFlag);

        function deleteConjectureFlag(change) {
            delete change.conjecture;
        }
    }
}

function utility() {
    return {
        forAllNodes: forAllNodes,
    };

    function forAllNodes(nodes, callback) {
        nodes.forEach(function(row) {
            row.forEach(callback);
        });
    }
}
