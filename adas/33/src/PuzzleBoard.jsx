const React = require('react');
const _ = {
  chunk: require('lodash/chunk'),
  clone: require('lodash/clone'),
  constant: require('lodash/constant'),
  extend: require('lodash/extend'),
  get: require('lodash/get'),
  isFinite: require('lodash/isFinite'),
  zip: require('lodash/zip'),
  noop: require('lodash/noop'),
};
const LocalStorageMixin = require('react-localstorage');
const NUM = '29'; // puzzle number
const EXAMPLE = 'example' + NUM;
const PUZZLE = 'aenigma' + NUM;

const Node = require('./Node.jsx');
const ControlButtons = require('./ControlButtons.jsx');

const PUZZLES = {};
PUZZLES[EXAMPLE] = {
  nodesTemplate:      'ig22lc2r0gad4mpn2m1p21fx4la2kz2rsjr31h1g1yzr1 2j2',
  blackCellsTemplate: '   x    x         x  x  x  x  x         x    x   ',
  width: 7,
  puzzleName: EXAMPLE,
  conjectureMode: false,
  showLetters: false,
};

PUZZLES[PUZZLE] = {
  nodesTemplate:  'sg2dm2o12ld2j13lmk3bl' +
                  'w2t1ycq3g22sjzypo5b12' +
                  '2g1r223moglc4wi14n12z' +
                  'sfk2b11dl1g2rg31kl2ue' +
                  '1f1eqg2h3d3rk2z3ym1c1' +
                  'f2mt3bc1l2mr3p1fh31cd' +
                  '2cy2n2qq3gr2o3gf2rm3o' +
                  '23badzb3rr2nmqne1m3l1' +
                  '1kds3x3cj3t1g23dy3s1h' +
                  '2l4bd2yj2kf1on22ab1j2' +
                  'q0zm1m2zl31r5sfhclm2m' +
                  'rxi3rf122mn2q22c2p2s2',
  blackCellsTemplate: '       x     x       ' +
                      ' x        x        x ' +
                      '  x  x         x  x  ' +
                      '      x  x x  x      ' +
                      'x         x         x' +
                      '    x  x    x    x   ' +
                      '   x    x    x  x    ' +
                      'x         x         x' +
                      '      x  x x  x      ' +
                      '  x  x         x  x  ' +
                      ' x        x        x ' +
                      '       x     x       ',
  width: 21,
  puzzleName: PUZZLE,
  conjectureMode: false,
  showLetters: false,
};

PUZZLES[EXAMPLE].nodes = __convertTemplateToNodes(PUZZLES[EXAMPLE]);
PUZZLES[PUZZLE].nodes = __convertTemplateToNodes(PUZZLES[PUZZLE]);

let PuzzleChangeTabs = React.createClass({
  getInitialState() {
    return {puzzleName: EXAMPLE};
  },
  mixins: [LocalStorageMixin],
  getLocalStorageKey() { return this.state.puzzleName; },
  componentWillUpdate(nextProps, nextState) {
    if (nextState.puzzleName === this.state.puzzleName) { return; }
    this.props.setPuzzle(nextState);
  },
  setAenigma() {
    this.setState({puzzleName: PUZZLE});
  },
  setExample() {
    this.setState({puzzleName: EXAMPLE});
  },
  render() {
    var exampleSelected = this.state.puzzleName === EXAMPLE;
    return (
      <form id="tabs">
        <label onClick={this.setExample} className={'tab h4' + (exampleSelected ? ' selected' : '')}>
          example
        </label>
        {PUZZLES[PUZZLE] ?
          <label onClick={this.setAenigma} className={'tab h4' + (exampleSelected ? '' : ' selected')}>
            Ænigma #33
          </label>
        : null}
        <label title="Only really useful if you\'ve completed the grid">
          <input
            type='checkbox'
            checked={this.props.showLetters}
            onClick={this.props.toggleShowLetters}
          />
          show letters
        </label>
      </form>
    );
  },
});

let PuzzleBoard = React.createClass({
  getInitialState: _.constant(PUZZLES[EXAMPLE]),
  mixins: [LocalStorageMixin],
  getLocalStorageKey() { return this.state.puzzleName + 'conjectureMode'; },
  // only need to save conjecture mode for each puzzle as pieces keep track of their own state
  stateFilterKeys: ['conjectureMode', 'showLetters'],
  resetBoard() {
    let {puzzleName} = this.state;
    this.state.nodes.forEach(node => {
      localStorage.removeItem(node.key);
    });
    localStorage.removeItem(puzzleName + 'conjectureMode'); // make sure that conjecture mode gets turned off too
    location.reload();
  },
  // FIXME this is messy and open to abuse
  setPuzzleState(newState) {
    if (!newState.conjectureMode && this.state.conjectureMode) {
      newState.nodes = this.state.nodes.map(__removeConjecture);
    }
    this.setState(newState);
  },
  setPuzzle(newPuzzle) {
    var newPuzzleName = newPuzzle.puzzleName;
    if (newPuzzleName && newPuzzleName !== this.state.puzzleName) {
      this.setState(PUZZLES[newPuzzleName]);
    }
  },
  _toggleShowLetters() {
    this.setState({showLetters: !this.state.showLetters});
  },
  render() {
    let {conjectureMode, nodes, width, showLetters} = this.state;
    let onClickNode = this.__updateConjectureMode;
    let rowsOfNodes  = _.chunk(nodes, width).map(__renderRow);
    let {puzzleName} = this.state;

    return (
      <div>
        <PuzzleChangeTabs
          setPuzzle={this.setPuzzle}
          toggleShowLetters={this._toggleShowLetters}
          showLetters={showLetters}
        />
        <div id='puzzle-board' className={showLetters ? 'show-letters' : ''}>
          <div>{/* just for extra border */}
            {rowsOfNodes}
          </div>
        </div>
        <ControlButtons
          onPuzzleClear={this.resetBoard}
          conjectureMode={conjectureMode}
          onConjectureUpdate={this.setPuzzleState}
        />
      </div>
    );

    function __renderRow(nodes, i) {
      return (
        <div className='puzzle-row' key={i}>
            {nodes.map(__renderNode)}
        </div>
      );

      function __renderNode(node) {
        let {
          key,
          linesFacing,
          connectedLines,
          letter,
          invalidReasons,
        } = node;

        return (
          <Node
            linesFacing={linesFacing}
            conjectureMode={conjectureMode}
            connectedLines={connectedLines}
            letter={letter}
            invalidReasons={invalidReasons}
            localStorageKey={key}
            key={key}
            onClickNode={onClickNode}
          />
        );
      }
    }
  },

  __updateConjectureMode(node) {
    let {conjecture} = node;
    let {conjectureMode} = this.state;
    // need to modify conjecture mode here

    if (conjectureMode === 'first-conjecture' && conjecture === 'first-conjecture') {
      conjectureMode = 'conjecture';
    }

    this.setState({conjectureMode});
  },
});

function __convertTemplateToNodes(puzzle) {
  let nodes = puzzle.nodesTemplate.split('');
  let blackCells = puzzle.blackCellsTemplate.split('');

  return _.zip(nodes, blackCells)
  .map(__createNode);

  function __createNode(input, key) {
    key += '_' + puzzle.puzzleName;
    let linesFacing = null;
    let connectedLines = null;
    let letter = null;

    let value = input[0];
    let parsedVal = parseInt(value, 10);
    let isNumber = _.isFinite(parsedVal);
    let isBlack = input[1] === 'x';

    if (isNumber) {
      if (isBlack) {
        linesFacing = parsedVal;
      }
      else {
        connectedLines = parsedVal;
      }
    }
    else {
      letter = value;
    }

    return {
      key,
      linesFacing,
      connectedLines,
      letter,
      // line: null,  // possible other valuse are '-' and '|'
      // conjecture: false,
      invalidReasons: [],
    };


  }
}

function __removeConjecture(node) {
  if (node.conjecture) {
    node.conjecture = false;
    node.line = null;
  }
  return node;
}

module.exports = PuzzleBoard;
