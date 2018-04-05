const fs = require('fs');
const loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter');
let db;
const adapter = new lfsa();
const data_path = 'data';
if (!fs.existsSync(data_path)) {
    fs.mkdirSync(data_path);
}
//export promise?
module.exports = new Promise((resolve, reject) => {
    if (db) {
        resolve(db);
    } else {
        let freelandDB = new loki("./data/freeland.db", {
            adapter: adapter,
            autoload: true,
            autoloadCallback: () => {
                db = {
                    player: freelandDB.getCollection("player") ? freelandDB.getCollection("player") : freelandDB.addCollection("player"),
                    chat_log: freelandDB.getCollection("chat_log") ? freelandDB.getCollection("chat_log") : freelandDB.addCollection("chat_log"),
                    friends: freelandDB.getCollection("friends") ? freelandDB.getCollection("friends") : freelandDB.addCollection("friends"),
                    gestures: freelandDB.getCollection("gestures") ? freelandDB.getCollection("gestures") : freelandDB.addCollection("gestures"),
                    notification: freelandDB.getCollection("notification") ? freelandDB.getCollection("notification") : freelandDB.addCollection("notification"),
                    scripts: freelandDB.getCollection("scripts") ? freelandDB.getCollection("scripts") : freelandDB.addCollection("scripts")
                }
                resolve(db);
            },
            autosave: true,
            autosaveInterval: 1000
        });
    }
})