import { DataPipeline } from "./pipeline.ts"
import { fetchBattleData, fetchPostBattleData } from "./utils.ts"

export class GameSource {
  private matchId: string
  private pipeline = new DataPipeline()

  constructor(matchId: string) {
    this.matchId = matchId
  }

  public async fetchBattleData() {
    const data = await fetchBattleData(this.matchId)
    console.log("state", data.state)
    return this.pipeline.process(data)
  }

  public async fetchTestPing(matchId: string) {
    const data = await fetchBattleData(matchId)
    return this.pipeline.processTestPing(data)
  }

  public async fetchPostgameData() {
    const data = await fetchPostBattleData(this.matchId)
    return this.pipeline.processPostgameData(data)
  }
}

export class TestPing {
  static pipeline = new DataPipeline()

  static async fetch(matchId: string) {
    const data = await fetchBattleData(matchId)
    const processedData = TestPing.pipeline.processTestPing(data)
    return processedData
  }
}
