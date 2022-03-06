"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
//
require("./copyfiles");
//
let server_script_path = path.join(__dirname, "./server");
//
let server_process = null;
function start() {
    //
    console.log("");
    console.log("> Starting server");
    console.log("");
    //
    console.log(server_script_path);
    server_process = child_process_1.spawn("node", [server_script_path, "--config-path", "config.json"]);
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