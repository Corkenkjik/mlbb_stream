// A singleton class to instatiate all game related classes

import { DataRepository } from "#repository/repository.ts"
import { GameController } from "#game-controller/controller.ts"
import { Vmix } from "../src/module/vmix/vmix.ts"

export class Singleton {
  // gameController = new GameController()
  // dataRepository = new DataRepository()
  vmix = new Vmix()

  public async init() {
    DataRepository.getInstance()
    GameController.getInstance()
    await this.vmix.init()
  }
}
