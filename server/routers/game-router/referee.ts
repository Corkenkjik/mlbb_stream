import { Router } from "@oak/oak"
import { GameController } from "#game-controller/controller.ts"

const refereeRouter = new Router({
  prefix: "/referee",
})

refereeRouter.post("/create", async (ctx) => {
  const refereeId = ctx.request.url.searchParams.get("referee-id")
  if (!refereeId) {
    ctx.response.status = 400
    ctx.response.body = "referee-id is required"
    return
  }

  GameController.getInstance().createReferee(refereeId)
  ctx.response.status = 201
  ctx.response.body = "OK"
})

refereeRouter.get("/matches", async (ctx) => {
  if (!GameController.getInstance().referee) {
    ctx.response.status = 400
    ctx.response.body = "Referee is not initialized"
    return
  }
  const data = await GameController.getInstance().referee!.fetchMatches()
  ctx.response.body = data
})

export default refereeRouter
