/* global Connection */
const React = require('react');
const _ = {
  isFinite: require('lodash/isFinite'),
  isString: require('lodash/isString'),
  constant: require('lodash/constant'),
};

const porchToDir = {N: 'North', E: 'East', S: 'South', W: 'West'};

const Connection = require('./Connection.jsx');

let Node = React.createClass({
  getInitialState: _.constant(null), // nodes don't store any state
  // toggleNode(e, dum1, dum2, toggleTree) {
  //   e.preventDefault();
  //   if (__isVista(this)) { return; }
  //   if (!toggleTree && e.shiftKey) {
  //     toggleTree = true;
  //   }
  //   var newValue = {value: __getNextState(this.state.value, toggleTree)};
  //   if (this.props.conjectureMode === true) {
  //     newValue.conjecture = true;
  //     if (this.state.value && this.state.conjecture !== true) { return; } // don't clobber existing values
  //   }
  //   if (!newValue.value) {
  //     newValue.conjecture = false;
  //   }
  //   this.setState(newValue);
  // },
  // toggleTree(e) {
  //   this.toggleNode(e, null, null, true);
  // },
  render() {
    let title = this.props.value !== null ?
      `A house where the owner talks a walk of ${this.props.value} turns from their ${porchToDir[this.props.porchSide]}-side porch.` :
        null;
    return (
      <div className={'node porch-' + this.props.porchSide} title={title}>
        {this.props.value !== null ?
          <div>
            <div className="node-label">{this.props.value}</div>
            <div className="porch"/>
          </div>
          : null
        }
        <Connection
          type="right"
          conjectureMode={this.props.conjectureMode}
          numCols={this.props.numCols}
          col={this.props.col}
          localStorageKey={this.props.keyPrefix + this.props.nodeKey + 'right'}
        />
        <Connection
          type="down"
          conjectureMode={this.props.conjectureMode}
          numRows={this.props.numRows}
          row={this.props.row}
          localStorageKey={this.props.keyPrefix + this.props.nodeKey + 'down'}
        />
      </div>
    );
  },
});

/**
 * Given the current value and whether or not we're just toggling the tree, determine what's the next state.
 * toggleTree means that it always goes between null and tree: path -> null -> tree -> null -> tree
 * Otherwise, cycles like this: null -> path -> tree -> null
 */
// function __getNextState(current, toggleTree) {
//   if (!current) {
//     return toggleTree ? 'tree' : 'path';
//   }
//   if (toggleTree || current === 'tree') {
//     return null;
//   }
//   return 'tree';
// }

module.exports = Node;
