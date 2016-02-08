const React = require('react');
const LocalStorageMixin = require('react-localstorage');
const _ = {
  isFinite: require('lodash/isFinite'),
  isString: require('lodash/isString'),
};

var Cell = React.createClass({
  mixins: [LocalStorageMixin],
  componentWillReceiveProps(nextProps) {
    if (!this.state.conjecture) { return; }
    this.setState({
      value: nextProps.conjectureMode === 'reject' ? null : this.state.value, // remove value if clearing conjectures
      conjecture: false // remove conjecture
    });
  },
  getInitialState() {
    return this.props.data;
  },
  toggleCell(e, dum1, dum2, toggleTree) {
    e.preventDefault();
    if (__isVista(this)) { return; }
    var newValue = {value: __getNextState(this.state.value, toggleTree)};
    if (this.props.conjectureMode === true) {
      newValue.conjecture = true;
      if (this.state.value && this.state.conjecture !== true) { return; } // don't clobber existing values
    }
    if (!newValue.value) {
      newValue.conjecture = false;
    }
    this.setState(newValue);
  },
  toggleTree(e) {
    this.toggleCell(e, null, null, true);
  },
  render() {
    var val = this.state.value;
    var label = String((__isVista(this) && val) || '   ');
    var className = 'cell' + __getCellCSSModifier(val, this.state.conjecture);
    return (
      <div className={className} onClick={this.toggleCell} onContextMenu={this.toggleTree}>
        <div className="cell-label">
          {label}
        </div>
      </div>
    );

    function __getCellCSSModifier(val, isConjecture) {
      if (!val) { return '' + __addConjectureModifier(); }
      if (_.isFinite(val)) { return ' path' + __addConjectureModifier();}
      return ' ' + val + __addConjectureModifier();

      function __addConjectureModifier() {
        return isConjecture ? ' conjecture' : '';
      }
    }
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
