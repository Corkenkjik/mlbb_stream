import { ENVIRON } from "./env.ts"
// TODO: change this to prefixed server
export const API_SERVER = "http://localhost:8000"
export const MLBB_SERVER = ENVIRON === "dev"
  ? "http://localhost:8001"
  : "https://mlbb.ml/"