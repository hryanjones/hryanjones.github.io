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

var PuzzleBoard = React.createClass({
  getInitialState: function() {
    return {
      cells: [{value: 4}, {value: null}, {value: null}, {value: null}, {value: null}, {value: 2}].map(__addKey),
      width: 3,
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
    var cells = _.chunk(this.state.cells, this.state.width).map(__renderRow);

    return (
      <div className="puzzle-board">
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
      return ( <Cell data={cell} key={cell.key} localStorageKey={cell.key + 1} /> );
    }
  }
});


module.exports = PuzzleBoard;
