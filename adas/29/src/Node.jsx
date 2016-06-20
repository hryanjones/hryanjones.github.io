/* global Connection */
const React = require('react');
const _ = {
  isFinite: require('lodash/isFinite'),
  isString: require('lodash/isString'),
  constant: require('lodash/constant'),
  map: require('lodash/map'),
};

const porchToDir = {N: 'North', E: 'East', S: 'South', W: 'West'};

const Connection = require('./Connection.jsx');

let Node = React.createClass({
  getInitialState: _.constant(null), // nodes don't store any state
  render() {
    let title = this.props.value !== null ?
      `A house where the owner talks a walk with ${this.props.value} turns from their ${porchToDir[this.props.porchSide]}-side porch.` :
        null;
    let connections = this.props.connections;
    let onConnectionClick = this.props.onConnectionClick;
    let nodeKey = this.props.nodeKey;

    return (
      <div className={'node porch-' + this.props.porchSide} title={title}>
        {this.props.value !== null ?
          <div>
            <div className="node-label">{this.props.value}</div>
            <div className="porch"/>
          </div>
          : null
        }
        {_.map(this.props.connections, (connection, side) =>
          <Connection
            connectionPath={[nodeKey, 'connections', side]}
            key={[nodeKey, side].join('')}
            type={side}
            value={connection.value}
            conjecture={connection.conjecture}
            invalidReason={connection.invalidReason}
            onConnectionClick={onConnectionClick}
          />
        )}
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
