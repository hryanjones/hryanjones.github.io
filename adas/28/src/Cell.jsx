var React = require('react');
var LocalStorageMixin = require('react-localstorage');
var _ = {
  isFinite: require('lodash/isFinite'),
};

var Cell = React.createClass({
  mixins: [LocalStorageMixin],
  getInitialState: function() {
    return this.props.data;
  },
  toggleCell: function(e, dum1, dum2, toggleTree) {
    e.preventDefault();
    if (__isVista(this)) { return; }
    var newValue = {value: __getNextState(this.state.value, toggleTree)};
    this.setState(newValue);
    // this.props.onCellUpdate(this.props.key, __getNextState(this.state.value, toggleTree));
  },
  toggleTree: function(e) {
    this.toggleCell(e, null, null, true);
  },
  render: function() {
    return (
      <span className="cell" onClick={this.toggleCell} onContextMenu={this.toggleTree}>
        {String(this.state.value)}
      </span>
    );
  }
});

/**
 * Determines whether the given cell is a vista cell. Otherwise it's a tree or part of the path.
 */
function __isVista(cell) {
  return _.isFinite(cell.state.value);
}

/**
 * Given the current value and whether or not we're just toggling the tree, determine what's the next state.
 * toggleTree means that it always goes between null and tree: path -> null -> tree -> null -> tree
 * Otherwise, cycles like this: null -> path -> tree -> null
 */
function __getNextState(current, toggleTree) {
  if (!current) {
    return toggleTree ? 'tree' : 'path';
  }
  if (toggleTree || current === 'tree') {
    return null;
  }
  return 'tree';
}

module.exports = Cell;
