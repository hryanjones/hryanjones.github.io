const React = require('react');
const _ = {
  isInteger: require('lodash/isInteger'),
  isString: require('lodash/isString'),
  constant: require('lodash/constant'),
  map: require('lodash/map'),
};
const LocalStorageMixin = require('react-localstorage');

let Node = React.createClass({
  stateFilterKeys: ['conjecture', 'line'],
  mixins: [LocalStorageMixin],

  getInitialState: _.constant({
    conjecture: false,
    line: null,
  }),

  componentWillReceiveProps(newProps) {
    if (!newProps.conjectureMode && this.props.conjectureMode && this.state.conjecture) {
      this.setState(this.getInitialState());
    }
  },

  render() {
    let {linesFacing, connectedLines, letter} = this.props;
    let {line, conjecture} = this.state;
    let title = 'TODO';
    let isFacing = _.isInteger(linesFacing) || letter === '_';

    let className = 'node';
    if (letter) {
      className += ' letter';
    } else {
      className += ' number';
    }
    if (isFacing) {
      className += ' black';
    } else {
      className += ' white';
    }

    if (conjecture) {
      className += ' ' + conjecture;
    }

    return (
      <div className={className} title={title} onClick={this._onClick}>
        <div className='node-label'>
          {letter ? letter : (isFacing ? linesFacing : connectedLines)}
        </div>
        {line ?
          <div className={
            (line === '_' ? 'horizontal ' : 'vertical ') + 'line'}
          />
        :null}
      </div>
    );
  },

  _onClick() {
    let {line, conjecture} = this.state;
    let {linesFacing, conjectureMode} = this.props;
    let dontChangeExistingNodeToConjecture = conjectureMode && line && !conjecture;
    if (_.isInteger(linesFacing) || dontChangeExistingNodeToConjecture) {
      return;
    }

    let newState = {line, conjecture};

    switch(line) {
    case '|':
      newState.line = '_';
      break;
    case null:
      newState.line = '|';
      break;
    case '_':
      newState.line = null;
      break;
    }

    if (conjecture !== 'first-conjecture') {
      newState.conjecture = conjectureMode;
    }

    this.setState(newState);
    this.props.onClickNode(newState);
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
