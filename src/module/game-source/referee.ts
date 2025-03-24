import { MLBB_SERVER } from "#lib/constant.ts"
import { API_KEY } from "#lib/env.ts"
import { MatchesByReferee } from "./types.ts"

export class Referee {
  private refereeId: string

  constructor(refereeId: string) {
    this.refereeId = refereeId
  }

  public async fetchMatches() {
    const response = await fetch(
      `${MLBB_SERVER}battlelist/judge?authkey=${API_KEY}&judgeid=${this.refereeId}`,
    )
    const data = await response.json() as MatchesByReferee
    return data.result
  }
}
