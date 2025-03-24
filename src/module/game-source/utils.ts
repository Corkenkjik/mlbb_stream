import { MLBB_SERVER } from "#lib/constant.ts"
import { API_KEY } from "#lib/env.ts"
import { BattleResponse, PostBattleResponse } from "./types.ts"

export async function fetchBattleData(matchId: string) {
  const response = await fetch(
    `${MLBB_SERVER}battledata?authkey=${API_KEY}&battleid=${matchId}&dataid=0`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
  const data = await response.json() as BattleResponse

  if (data.code !== 0) {
    throw new Error("Server is busy")
  }

  return data.data
}

export async function fetchPostBattleData(matchId: string) {
  const url =
    `${MLBB_SERVER}postdata?authkey=${API_KEY}&battleid=${matchId}&dataid=0`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json() as PostBattleResponse

  if (data.code !== 0) {
    throw new Error("Server is busy")
  }

  return data.data
}
