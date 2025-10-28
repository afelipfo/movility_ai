const DEFAULT_TIMEOUT_MS = 8000
const DEFAULT_RETRIES = 2

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

export class ApiError extends Error {
  status?: number
  response?: Response

  constructor(message: string, init?: { status?: number; response?: Response }) {
    super(message)
    this.name = "ApiError"
    this.status = init?.status
    this.response = init?.response
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function apiFetch<T>(input: RequestInfo, options: ApiRequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, retryDelayMs = 500, ...init } = options
  let attempt = 0
  let lastError: Error | undefined

  while (attempt <= retries) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      const response = await fetch(input, { ...init, signal: controller.signal })
      clearTimeout(timeout)

      if (!response.ok) {
        const message = await safeReadText(response)
        throw new ApiError(message || `Request failed with status ${response.status}`, {
          status: response.status,
          response,
        })
      }

      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        return (await response.json()) as T
      }

      return (await response.text()) as T
    } catch (error) {
      lastError = error as Error
      if (attempt === retries || (error as Error).name === "AbortError") {
        break
      }
      await delay(retryDelayMs * Math.pow(2, attempt))
      attempt += 1
    }
  }

  throw lastError ?? new Error("Unknown API error")
}

async function safeReadText(response: Response) {
  try {
    return await response.text()
  } catch (error) {
    console.warn("[ApiClient] Failed to read response text", error)
    return ""
  }
}
