import { ENVIRON } from "./env.ts"
export const API_SERVER = "http://localhost:8000"
export const MLBB_SERVER = ENVIRON === "dev"
  ? "http://localhost:8001/"
  : "https://esportsdata-sg.mobilelegends.com/"