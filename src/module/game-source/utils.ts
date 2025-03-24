import { BattleResponse } from "./types.ts"
import haha from "../../../mock/response.json" with { type: "json" }

export async function fetchBattleData(matchId: string) {
  // const response = await fetch("http://localhost:8001/battle-data")
  // const data = await response.json() as BattleData

  const data = haha as BattleResponse

  if (data.code !== 0) {
    throw new Error("Server is busy")
  }

  return data.data
}
