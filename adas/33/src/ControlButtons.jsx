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
        <ClearPuzzleButton onPuzzleClear={this.props.onPuzzleClear} />{' '}
    </div>);
        // <Legend/>
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
      conjectureMode: this.props.conjectureMode ? false : 'first-conjecture',
    });
  },
  render() {
    let mode = this.props.conjectureMode;
    return (
      <div className={
          'conjecture-container' + (mode ? ' bg-info text-info info-bubble' : '')
        }>
        <button className="btn btn-primary" onClick={this.toggleConjectureMode}>
          <input type="checkbox" checked={mode}/>{' '}
          Conjecture Mode
          {mode ? (<strong><br/>Clear Conjectures</strong>) : ''}
        </button>
        {
          mode ?
          (
            <div>
                <i className="glyphicon glyphicon-info-sign"></i>{' '}
                In <em>conjecture mode</em> all of your actions will be marked in dotted gray so that you can make temporary assumptions. The first conjecture is highlighted with a border. When {"you're"} done <em>Clear all conjectures</em>.
            </div>
          ) :
          ''
        }
      </div>
    );
  },
});

let Legend = React.createClass({
  getInitialState() {
    // return {open: false};
    return {open: false};
  },
  render() {
    let open = this.state.open;
    return (
      <span className= {
          'conjecture-container' + (open ? ' bg-info text-info info-bubble block clearfix' : '')
        } onClick={this.__toggleLegend}>
        <div className="btn btn-info puzzle-legend">
          <button className="btn btn-default btn-xs" style={{lineHeight: 0.8, padding: '1px 2px'}}>
            {open ? '+' : '-'}
          </button>{' '}
          Legend
        </div>
        {
          open ?
            <div className="badge">
              <div className="node porch-W" title="A house where the owner talks a walk of 3 turns from their West-side porch.">
                <div className="node-label">3</div>
                <div className="porch"/>
              </div>
              <label>A House w/<br/>West-side porch</label>
            </div>
            : null
        }
      </span>
    );
  },
  __toggleLegend() {
    this.setState({open: !this.state.open});
  },
});

module.exports = ControlButtons;
