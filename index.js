export class BowlingGame {
  players = {};

  constructor(frames = 10) {
    this.frames = frames;
  }

  getPlayer(id) {
    return this.scoreboard[id];
  }

  addPlayer(name) {
    const newPlayer = new Player(name, this.frames);
    this.players[newPlayer.id] = newPlayer;
  }

  start() {
    for (let id in this.players) {
      this.players[id].reset();
    }
  }

  getWinner() {
    let maxScore = -1;
    let winner = null;
    for (let id in this.players) {
      if (this.players[id].score > maxScore) {
        winner = this.players[id];
        maxScore = this.players[id].score;
      }
    }
    return winner;
  }
}

export class Player {
  turn = 0;
  score = 0;

  constructor(name, frames) {
    this.name = name;
    this.id = this.#generateUID(name);
    this.frames = frames;
  }

  reset() {
    this.scorecard = new ScoreCard(this.frames);
    this.turn = 0;
    this.score = 0;
  }

  #generateUID(name) {
    return name.split(" ").join("").toLowerCase() + Date.now();
  }

  takeTurn() {
    const frame = new Frame(this.turn);
    while (!frame.isComplete()) {
      frame.add(this.bowl());
    }
    this.turn++;

    if (this.turn === 10) {
      this.maybeFillLastFrame(frame);
    }

    this.scorecard.maybeFillFrames(frame);
    this.scorecard.addFrame(frame);
    this.score = this.scorecard.getTotalScore(this.turn);
  }

  maybeFillLastFrame(frame) {
    const virtualFrame = new Frame(10);
    let numFills = frame.fillsNeeded;
    while (numFills > 0) {
      virtualFrame.add(this.bowl());
      numFills--;
    }
    frame.fill(virtualFrame);
  }

  bowl() {
    /*in reality, this function would simulate the 
    physics of bowling based on positioning of the ball.*/
    return Math.ceil(Math.random() * 10);
  }
}

class Frame {
  runningScore = 0;

  constructor(turn) {
    this.scores = [];
    this.fills = [];
    this.frameNumber = turn;
    this.fillsNeeded = 2;
  }

  add(pinCount) {
    this.scores.push(pinCount);
    if (!this.isMark()) {
      this.fillsNeeded--;
    }
  }

  isComplete() {
    return this.isMark() || this.canBeScored();
  }

  canBeScored() {
    return this.fillsNeeded === 0;
  }

  isMark() {
    return this.scores.reduce((total, cur) => total + cur, 0) === 10;
  }

  calculateScore(previousScore = 0) {
    this.runningScore = this.scores
      .concat(this.fills)
      .reduce((total, score) => total + score, previousScore);
  }

  fill(nextFrame) {
    let idx = 0;
    while (this.fillsNeeded > 0 && idx < nextFrame.scores.length) {
      this.fills.push(nextFrame.scores[idx]);
      this.fillsNeeded--;
    }
  }
}

class ScoreCard {
  card;
  frameFillQueue = [];
  constructor(numFrames) {
    this.card = new Array(numFrames);
  }

  addFrame(frame) {
    if (!frame.canBeScored()) {
      this.frameFillQueue.push(frame);
    } else {
      frame.calculateScore(this.getRunningScore(frame.frameNumber));
    }

    this.card[frame.frameNumber] = frame;
  }

  maybeFillFrames(curFrame) {
    if (this.frameFillQueue?.length) {
      const frame = this.frameFillQueue.shift();
      frame.fill(curFrame);
      if (frame.fillsNeeded > 0) {
        this.frameFillQueue.unshift();
      } else {
        frame.calculateScore(this.getRunningScore(frame.frameNumber));
      }
    }
  }

  getRunningScore(frameNumber) {
    if (frameNumber === 0) return 0;
    return this.card[frameNumber - 1].runningScore;
  }

  getTotalScore(turn) {
    return this.card[turn - 1].runningScore;
  }
}
