export const logger = {
  debug(...args: any[]) {
    if (process.env.NODE_ENV === 'production') return
    console.log(...args)
  },
  info(...args: any[]) {
    console.log(...args)
  },
  warn(...args: any[]) {
    console.warn(...args)
  },
  error(...args: any[]) {
    console.error(...args)
  },
}
