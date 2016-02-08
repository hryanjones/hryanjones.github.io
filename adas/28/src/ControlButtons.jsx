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
  componentWillReceiveProps(nextProps) {
      console.log('received', nextProps)
  },
  render() {
    return (<div>
        <ConjectureModeButtons
          conjectureMode={this.props.conjectureMode}
          onConjectureUpdate={this.props.onConjectureUpdate}
        />{' '}
        <ClearPuzzleButton onPuzzleClear={this.props.onPuzzleClear} />
    </div>)
  }
});

var ClearPuzzleButton = React.createClass({
  clearPuzzle() {
    console.log('clear!')
    // FIXME are you sure?
    this.props.onPuzzleClear({clear: true});
  },
  render() {
    return (
      <div className="btn btn-danger" onClick={this.clearPuzzle}>
        <i className="glyphicon glyphicon-trash"></i>{' '}
        Clear Puzzle Progress
      </div>
    );
  }
});

var ConjectureModeButtons = React.createClass({
  componentWillReceiveProps(nextProps) {
      console.log('cModeBtns received', nextProps)
  },
  acceptConjectures(e) {
    this.props.onConjectureUpdate({conjectureMode: 'accept'});
  },
  toggleConjectureMode(e) {
    this.props.onConjectureUpdate({
      conjectureMode: this.props.conjectureMode === true ? 'reject' : true
    });
  },
  render() {
    //  ng-class="{'bg-info text-info info-bubble block': conjectures.enabled}"
    var mode = this.props.conjectureMode === true;
    return (
      <span className={
          'conjecture-container' + (mode ? ' bg-info text-info info-bubble block' : '')
        }>
        <button className="btn btn-primary" onClick={this.toggleConjectureMode}>
          <input type="checkbox" checked={mode}/>{' '}
          Conjecture Mode
          {mode ? (<span><br/>Clear Conjectures</span>) : ''}
        </button>
        {
          mode ?
          (
            <span>{' '}
              -or-{' '}
              <button className="btn btn-sm btn-default" onClick={this.acceptConjectures}>
                Accept Conjectures as Truth
              </button>
              <p>
                <br/>
                <i className="glyphicon glyphicon-info-sign"></i>{' '}
                In <em>conjecture mode</em> all of your actions will be marked in gray with question marks (?) so that you can make temporary assumptions. When {"you're"} done <em>Clear all conjectures</em>, or <em>Accept conjectures as truth</em>.
              </p>
            </span>
          ) :
          ''
        }
      </span>
    );
  }
});

module.exports = ControlButtons;
