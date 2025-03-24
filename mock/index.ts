import { Application, Router } from "@oak/oak"
import { DB } from "https://deno.land/x/sqlite/mod.ts"
import { oakCors } from "@tajpouria/cors"
import postdata from "./db/883724934899998804.json" with { type: "json" }
// Connect to the existing SQLite database (no mutations)
const db = new DB("db/883724934899998804.db")

// Global counter to track the current `id`, starting from 1
// let i = 500 // half of ban pick
// let i = 760 // ingame
// let i = 920 // 2p40 into the game
// let i = 1220 // 7p40 into the game
// let i = 2028 // end game
let i = 1550

function formatTime(i: number): string {
  // Each increment of i represents 500ms
  const totalSeconds = Math.floor(i * 0.5) // i * 500ms = total seconds
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // Pad with leading zeros to ensure 2 digits
  const mm = minutes.toString().padStart(2, "0")
  const ss = seconds.toString().padStart(2, "0")

  return `${mm}:${ss}`
}

const router = new Router()

// Endpoint to serve JSON data
router.get("/battledata", (ctx) => {
  console.log("i", formatTime(i))
  try {
    // Fetch the row matching the current `id`
    const row = db.query("SELECT id, data FROM data WHERE id = ?", [i])

    // If no row is found, return 404
    if (row.length === 0) {
      ctx.response.status = 404
      ctx.response.body = { error: `No data found for id ${i}` }
      return
    }

    // Extract the row's data
    const [_id, jsonData] = row[0]

    // Parse JSON from the data column
    const parsedData = JSON.parse(jsonData as unknown as any)

    // Respond with the current row
    ctx.response.body = parsedData

    // Increment the counter for the next request
    i++
  } catch (error) {
    console.error("Error:", error)
    ctx.response.status = 500
    ctx.response.body = { error: "Internal server error" }
  }
})

router.get("/postdata", async (ctx) => {
  console.log('reaches')
  ctx.response.body = postdata
})

const app = new Application()
app.use(router.routes())
app.use(router.allowedMethods())
app.use(oakCors())

// Start the server
const port = 8001
console.log(`🚀 Server running at http://localhost:${port}`)
await app.listen({ port })
