const DEFAULT_NUM_FRAMES = 10;
const DEFAULT_NUM_BOWLS = 2;

export class BowlingGame {
  players = {};
  currentFrameNum = 0;
  history = [];

  constructor(frames = DEFAULT_NUM_FRAMES) {
    this.totalFrames = frames;
  }

  getPlayer(id) {
    return this.players[id];
  }

  setPlayer(player) {
    this.players[player.id] = player;
  }

  addPlayer(name) {
    const newPlayer = new Player(name, this.totalFrames);
    this.setPlayer(newPlayer);
  }

  start() {
    this.currentFrameNum = 0;
    for (let id in this.players) {
      this.getPlayer(id).reset();
    }
  }

  bowlFrame() {
    for (let id in this.players) {
      this.getPlayer(id).takeTurn(this.currentFrameNum);
    }
    this.currentFrameNum++;
  }

  endGame() {
    this.history.push(this.players);
    return this.getWinner();
  }

  getWinner() {
    let maxScore = -1;
    let winner = null;
    for (let id in this.players) {
      const playerScore = this.players[id].getScore();
      if (playerScore > maxScore) {
        winner = this.players[id];
        maxScore = playerScore;
      }
    }
    return winner;
  }
}

export class Player {
  constructor(name, frames) {
    this.name = name;
    this.id = this.#generateUID(name);
    this.frames = frames;
  }

  getScore() {
    return this.scorecard.getScore();
  }

  reset() {
    this.scorecard = new ScoreCard(this.frames);
  }

  #generateUID(name) {
    return name.split(" ").join("").toLowerCase() + Date.now();
  }

  takeTurn(frameNum) {
    this.scorecard.addFrame(frameNum, this.score);
    while (this.scorecard.needsBowls()) {
      //await physical / virtual bowl input
      const pinsDown = this.bowl();

      if (this.scorecard.needsFills()) {
        this.scorecard.fillFrames(pinsDown);
      }

      this.scorecard.addBowl(frameNum, pinsDown);
    }

    if (!this.scorecard.isEndGame()) {
      this.scorecard.scoreFrame(frameNum);
    }

    if (
      (this.scorecard.isEndGame() || this.scorecard.isLastFrame()) &&
      this.scorecard.needsFills()
    ) {
      this.takeTurn(frameNum + 1);
    } else if (this.scorecard.isEndGame() && !this.scorecard.needsFills()) {
      this.scorecard.removeExtraFrames();
    }
  }

  bowl() {
    /*in reality, this function would simulate the 
    physics of bowling based on positioning of the ball.*/
    return Math.ceil(Math.random() * 10);
  }
}

class ScoreCard {
  frames;
  fillQueue = [];
  score = 0;

  constructor(maxFrames) {
    this.frames = [];
    this.maxFrames = maxFrames;
  }

  getScore() {
    return this.score;
  }

  addFrame() {
    const frame = new Frame(this.frames.length, this.score);
    this.frames.push(frame);
    return frame;
  }

  addBowl(frameNum, pinsDown) {
    this.frames[frameNum].addPins(pinsDown);
  }

  scoreFrame(frameNum) {
    const frame = this.frames[frameNum];
    if (frame.needsFill()) {
      this.fillQueue.push(frame);
    } else {
      this.score += frame.calculateScore();
    }
  }

  needsBowls() {
    return this.frames.filter((f) => !f.isComplete()).length > 0;
  }

  needsFills() {
    return this.fillQueue.length > 0;
  }

  fillFrames(pinsDown) {
    if (this.fillQueue?.length) {
      const remaining = [];
      for (const frame of this.fillQueue) {
        frame.fill(pinsDown);
        if (frame.fillsNeeded > 0) {
          remaining.push(frame);
        } else {
          this.score += frame.calculateScore();
        }
      }
      this.fillQueue = remaining;
    }
    return this;
  }

  removeExtraFrames() {
    this.frames = this.frames.slice(0, this.maxFrames);
  }

  isLastFrame() {
    return this.frames.length === this.maxFrames;
  }

  isEndGame() {
    return this.frames.length > this.maxFrames;
  }
}

class Frame {
  constructor(turn) {
    this.scores = [];
    this.fills = [];
    this.frameNum = turn;
    this.fillsNeeded = DEFAULT_NUM_BOWLS;
  }

  addPins(pinCount) {
    this.scores.push(pinCount);
    if (!this.hasMaxScore()) {
      this.fillsNeeded--;
    }
  }

  fill(pinsDown) {
    this.fills.push(pinsDown);
    this.fillsNeeded--;
  }

  isComplete() {
    return this.hasMaxScore() || !this.needsFill();
  }

  needsFill() {
    return this.fillsNeeded > 0;
  }

  hasMaxScore() {
    return this.scores.reduce((total, cur) => total + cur, 0) === 10;
  }

  calculateScore() {
    this.frameScore = this.scores
      .concat(this.fills)
      .reduce((total, pins) => total + pins, 0);

    return this.frameScore;
  }
}
