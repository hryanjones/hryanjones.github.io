const React = require('react');
const _ = {
  constant: require('lodash/constant'),
  chunk: require('lodash/chunk'),
  clone: require('lodash/clone'),
  zip: require('lodash/zip'),
};
const LocalStorageMixin = require('react-localstorage');
const NUM = '29'; // puzzle number
const EXAMPLE = 'example' + NUM;
const PUZZLE = 'aenigma' + NUM;

const Node = require('./Node.jsx');
const ControlButtons = require('./ControlButtons.jsx');

const PUZZLES = {};
PUZZLES[EXAMPLE] = {
  nodesTemplate:  '       3  3          0  3        _ 31         5  ',
  porchesTemplate:'       N  W          E  E        N SN         W  ',
  width: 7,
  puzzleName: EXAMPLE,
  conjectureMode: false,
};
PUZZLES[PUZZLE] = {
  nodesTemplate:  '   1  5     _  _              2        _   4   _    2   _                 3     4  6   1   6      _      ' +
                  '_    4   7            _         2   2    7      _      _    _   3 _     _                 3   5    3   2 ' +
                  '  2        _              4  _     5  3   ',
  porchesTemplate:'   E  S     E  E              S        S   S   E    E   W                 E     W  N   N   N      E      ' +
                  'S    E   W            S         E   E    S      W      E    W   E S     N                 S   E    S   W ' +
                  '  E        W              W  N     E  E   ',
  width: 21,
  puzzleName: PUZZLE,
  conjectureMode: false,
};
  // ('aenigma' + NUM): {
  //   nodesTemplate: '5 3 4               9          5      4          5   7  6     7   5    2    6 2  6      7     6      9  5 6       4                      4       A 5  5      3     3      5  5 6    4    8   4     5  7   3          6      9          6               4 6 8',
  //   width: 21,
  //   puzzleName: 'aenigma-28',
  //   conjectureMode: false,
  // }
// };

PUZZLES[EXAMPLE].nodes = __convertTemplateToNodes(PUZZLES[EXAMPLE]);
PUZZLES[PUZZLE].nodes = __convertTemplateToNodes(PUZZLES[PUZZLE]);

let PuzzleChangeTabs = React.createClass({
  getInitialState() {
    return { puzzleName: EXAMPLE };
  },
  mixins: [LocalStorageMixin],
  getLocalStorageKey() { return this.state.puzzleName; },
  componentWillUpdate(nextProps, nextState) {
    if (nextState.puzzleName === this.state.puzzleName) { return; }
    console.log('nextState.puzzleName', nextState.puzzleName)
    console.log('this.state.puzzleName', this.state.puzzleName)
    this.props.setPuzzle(nextState);
  },
  setAenigma() {
    this.setState({puzzleName: PUZZLE});
  },
  setExample() {
    this.setState({puzzleName: EXAMPLE});
  },
  render() {
    var exampleSelected = this.state.puzzleName === EXAMPLE;
    return (
      <form id="tabs">
        <label onClick={this.setExample} className={'tab h4' + (exampleSelected ? ' selected' : '')}>
          example
        </label>
        <label onClick={this.setAenigma} className={'tab h4' + (exampleSelected ? '' : ' selected')}>
          Ænigma #29
        </label>
      </form>
    );
  },
});

var PuzzleBoard = React.createClass({
  getInitialState: _.constant(PUZZLES[EXAMPLE]),
  mixins: [LocalStorageMixin],
  getLocalStorageKey() { return this.state.puzzleName + 'conjectureMode'; },
  getStateFilterKeys() {
    return ['conjectureMode']; // only need to save conjecture mode for each puzzle as pieces keep track of their own state
  },
  resetBoard() {
    var keyPrefix = this.state.puzzleName;
    this.state.nodes.forEach(__removeStoredConnectionStates);
    localStorage.removeItem(this.state.puzzleName);
    location.reload();

    function __removeStoredConnectionStates(node) {
      localStorage.removeItem(keyPrefix + node.key + 'right');
      localStorage.removeItem(keyPrefix + node.key + 'down');
    }
  },
  // FIXME this is messy and open to abuse
  setPuzzleState(newState) {
    this.setState(newState);
  },
  setPuzzle(newPuzzle) {
    var newPuzzleName = newPuzzle.puzzleName;
    if (newPuzzleName && newPuzzleName !== this.state.puzzleName) {
      this.setState(PUZZLES[newPuzzleName]);
    }
  },
  render() {
    var keyPrefix = this.state.puzzleName;
    var conjectureMode = this.state.conjectureMode;
    var rows  = _.chunk(this.state.nodes , this.state.width);
    var numRows = rows.length - 1; // to match last index
    let nodes = rows.map(__renderRow);

    return (
      <div>
        <PuzzleChangeTabs setPuzzle={this.setPuzzle}/>
        <div
          id="puzzle-board"
          onClick={this.__setNormalConjectureMode}
          onContextMenu={this.__setNormalConjectureMode}
          >
          {nodes}
        </div>
        <ControlButtons
          onPuzzleClear={this.resetBoard}
          conjectureMode={conjectureMode}
          onConjectureUpdate={this.setPuzzleState}
        />
      </div>
    );

    function __renderRow(nodes, i) {
      var numCols = nodes.length - 1; // to match last index
      return (
        <div className="puzzle-row row" key={i}>
          <div className="col-xs-12">
            {nodes.map(__renderNode)}
          </div>
        </div>
      );

      function __renderNode(node, j) {
        return (
          <Node
            numRows={numRows}
            numCols={numCols}
            col={j}
            row={i}
            conjectureMode={conjectureMode}
            value={node.value}
            porchSide={node.porchSide}
            key={node.key}
            nodeKey={node.key}
            keyPrefix={keyPrefix}
          />
        );
      }
    }

  },
  __setNormalConjectureMode() {
    if (this.state.conjectureMode && this.state.conjectureMode !== true) {
      this.setState({conjectureMode: true});
    }
  },

});

function __convertTemplateToNodes(puzzle) {

  return _.zip(puzzle.nodesTemplate.split(''), puzzle.porchesTemplate.split(''))
  .map(createNode);

  function createNode(input, i) {
    var nodeVal = input[0];
    if (nodeVal === ' ') {
      nodeVal = null;
    }
    else if (nodeVal === '_') {
      nodeVal = ' ';
    }
    else {
      nodeVal = parseInt(nodeVal, 10);
    }

    return {
      key: puzzle.puzzleName + i,
      value: nodeVal,
      porchSide: input[1],
      //connections // this is generated by the node
    };
  }
}

module.exports = PuzzleBoard;
