import { MatchesByReferee } from "./types.ts"

export class Referee {
  private refereeId: string

  constructor(refereeId: string) {
    this.refereeId = refereeId
  }

  public async fetchMatches() {
    /* const response = await fetch("http://localhost:8001/matches")
    const data = await response.json()
    return data */

    const data: MatchesByReferee = {
      code: 0,
      message: "success",
      result: [
        {
          battleid: "123456789",
          reporttime: "2023-01-01 12:00:00",
        },
      ],
    }

    return data.result
  }
}
