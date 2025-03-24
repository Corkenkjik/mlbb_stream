import { logger } from "@kinbay/logger"

export class RateLimiter {
  static async execute(urls: string[]) {
    /* urls.forEach(async (url) => {
      const response = await fetch(url)
      // console.log(response.status, url)
      if (response.status !== 200) {
        logger.log(`Cannot fetch ${url}`, "ERROR", "RateLimiter.execute")
      }
    }) */
    /* const promises = urls.map((url) => fetch(url))
    Promise.allSettled(promises).then((results) => {
      results.forEach((result) => {
        if (result.status === "rejected") {
          logger.log(
            `Cannot fetch ${result.reason}`,
            "ERROR",
            "RateLimiter.execute",
          )
        }
      })
    }) */

    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5)
      const batchPromises = batch.map((url) => fetch(url))

      const results = await Promise.allSettled(batchPromises)

      results.forEach((result) => {
        if (result.status === "rejected") {
          logger.log(
            logger.log(result.reason, "ERROR", "RateLimiter.execute"),
            "ERROR",
            "RateLimiter.execute",
          )
        }
      })
    }
  }
}
