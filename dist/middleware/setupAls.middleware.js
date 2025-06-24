"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLoggedinUser = exports.getLoggedinUser = exports.asyncLocalStorage = void 0;
exports.setupAsyncLocalStorage = setupAsyncLocalStorage;
const async_hooks_1 = require("async_hooks");
exports.asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
function setupAsyncLocalStorage(req, res, next) {
    const storage = { loggedinUser: null };
    exports.asyncLocalStorage.run(storage, () => {
        next();
    });
}
const getLoggedinUser = () => {
    const storage = exports.asyncLocalStorage.getStore();
    return storage?.loggedinUser;
};
exports.getLoggedinUser = getLoggedinUser;
const setLoggedinUser = (user) => {
    const storage = exports.asyncLocalStorage.getStore();
    if (storage)
        storage.loggedinUser = user;
    const userAfter = (0, exports.getLoggedinUser)();
    console.log(userAfter);
};
exports.setLoggedinUser = setLoggedinUser;
