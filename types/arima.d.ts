declare module "arima" {
  interface ARIMAConfig {
    p?: number
    d?: number
    q?: number
    P?: number
    D?: number
    Q?: number
    s?: number
    verbose?: boolean
  }

  class ARIMA {
    constructor(config?: ARIMAConfig)
    train(series: number[]): ARIMA
    predict(steps: number): [number[], number[]]
  }

  export = ARIMA
}
