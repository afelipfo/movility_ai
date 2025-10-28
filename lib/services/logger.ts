/* eslint-disable no-console */
type LogLevel = "debug" | "info" | "warn" | "error"

const PREFIX = "[MovilityAI]"

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
  const timestamp = new Date().toISOString()
  switch (level) {
    case "debug":
      console.debug(PREFIX, timestamp, message, ...args)
      break
    case "info":
      console.info(PREFIX, timestamp, message, ...args)
      break
    case "warn":
      console.warn(PREFIX, timestamp, message, ...args)
      break
    case "error":
      console.error(PREFIX, timestamp, message, ...args)
      break
    default:
      console.log(PREFIX, timestamp, message, ...args)
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) => log("error", message, ...args),
}
