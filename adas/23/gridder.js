/*
So I think the way this is going to work is:
1. Click to select a tee position
2. This will highligh possible paths
3. Click the box in the direction to select that path
4. There will also be a red X in that direction to mark it as non-possible

NOTE: this means that most boxes won't allow you to click on them

I think I'll also want neighbors to be specifiable in each direction
*/


var PUZZLE_NUM = 23;

angular
.module('app', ['ngStorage'])
.controller('gridder', [
    '$scope',
    '$localStorage',
    '$http',
    '$location',
    function($scope, $localStorage, $http, $location) {

        // $scope.$watch('selectedNode', function(newNode) { // TEMP
        //     if (!newNode) { return; }
        //     console.log('selectedNode', newNode)
        // })

        $scope.clear = clear;
        $scope.setNextStateAndGetChanges = setNextStateAndGetChanges;
        $scope.setFirstConjecture = setFirstConjecture;
        $scope.conjectures = conjectures();
        $scope.selectNode = selectNode;

        $scope.selectedNode = null;
        $scope.arrowUnit = 36; //px
        $scope.offset = 22; //px

        // TEMP
        $scope.log = function(thing) {
            console.log(thing);
        }

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
                $localStorage.ada[PUZZLE_NUM].history[$scope.jsonUrl] = [];
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

            // $scope.selectedNode = $scope.grid.nodes[2][4]; // TEMP
            // $scope.selectedNode.number = 5;
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
                setUpBoard(data, loadHistory(jsonUrl));
                $scope.answer = loadAnswer(jsonUrl, data.answerLength);
                $scope.showLetters = false;
                $scope.answerLength = data.answerLength;
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
                $localStorage.ada = $localStorage.ada || {};
                $localStorage.ada[PUZZLE_NUM] = $localStorage.ada[PUZZLE_NUM] || {};
                $localStorage.ada[PUZZLE_NUM].history = $localStorage.ada[PUZZLE_NUM].history || {};
                $localStorage.ada[PUZZLE_NUM].history[namespace] = $localStorage.ada[PUZZLE_NUM].history[namespace] || [];
                return $localStorage.ada[PUZZLE_NUM].history[namespace];
            }

            function loadAnswer(namespace, length) {
                $localStorage.ada[PUZZLE_NUM].answer = $localStorage.ada[PUZZLE_NUM].answer || {};
                $localStorage.ada[PUZZLE_NUM].answer[namespace] = $localStorage.ada[PUZZLE_NUM].answer[namespace] || '';
                return $localStorage.ada[PUZZLE_NUM].answer[namespace];
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

        function setFirstConjecture(setTo) {
            $scope.firstConjecture = setTo;
        }

        /**
         * Select the node passed in if it has a number.
         */
        function selectNode(node, toggle) {
            if (!node.number || node.type === 'hole') { return; }
            var nodeIsSelected = $scope.selectedNode === node;
            $scope.selectedNode = nodeIsSelected && toggle ? null : node;
        }
    }

])
.filter('puzzleNameFormat', function() {
    return puzzleNameFormat;
})
.directive('ngRightClick', function($parse) { // stolen from http://stackoverflow.com/questions/15731634/how-do-i-handle-right-click-events-in-angular-js
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})
.directive('puzzleLegend', function() {return {restrict: 'E', templateUrl: './legend.html'};})
.directive('todo', function() {return {restrict: 'E', templateUrl: './todo.html'};})
.directive('alerts', function() {return {restrict: 'E', templateUrl: './alerts.html'};})
// FIXME move the sharebuttons stuff to a general angular module that's required here
.directive('shareButtons', function() {return {restrict: 'E', templateUrl: './share-buttons.html'};})
.directive('twitterIcon', function() {return {restrict: 'E', templateUrl: '/assets/svg/twitter-icon.html'};})
.directive('facebookIcon', function() {return {restrict: 'E', templateUrl: '/assets/svg/facebook-icon.html'};})

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

            return {
                row: i,
                column: j,
                state: {
                    up: null,
                    down: null,
                    left: null,
                    right: null,
                },
                type: data && data.type,
                childNode: null, // child nodes are downstream golf shots
                parentNode: null, // tee nodes are the parents of all below
                direction: null, // FIXME don't need this any longer
                number: Number(number) === number ? number : null,
                letter: data && data.letter,
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
                    ];

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
        if (!nodeData || !attr) {
            console.error('no inputs can be empty, you gave:',
               'nodeData = ', nodeData,
               'row = ', row,
               'column = ', column,
               'attr = ', attr,
               'value = ', value
            );
        }
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
function setNextStateAndGetChanges(type, direction, node, nodes, conjecturesEnabled) {
    // console.log(node);

    if (type !== 'direction' && type !== 'state') {
        throw new Error('unknown change type');
    }

    if (type === 'state') {
        var newState = !node.state[direction];
        var stateChange = {
            row: node.row,
            column: node.column,
            type: type,
            state: {},
            conjecture: conjecturesEnabled,
        };
        stateChange.state[direction] = {
            from: node.state[direction],
            to: newState,
        };

        // MUTATE
        node.state[direction] = newState;
        return {changes: [stateChange]};
    }

    if (node.direction && conjecturesEnabled && !node.conjecture) {
      return; // don't trounce a real state with conjecture
    }
    var newDirection = node.direction ? null : direction;

    // a change is a part of a history chain
    var directionChange = {
        row: node.row,
        column: node.column,
        type: type,
        direction: {
            from: node.direction,
            to: newDirection
        },
        conjecture: conjecturesEnabled,
    };

    var childNode = getNodeInDirection(direction, node, nodes);
    var newNumber = newDirection ? node.number - 1 : null;
    var numberChange = {
        row: childNode.row,
        column: childNode.column,
        type: 'number',
        number: {
            from: node.number,
            to: newNumber,
        },
    };

    // MUTATE!
    node.direction = newDirection;
    node.conjecture = conjecturesEnabled;

    childNode.number = newNumber;
    // if (conjecturesEnabled && firstConjecture) {
    //   node.firstConjecture = true;
    //   change.firstConjecture = true;
    // }

    return {changes: [directionChange, numberChange]};

    function getNodeInDirection(direction, node, nodes) {
        if (Number(node.number) !== node.number) { return; }
        return nodes[getRow(direction, node)][getColumn(direction, node)];

        function getColumn(direction, node) {
            return {
                up: 0,
                down: 0,
                left: -1,
                right: 1,
            }[direction] * node.number + node.column;
        }

        function getRow(direction, node) {
            return {
                up: -1,
                down: 1,
                left: 0,
                right: 0,
            }[direction] * node.number + node.row;
        }
    }
}

function validate(numColumns, numRows) {
    if (!numColumns || !numRows) {
        throw new Error('You must initialize validator with number of rows and columns.');
    }
    var LIMIT = numColumns * numRows; //max number of neighbors to follow, prevents infinite while loop

    var alerts = {};
    resetAlerts();

    return {
        alerts: alerts,
        node: validateNode,
        row: validateRow,
        column: validateColumn,
        redo: redoValidation,
        complete: checkPuzzleComplete,
    };

    /**
     * a data structure to contain the count of nodes with validation problems
     */
    function resetAlerts() {
        alerts.adjacentFilledNeighbors = 0;

        alerts.notAllSquaresFilled = 0;
        alerts.notAllBlanksConnected = 0;
        alerts.puzzleComplete = 0;
    }

    function validateNodes(nodes) {
        nodes.forEach(function(n) {
            validateNode(n, nodes);
        });
    }

    function validateNode(node, nodes) {
        adjacentFilledNeighborsTest(node);
        node.neighbors.forEach(adjacentFilledNeighborsTest)
    }

    function adjacentFilledNeighborsTest(node) {
        var invalidReason = 'adjacentFilledNeighbors';
        if (nodeIsFilled(node) && node.neighbors.some(nodeIsFilled)) {
            addNodeInvalidReason(node, invalidReason);
        }
        else {
            removeNodeInvalidReason(node, invalidReason);
        }
    }

    function nodeIsFilled(node) {
        return node && node.state === 'filled';
    }

    function validateRow(nodes, row) {
        validateLineOfNodes(nodes[row], {left: 'before', right: 'after'});
    }

    function validateColumn(nodes, col) {
        validateLineOfNodes(getColumn(nodes), {up: 'before', down: 'after'});

        function getColumn(nodes) {
            return nodes.map(getColNodeFromRow);

            function getColNodeFromRow(row) {
                return row[col];
            }
        }
    }

    function validateLineOfNodes(nodes, directions) {
        var nodeCountsByIndex = getFilledAndEmptyNodeCounts(nodes);
        nodes.forEach(validateClue);

        function validateClue(node, i) {
            if (!isClue(node) || !isCorrectClueDirection(node)) { return; }

            var counts = nodeCountsByIndex[directions[node.direction]];

            var overSaturateMarkFunction = overSaturated(node) ? addNodeInvalidReason : removeNodeInvalidReason;
            overSaturateMarkFunction(node, 'overSaturatedClue');

            var underSaturateMarkFunction = underSaturated(node) ? addNodeInvalidReason : removeNodeInvalidReason;
            underSaturateMarkFunction(node, 'underSaturatedClue');

            setNodeCompleteState(node, justRight(node));

            function overSaturated(node) {
                return trueNode(node) && node.number < counts.filled[i];
            }

            function justRight(node) {
                return trueNode(node) && node.number === counts.filled[i];
            }

            function underSaturated(node) {
                return trueNode(node) && counts.filled[i] + counts.empty[i] < node.number;
            }

            function isClue(node) {
                return Number(node.number) === node.number;
            }

            function trueNode(node) {
                return node.state === 'blank';
            }

            function isCorrectClueDirection(node) {
                return Object.keys(directions).indexOf(node.direction) !== -1;
            }
        }

    }

    /**
     * Count the number of nodes after and before the current index which are filled and empty
     */
    function getFilledAndEmptyNodeCounts(nodes) {
        var result = {
            before: {
                filled: [],
                empty: []
            },
            after: {
                filled: [],
                empty: []
            },
        };
        var filledHere = 0;
        var emptyHere = 0;
        for (var i = 0; i < nodes.length; i++) {
            result.before.filled[i] = filledHere;
            result.before.empty[i] = emptyHere;
            var nodeState = nodes[i].state;
            if (nodeState === 'filled') {
                filledHere += 1;
            }
            if (nodeState === null) {
                emptyHere += 1;
            }
        }

        // do the same thing backwards (couldn't think of an easy way to DRY this up)
        filledHere = 0;
        emptyHere = 0;
        for (var i = nodes.length - 1; i >= 0; i--) {
            result.after.filled[i] = filledHere;
            result.after.empty[i] = emptyHere;
            var nodeState = nodes[i].state;
            if (nodeState === 'filled') {
                filledHere += 1;
            }
            if (nodeState === null) {
                emptyHere += 1;
            }
        }
        return result;
    }

    function addNodeInvalidReason(node, reason) {
        node.invalidReasons = node.invalidReasons || {};
        if (node.invalidReasons[reason]) { return; } // already set, nothing to do
        node.invalidReasons[reason] = true;
        updateAlertCount(alerts, reason, 1);
    }

    function removeNodeInvalidReason(node, reason) {
        if (!node || !node.invalidReasons || !node.invalidReasons[reason]) {
            // can't remove a value when no invalidReasons set
            // and can't remove a specific one if it wasn't there in the first place
            return;
        }

        delete node.invalidReasons[reason];
        updateAlertCount(alerts, reason, -1);
    }

    function setNodeCompleteState(node, complete) {
        node.complete = !!complete;
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

        alerts[alertType] += updateAmount;
    }


    function redoValidation(grid) {
        resetAlerts();
        clearValidation(grid);
        utility().forAllNodes(grid.nodes, revalidateNode);

        grid.nodes.forEach(function(row, i) {
            validateRow(grid.nodes, i);
            row.forEach(function(node, j) {
                validateColumn(grid.nodes, j);
            });
        });

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

    function checkPuzzleComplete(grid, conjecturesEnabled) {
        if (conjecturesEnabled) {
            alert('You must exit Conjecture Mode by clearing or accepting conjectures before checking puzzle completeness.')
            return;
        }
        redoValidation(grid);
        // console.log('checking')
        for (type in alerts) {
            if (alerts[type]) { console.log(alerts); return; } // validation problem, can't be complete
        }

        var reason = 'notAllSquaresFilled';
        var nodeWithoutState = findNodeWithoutState(grid.nodes);
        if (nodeWithoutState) {
            updateAlertCount(alerts, reason, -1); // so it never goes above one
            updateAlertCount(alerts, reason, 1);
        }

        reason = 'notAllBlanksConnected';
        var numberRegions = numberOfConnectedBlankRegions(grid.nodes);
        if (numberRegions > 1) {
            updateAlertCount(alerts, reason, -100);
            updateAlertCount(alerts, reason, numberRegions);
            return;
        }

        updateAlertCount(alerts, 'puzzleComplete', -1);
        updateAlertCount(alerts, 'puzzleComplete', 1);

        function findNodeWithoutState(nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var row = nodes[i];
                for (var j = 0; j < row.length; j++) {
                    var node = row[j];
                    // console.log(i, j, node)
                    if (!node.state) {return node;}
                }
            }
        }

        function numberOfConnectedBlankRegions(nodes) {
            var regionTag = nodes.map(function(row) { return []; });
            var regionToRegionId = {};
            var currentTag = 0;

            // TODO this loop is crazy big, break it up into some nice small functions
            for (var i = 0; i < nodes.length; i++) {
                var row = nodes[i];
                for (var j = 0; j < row.length; j++) {
                    var node = row[j];
                    // console.log(i, j, node)
                    if (node.state !== 'blank') { continue; }
                    var thisTag = regionTag[i][j];
                    if (!thisTag) {
                        currentTag += 1;
                        regionToRegionId[currentTag] = currentTag;
                        thisTag = currentTag;
                        regionTag[i][j] = thisTag;
                    }
                    var rightNeighbor = nodes[i][j+1];
                    if (rightNeighbor && rightNeighbor.state === 'blank') {
                        rightTag = regionTag[i][j+1];
                        if (rightTag) {
                            // point larger regions at smallest tag
                            pointToSmallestRegion(rightTag, thisTag);
                        }
                        else {
                            regionTag[i][j+1] = thisTag;
                        }
                    }
                    var belowNeighbor = nodes[i+1] && nodes[i+1][j];
                    if (belowNeighbor && belowNeighbor.state === 'blank') {
                        regionTag[i+1][j] = thisTag;
                    }

                }
            }

            var numRegions = 0;
            for (r in regionToRegionId) {
                if (parseInt(r, 10) === regionToRegionId[r]) { numRegions += 1; }
            }
            console.log('regionToRegionId', regionToRegionId);
            console.log('regionTag', regionTag)
            console.log('numRegions', numRegions)
            return numRegions;

            // now count all the regions that are pointing to their same Id, they're the unique regions

            function pointToSmallestRegion(region1, region2) {
                var uniqueRegions = {};
                uniqueRegions[region1] = true;
                uniqueRegions[region2] = true;

                // iterate down through region->regionIds until you arrive at one where they're equal
                // do this for region1 and 2 and use a hash to keep the unique regions visited
                var region = region1;
                region_id = regionToRegionId[region1];
                while (region_id !== region) {
                    uniqueRegions[region_id] = true;
                    region = region_id;
                    region_id = regionToRegionId[region];
                }

                var region = region2;
                region_id = regionToRegionId[region2];
                while (region_id !== region) {
                    uniqueRegions[region_id] = true;
                    region = region_id;
                    region_id = regionToRegionId[region];
                }

                // find the lowest region from those given
                var uniqueRegions = Object.keys(uniqueRegions);
                uniqueRegions.sort();
                var lowestRegionId = parseInt(uniqueRegions[0], 10);

                // set all the regions to be the same lowest regionId
                uniqueRegions.forEach(function(region) {
                    regionToRegionId[region] = lowestRegionId;
                });
            }
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
        delete node.firstConjecture;
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
        markConjecturesAsTruth: markConjecturesAsTruth,
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
            console.log('change', change)
            var nodeToUpdate = grid.nodes[change.row][change.column];
            // verifyNodeStateBeforeChange(nodeToUpdate, change);
            if (change.direction !== undefined) {
                nodeToUpdate.direction = change.direction.to;
            }
            if (change.number !== undefined) {
                nodeToUpdate.number = change.number.to;
            }
            if (change.state !== undefined) {
                var direction = Object.keys(change.state)[0];
                nodeToUpdate.state[direction] = change.state[direction].to;
            }
            if (change.conjecture) {
                nodeToUpdate.conjecture = true;
            }
        }

        // function verifyNodeStateBeforeChange(node, change) {
        //     if (node.direction !== change.direction.from) {
        //         var msg = 'node direction differs from expected.'
        //         console.error(msg + ' node', node, 'change', change);
        //         // This does appear to happen in the wild so I messed something up somewhere, seems better for users
        //         // to continue on rather than throwing an error
        //         // throw new Error(msg);
        //     }
        // }
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

