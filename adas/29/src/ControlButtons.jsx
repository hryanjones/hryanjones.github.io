/*
TODO flesh this out some more

thinking about conjecture mode:
false -- off and never was on
'accept' -- was on and want to accept the changes
'clear' -- was on and want to clear the changes
true -- on
*/
const React = require('react');

var ControlButtons = React.createClass({
  render() {
    return (<div>
        <ConjectureModeButtons
          conjectureMode={this.props.conjectureMode}
          onConjectureUpdate={this.props.onConjectureUpdate}
        />{' '}
        <ClearPuzzleButton onPuzzleClear={this.props.onPuzzleClear} />
    </div>);
  },
});

var ClearPuzzleButton = React.createClass({
  clearPuzzle() {
    var response = window.confirm('Are you sure you want to clear your progress? (cannot be undone)');
    if (!response) { return; }
    console.log('clearing board');
    this.props.onPuzzleClear({clear: true});
  },
  render() {
    return (
      <div className="btn btn-danger" onClick={this.clearPuzzle}>
        <i className="glyphicon glyphicon-trash"></i>{' '}
        Clear Puzzle Progress
      </div>
    );
  },
});

var ConjectureModeButtons = React.createClass({
  toggleConjectureMode() {
    this.props.onConjectureUpdate({
      conjectureMode: !this.props.conjectureMode,
    });
  },
  render() {
    //  ng-class="{'bg-info text-info info-bubble block': conjectures.enabled}"
    var mode = this.props.conjectureMode === true;
    return (
      <span className={
          'conjecture-container' + (mode ? ' bg-info text-info info-bubble block clearfix' : '')
        }>
        <div className="col-md-2">
          <button className="btn btn-primary" onClick={this.toggleConjectureMode}>
            <input type="checkbox" checked={mode}/>{' '}
            Conjecture Mode
            {mode ? (<strong><br/>Clear Conjectures</strong>) : ''}
          </button>
        </div>
        {
          mode ?
          (
            <div className="col-md-10">
                <i className="glyphicon glyphicon-info-sign"></i>{' '}
                In <em>conjecture mode</em> all of your actions will be marked in gray with question marks (?) so that you can make temporary assumptions. When {"you're"} done <em>Clear all conjectures</em>.
            </div>
          ) :
          ''
        }
      </span>
    );
  },
});

module.exports = ControlButtons;
