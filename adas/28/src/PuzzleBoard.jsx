var React = require('react');
// var LocalStorageMixin = require('react-localstorage');
var _ = {
  chunk: require('lodash/chunk'),
  clone: require('lodash/clone'),
};

var Cell = require('./Cell.jsx');

/*
So, we need to be able to save the board's state at any time.
WHY AM I WORRYING ABOUT SAVING SPACE? -> NO NEED
To save space it's nice to store this in a simple string
representation that can be played back out. The following values should support this puzzle:
0. 0 -> stands for non "vistas" with an unknown state
1. 1->9->A (1-10 in hexadecimal), will stand for the "vistas" and the amount of path they can see
2. C -> (course) Path
3. F -> (forest) Tree

TODO: how to represent conjecture or not
*/

// var INPUT = '2 5  6            3   4   5   5            3  4 5'; // Example puzzle
var INPUT = `5 3 4               9          5      4          5   7  6     7   5    2    6 2  6      7     6      9  5 6       4                      4       A 5  5      3     3      5  5 5    4    8   4     5  7   3          6      9          6               4 6 8`;

function __TEMP(input) {
    return {
        value: (input === ' ' ? null : parseInt(input === 'A' ? 10 : input, 10))
    };
}

var PuzzleBoard = React.createClass({
  getInitialState: function() {
    return {
      cells: INPUT.split('').map(__TEMP).map(__addKey),
      // width: 7, // example
      width: 21,
      puzzleName: 'aenigma-28',
    };

    function __addKey(cell, i) {
      cell.key = i;
      return cell;
    }
  },
  // saveCellState: function(i, newValue) {
  //   var cells = _.clone(this.state.cells);
  //   cells[i].value = newValue;
  //   this.setState({cells: cells});
  // },
  render: function() {
    // var saveCellState = this.saveCellState;
    var keyPrefix = this.state.puzzleName;
    var cells = _.chunk(this.state.cells, this.state.width).map(__renderRow);

    return (
      <div id="puzzle-board">
        {cells}
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
      // return ( <Cell data={cell} key={cell.key} localStorageKey={cell.key + 1} onCellUpdate={saveCellState} /> );
      return ( <Cell data={cell} key={cell.key} localStorageKey={keyPrefix + cell.key} /> );
    }
  }
});


module.exports = PuzzleBoard;
