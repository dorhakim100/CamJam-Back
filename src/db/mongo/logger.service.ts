// import fs from 'fs'
// import { asyncLocalStorage } from '@/middleware/setupAls.middleware'

// export const logger = {
// 	debug: (...args:any[]) => doLog('DEBUG', ...args),
// 	info: (...args:any[]) => doLog('INFO', ...args),
// 	warn: (...args:any[]) => doLog('WARN', ...args),
// 	error: (...args:any[]) => doLog('ERROR', ...args),
// }

// const logsDir = './logs'

// if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir)

// function doLog(level:any, ...args:any[]) {
// 	const store = asyncLocalStorage.getStore()
// 	const userId = store?.loggedinUser?._id

// 	const strs = args.map(arg => (typeof arg === 'string' || _isError(arg) ? arg : JSON.stringify(arg)))

//     if(userId) strs.push(userId)

// 	const line = `${_getTime()} - ${level} - ${strs.join(' | ')}\n`
// 	console.log(line)

// 	fs.appendFile(`${logsDir}/backend.log`, line, err => {
// 		if (err) console.log('FATAL: cannot write to log file')
// 	})
// }

// function _getTime() {
// 	let now = new Date()
// 	return now.toLocaleString('he')
// }

// function _isError(e) {
// 	return e && e.stack && e.message
// }
