const _ = {
  toString: require('lodash/toString'),
};
const React = require('react');
const LocalStorageMixin = require('react-localstorage');

let Connection = React.createClass({
  mixins: [LocalStorageMixin],
  getInitialState() {
    // console.log(this.props.localStorageKey);
    return {
      value: null,
      // conjecture: false
    };
  },

  componentWillReceiveProps(nextProps) {
    let thisIsAConjecture = this.state.conjecture;
    let conjectureModeWasTurnedOff = this.props.conjectureMode && !nextProps.conjectureMode;
    if (thisIsAConjecture && conjectureModeWasTurnedOff) {
      this.setState({
        value: null,
        conjecture: false, // remove conjecture
      });
    }
  },


  render() {
    let lastColumn = this.props.numCols && this.props.numCols === this.props.col;
    let lastRow = this.props.numRows && this.props.numRows === this.props.row;
    if (lastColumn || lastRow) {
      return (<span/>);
    }

    let className = this.props.type === 'right' ?
      'connection right' :
      'connection down';
    let title = '';
    if (this.state.value === 'connected') {
      className += ' connected';
    }
    if (this.state.value === 'blocked') {
      className += ' blocked';
    }
    if (this.state.conjecture) {
      className += ' conjecture';
      if (this.state.conjecture === 'first-conjecture') {
        className += ' ' + _.toString(this.state.conjecture);
        title = 'First conjecture'
      }
    }

    return (
      <div
        className={className}
        onClick={this.__toggleState}
        onContextMenu={this.__toggleNotPath}
        title={title}
        >
        <div className="line"/>
        <div className="x">x</div>
      </div>
    );
  },

  __toggleState(e, dum1, dum2, toggleNotPath) {
    var newState = {value: __getNextValue(this.state.value, toggleNotPath)};
    if (this.props.conjectureMode) {
      newState.conjecture = this.props.conjectureMode;

      // don't clobber existing non-conjecture values
      if (!this.state.conjecture && this.state.value) {
        return;
      }
    }
    this.setState(newState);
  },
  __toggleNotPath(e) {
    e.preventDefault();
    this.__toggleState(null, null, null, true);
  },
});

function __getNextValue(value, toggleNotPath) {
  if (!value) {
    return toggleNotPath ? 'blocked' : 'connected';
  }
  if (value === 'connected') {
    return toggleNotPath ? null : 'blocked';
  }
  return null;
}

module.exports = Connection;
