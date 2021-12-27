import { BowlingGame, Player } from "./index.js";

describe("tests for current coding problem", () => {
  let game;
  let MOCK_DATE = 1640273639677;
  let mockBowl;
  const dude = `thedude${MOCK_DATE}`;
  const donny = `donny${MOCK_DATE}`;
  const walter = `walter${MOCK_DATE}`;

  let dateSpy = jest.spyOn(Date, "now").mockImplementation(() => MOCK_DATE);

  beforeEach(() => {
    game = new BowlingGame();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("instantiate new game", () => {
    expect(game.frames).toEqual(10);
  });
  test("add new player", () => {
    expect(Object.keys(game.players).length).toEqual(0);
    game.addPlayer("The Dude");
    game.start();
    expect(Object.keys(game.players)[0]).toEqual(dude);
    expect(game.players[dude].name).toEqual("The Dude");
    expect(game.players[dude].scorecard.card.length).toEqual(10);
  });

  test("add several players", () => {
    game.addPlayer("The Dude");
    game.addPlayer("Donny");
    game.addPlayer("Walter");
    expect(Object.keys(game.players).length).toEqual(3);
  });

  test("start the game", () => {
    game.addPlayer("The Dude");
    game.start();
    expect(game.players[dude].scorecard.card.length).toEqual(10);
  });
  test("bowl ten frames and calculate the score for one player", () => {
    game.addPlayer("The Dude");
    game.start();

    bowlForAllPlayers();

    expect(game.players[dude].scorecard.card.length).toEqual(10);
    expect(game.players[dude].score).toEqual(150);
  });

  test("bowl ten frames and calculate the winner between three players", () => {
    game.addPlayer("The Dude");
    game.addPlayer("Donny");
    game.addPlayer("Walter");
    game.start();

    bowlForAllPlayers();

    expect(game.players[dude].scorecard.card.length).toEqual(10);
    expect(game.players[donny].scorecard.card.length).toEqual(10);
    expect(game.players[walter].scorecard.card.length).toEqual(10);

    expect(game.players[dude].score).toEqual(150);
    expect(game.players[donny].score).toEqual(40);
    expect(game.players[walter].score).toEqual(300);

    const winner = game.getWinner();

    expect(winner).toEqual(game.players[walter]);
    expect(winner.score).toEqual(300);
  });

  const bowlForAllPlayers = () => {
    const scoreMocks = [5, 2, 10];
    let idx = 0;
    for (let id in game.players) {
      const player = game.players[id];
      mockBowl = jest.spyOn(player, "bowl").mockImplementation(() => {
        return scoreMocks[idx];
      });
      while (player.turn < game.frames) {
        player.takeTurn();
      }
      idx++;
    }
  };
});
