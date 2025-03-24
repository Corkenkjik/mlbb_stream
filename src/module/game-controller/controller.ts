import { logger } from "@kinbay/logger"
import { GameSource } from "#game-source/game-source.ts"
import { controllerEvents } from "./event.ts"
import { Referee } from "#game-source/referee.ts"

export class GameController {
  static instance: GameController
  public gameSource: GameSource | undefined
  public referee: Referee | undefined
  private interval: number | undefined

  public static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController()
    }
    return GameController.instance
  }

  public createGame(matchId: string) {
    this.gameSource = new GameSource(matchId)
  }

  public startStream() {
    if (!this.gameSource) {
      logger.log(
        "GameSource is not initialized",
        "ERROR",
        "GameController.startGame",
      )
      throw new Error("GameSource is not initialized")
    }
    let isGameStart = 0
    logger.log("starting", "SUCCESS")

    this.interval = setInterval(async () => {
      const data = await this.gameSource!.fetchBattleData()
      if (data === "end") {
        this.stopStream()
        this.gameSource!.fetchPostgameData()
        controllerEvents.emit("end-game", null)
      } else if (data === "paused") {
        isGameStart = 0
        controllerEvents.emit("pause-game", null)
      } else if(data === "adjust") {
       controllerEvents.emit("adjust-game", null)
      } 
      else if (data === "play" && isGameStart === 0) {
        isGameStart++
        controllerEvents.emit("start-game", null)
      } 
    }, 250)
  }

  public stopStream() {
    clearInterval(this.interval)
  }

  public createReferee(refereeId: string) {
    this.referee = new Referee(refereeId)
  }
}
