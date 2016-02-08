const React = require('react');
const _ = {
  constant: require('lodash/constant'),
  chunk: require('lodash/chunk'),
  clone: require('lodash/clone'),
};
const queryString = require('query-string');
const LocalStorageMixin = require('react-localstorage');

var Cell = require('./Cell.jsx');
var ControlButtons = require('./ControlButtons.jsx');

const PUZZLES = {
  example: {
    cellsTemplate: '2 5  6            3   4   5   5            3  4 5',
    width: 7,
    puzzleName: 'example',
    conjectureMode: false,
  },
  'aenigma-28': {
    cellsTemplate: '5 3 4               9          5      4          5   7  6     7   5    2    6 2  6      7     6      9  5 6       4                      4       A 5  5      3     3      5  5 6    4    8   4     5  7   3          6      9          6               4 6 8',
    width: 21,
    puzzleName: 'aenigma-28',
    conjectureMode: false,
  }
};

PUZZLES.example.cells = PUZZLES.example.cellsTemplate.split('').map(__convertTemplateToCells).map(__addKey);
PUZZLES['aenigma-28'].cells = PUZZLES['aenigma-28'].cellsTemplate.split('').map(__convertTemplateToCells).map(__addKey);

function __addKey(cell, i) {
  cell.key = i;
  return cell;
}

const SELECTED_PUZZLE = PUZZLES[queryString.parse(location.search).puzzle || 'example'] || PUZZLES['example'];

var PuzzleChangeTabs = React.createClass({
  render() {
    var exampleSelected = SELECTED_PUZZLE.puzzleName === 'example';
    return (
      <form id="tabs">
        <a href="?puzzle=example" className={'tab h4' + (exampleSelected ? ' selected' : '')}>
          example
        </a>
        <a href="?puzzle=aenigma-28" className={'tab h4' + (exampleSelected ? '' : ' selected')}>
          Ænigma #28
        </a>
      </form>
    );
  }
});

var PuzzleBoard = React.createClass({
  getInitialState: _.constant(SELECTED_PUZZLE),
  mixins: [LocalStorageMixin],
  getLocalStorageKey() { return this.state.puzzleName; },
  getStateFilterKeys() {
    return ['conjectureMode']; // only need to save conjecture mode for each puzzle as pieces keep track of their state
  },
  resetBoard(e) {
    var response = window.confirm('Are you sure you want to clear your progress? (cannot be undone)');
    if (!response) { return; }
    var keyPrefix = this.state.puzzleName;
    this.state.cells.forEach(__removeStoredCellState);
    localStorage.removeItem(this.state.puzzleName);
    location.reload();

    function __removeStoredCellState(cell) {
      localStorage.removeItem(keyPrefix + cell.key);
    }
  },
  setConjectureMode(newMode) {
    this.setState(newMode);
  },
  render() {
    if (this.state.cells[175].value === 5) { // TEMP made a mistake in original board
      localStorage.removeItem(this.state.puzzleName);
      location.reload();
    }
    var keyPrefix = this.state.puzzleName;
    var conjectureMode = this.state.conjectureMode;
    var cells = _.chunk(this.state.cells, this.state.width).map(__renderRow);

    return (
      <div>
        <PuzzleChangeTabs />
        <div id="puzzle-board">
          {cells}
        </div>
        <ControlButtons
          onPuzzleClear={this.resetBoard}
          conjectureMode={this.state.conjectureMode}
          onConjectureUpdate={this.setConjectureMode}
        />
      </div>
    );

    function __renderRow(cells, i) {
      return (
        <div className="puzzle-row row" key={i}>
          <div className="col-xs-12">
            {cells.map(__renderCell)}
          </div>
        </div>
      );
    }

    function __renderCell(cell) {
      return (
        <Cell
          conjectureMode={conjectureMode}
          data={cell}
          key={cell.key}
          localStorageKey={keyPrefix + cell.key}
        />
      );
    }
  }
});

function __convertTemplateToCells(input) {
    return {
        value: (input === ' ' ? null : parseInt(input === 'A' ? 10 : input, 10))
    };
}

module.exports = PuzzleBoard;
