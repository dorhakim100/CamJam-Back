"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    debug(...args) {
        if (process.env.NODE_ENV === 'production')
            return;
        console.log(...args);
    },
    info(...args) {
        console.log(...args);
    },
    warn(...args) {
        console.warn(...args);
    },
    error(...args) {
        console.error(...args);
    },
};
