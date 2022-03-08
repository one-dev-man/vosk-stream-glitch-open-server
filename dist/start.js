"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
//
let server_script_path = path.join(__dirname, "./server");
//
let server_process = null;
function start() {
    //
    if (process.env.ENVIRONMENT == "production") {
        console.log("");
        console.log("> Produciton environment detected");
        console.log("> Cleaning useless data on disk (.git & .cache)");
        console.log("");
        child_process_1.execSync("rm -rf .git && rm -rf .cache");
    }
    //
    console.log("");
    console.log("> Starting server");
    console.log("");
    //
    server_process = child_process_1.spawn("node", [server_script_path, "--config-path", process.env.CONFIG_PATH || "config.json"]);
    process.stdin.pipe(server_process.stdin);
    server_process.stdout.pipe(process.stdout);
    server_process.stderr.pipe(process.stderr);
    server_process.on("exit", code => {
        //
        console.log("");
        console.log("> Server stopped with code " + code);
        console.log("> Trying to restart...");
        console.log("");
        //
        setImmediate(() => { start(); });
    });
}
//
start();
//# sourceMappingURL=start.js.map