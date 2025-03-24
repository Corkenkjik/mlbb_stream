import { repositoryEvents } from "./event.ts"
import { FieldTypes, ISetup, PlayerData, TeamData } from "./types.ts"
import { BattleState } from "../game-source/types.ts"

const intialTeamData: TeamData = {
  bans: [],
  score: 0,
  gold: 0,
  tortoise: 0,
  lord: 0,
  tower: 0,
  blueBuff: 0,
  redBuff: 0,
}

const initialPlayerData: PlayerData = {
  assist: 0,
  death: 0,
  dmgDealt: 0, // total_damage
  dmgTaken: 0, // total_hurt
  gold: 0,
  item_list: Array(6).fill(0),
  kill: 0,
  level: 0,
  mvp: false,
  pick: 0,
  rune: 0,
  runeMap: { "1": 0, "2": 0, "3": 0 },
  skillid: 0,
}

export class DataRepository {
  static instance: DataRepository

  public static getInstance() {
    if (!DataRepository.instance) {
      DataRepository.instance = new DataRepository()
    }
    return DataRepository.instance
  }

  public _setup = {} as ISetup
  private _gameState: BattleState = "init"
  private _teams: FieldTypes["teams"] = {
    blue: intialTeamData,
    red: intialTeamData,
  }
  private _phaseLeftTime: number | undefined
  private _players: FieldTypes["players"] = {
    blue: [],
    red: [],
  }
  public winCamp: number = 0
  // private _gameTime: number | undefined
  // unstableFlags: string[] = []

  public get setup() {
    return this._setup
  }

  public set setup(v) {
    this._setup = v
    repositoryEvents.emit("data-changed", {
      field: "setup",
    })
  }

  public get gameState() {
    return this._gameState
  }

  public set gameState(v) {
    this._gameState = v
  }

  public get teams() {
    return this._teams
  }

  public set teams(v) {
    this._teams = v
    repositoryEvents.emit("data-changed", {
      field: "teams",
    })
  }

  public get phaseLeftTime() {
    return this._phaseLeftTime
  }

  public set phaseLeftTime(v) {
    this._phaseLeftTime = v
    repositoryEvents.emit("data-changed", {
      field: "phaseLeftTime",
    })
  }

  public get players() {
    return this._players
  }

  public set players(v) {
    this._players = v
    repositoryEvents.emit("data-changed", {
      field: "players",
    })
  }

  /*  public setUnstableFlag(flag: string) {
    this.unstableFlags.push(flag)
  }

  public removeUnstableFlag(flag: string) {
    this.unstableFlags = this.unstableFlags.filter((x) => x !== flag)
  } */

  constructor() {
    this.subscribeEvents()
  }

  private subscribeEvents() {
    /* controllerEvents.on("create-game", () => {
      console.log("on create-game, reset the DataRepository")
      this.reset()
    }) */
  }

  public reset() {
    this.setup = {
      blue: {
        name: "",
        players: ["", "", "", "", ""],
      },
      red: {
        name: "",
        players: ["", "", "", "", ""],
      },
    }
    this.gameState = "init"
    this.teams = {
      blue: intialTeamData,
      red: intialTeamData,
    }
    this.phaseLeftTime = undefined
    this.players = {
      blue: Array(5).fill(initialPlayerData),
      red: Array(5).fill(initialPlayerData),
    }
    this.winCamp = 0
  }

  public reducers = {
    "bans": (payload: { blue: number[]; red: number[] }) => {
      let tempBlueBans = this.teams.blue.bans
      let tempRedBans = this.teams.red.bans
      if (payload.blue !== this.teams.blue.bans) {
        tempBlueBans = payload.blue
      }
      if (payload.red !== this.teams.red.bans) {
        tempRedBans = payload.red
      }
      this.teams = {
        blue: { ...this.teams.blue, bans: tempBlueBans },
        red: { ...this.teams.red, bans: tempRedBans },
      }
      /* if (this.unstableFlags.includes("players-ban")) {
        logger.log(
          `Unstable flag "players-ban" has set, ignore the realtime data`,
          "DEBUG",
          "DataRepository.reducers.players",
        )
      } else {
        let tempBlueBans = this.teams.blue.bans
        let tempRedBans = this.teams.red.bans
        if (payload.blue !== this.teams.blue.bans) {
          tempBlueBans = payload.blue
        }
        if (payload.red !== this.teams.red.bans) {
          tempRedBans = payload.red
        }
        this.teams = {
          blue: { ...this.teams.blue, bans: tempBlueBans },
          red: { ...this.teams.red, bans: tempRedBans },
        }
      } */
    },
    "gameState": (payload: BattleState) => {
      this.gameState = payload
    },
    "phaseLeftTime": (payload: number) => {
      this.phaseLeftTime = payload
    },
    "players": (payload: FieldTypes["players"]) => {
      this.players = payload
    },
    "teams": (payload: FieldTypes["teams"]) => {
      this.teams = payload
    },
    "winCamp": (payload: number) => {
      this.winCamp = payload
    },
    /* "players": (payload: PlayerData[]) => {
      if (this.unstableFlags.includes("players-ban")) {
        logger.log(
          `Unstable flag "players-ban" has set, ignore the realtime data`,
          "DEBUG",
          "DataRepository.reducers.players",
        )
      } else {
        this.players = payload
      }
    },
    "teams": () => {},
    "gameTime": () => {}, */
  }
}
