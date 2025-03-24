import { logger } from "@kinbay/logger"

/* export class RateLimiter {
  static execute(urls: string[]) {
    console.log("RateLimiter is sync these urls to vmix:", urls)
  }
}

 */
export class RateLimiter {
  static maxConcurrentRequests: 5
  static maxRetries: 3
  static baseDelay: 2000

  static async fetchWithRetry(url: string, retries = 0): Promise<void> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
    } catch (error) {
      if (retries < RateLimiter.maxRetries) {
        const delay = RateLimiter.baseDelay * Math.pow(2, retries)
        logger.log(
          `Retrying ${url} in ${delay}ms... (Attempt ${retries + 1})`,
          "WARN",
        )
        await RateLimiter.sleep(delay)
        return RateLimiter.fetchWithRetry(url, retries + 1)
      } else {
        logger.log(
          `Failed after ${RateLimiter.maxRetries} attempts: ${url}`,
          "ERROR",
        )
        throw error
      }
    }
  }

  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  static chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  static async execute(urls: string[]) {
    /* const batches = RateLimiter.chunkArray(urls, RateLimiter.maxConcurrentRequests)

    for (const batch of batches) {
      const promises = batch.map((url) => RateLimiter.fetchWithRetry(url))
      await Promise.all(promises)
    } */

    console.log("RateLimiter is sync these urls to vmix:", urls)
  }
}
