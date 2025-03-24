const vmixServer = () => {
  const VMIX_SERVER = Deno.env.get("VMIX_SERVER")
  if (!VMIX_SERVER) {
    throw new Error("VMIX_SERVER is not set")
  }
  return VMIX_SERVER
}

const apiKey = () => {
  const API_KEY = Deno.env.get("API_KEY")
  if (!API_KEY) {
    throw new Error("API_KEY is not set")
  }
  return API_KEY
}

const environ = (): "dev" | "prod" => {
  const ENVIRON = Deno.env.get("ENVIRON") as "dev" | "prod" | undefined
  if (!ENVIRON) {
    return "dev"
  }
  return ENVIRON
}

const VMIX_SERVER = vmixServer()
const API_KEY = apiKey()
const ENVIRON = environ()

export { API_KEY, ENVIRON, VMIX_SERVER }
