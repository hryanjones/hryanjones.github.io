const React = require('react');
const LocalStorageMixin = require('react-localstorage');

let Connection = React.createClass({
  mixins: [LocalStorageMixin],
  getInitialState() {
    console.log('localStorageKey', this.props.localStorageKey)
    return {
      value: null,
      // conjecture: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!this.state.conjecture) { return; }
    this.setState({
      value: !nextProps.conjectureMode ? null : this.state.value,
      conjecture: false // remove conjecture
    });
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
    if (this.state.value === 'connected') {
      className += ' connected';
    }
    if (this.state.value === 'blocked') {
      className += ' blocked';
    }
    if (this.state.conjecture) {
      className += ' conjecture'
    }

    return (
      <div
        className={className}
        onClick={this.__toggleState}
        onContext={this.__toggleNotPath}
        >
        <div className="line"/>
        <div className="x">x</div>
      </div>
    );
  },

  __toggleState() {
    var newState = {value: __getNextValue(this.state.value)};
    if (this.props.conjectureMode) {
      newState.conjecture = true;

      // don't clobber existing non-conjecture values
      if (!this.state.conjecture && this.state.value) {
        return;
      }
    }
    this.setState(newState);
  },
});

function __getNextValue(value) {
  if (!value) {
    return 'connected';
  }
  if (value === 'connected') {
    return 'blocked';
  }
  return null;
}

module.exports = Connection;
