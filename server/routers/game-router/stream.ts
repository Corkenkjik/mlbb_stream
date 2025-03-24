import { Router } from "@oak/oak"
import { GameController } from "#game-controller/controller.ts"

const streamRouter = new Router({
  prefix: "/stream",
})

streamRouter.get("/start-stream", async (ctx) => {
  try {
    GameController.getInstance().startStream()
    ctx.response.body = "OK"
  } catch (error) {
    if (error instanceof Error) {
      ctx.response.status = 400
      ctx.response.body = error.message
    }
  }
})

streamRouter.get("/stop-stream", async (ctx) => {
  GameController.getInstance().stopStream()
  ctx.response.body = "OK"
})

export default streamRouter
