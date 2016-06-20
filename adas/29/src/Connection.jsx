const _ = {
  toString: require('lodash/toString'),
};
const React = require('react');
// const LocalStorageMixin = require('react-localstorage');

let Connection = React.createClass({
  // mixins: [LocalStorageMixin],

  // FIXME need to move this up
  // componentWillReceiveProps(nextProps) {
  //   let thisIsAConjecture = this.state.conjecture;
  //   let conjectureModeWasTurnedOff = this.props.conjectureMode && !nextProps.conjectureMode;
  //   if (thisIsAConjecture && conjectureModeWasTurnedOff) {
  //     this.setState({
  //       value: null,
  //       conjecture: false, // remove conjecture
  //     });
  //   }
  // },


  render() {
    let className = this.props.type === 'right' ?
      'connection right' :
      'connection down';
    let title = '';
    if (this.props.value) {
      className += ' ' + this.props.value;
    }
    if (this.props.conjecture) {
      className += ' conjecture';
      if (this.props.conjecture === 'first-conjecture') {
        className += ' ' + _.toString(this.props.conjecture);
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
    var newValue = __getNextValue(this.props.value, toggleNotPath);
    let connectionPath = this.props.connectionPath;
    console.log({connectionPath, newValue})
    this.props.onConnectionClick(connectionPath, newValue);

    // FIXME this needs to be moved to the top level
    // if (this.props.conjectureMode) {
    //   newState.conjecture = this.props.conjectureMode;

    //   // don't clobber existing non-conjecture values
    //   if (!this.state.conjecture && this.state.value) {
    //     return;
    //   }
    // }
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
