import fs = require("fs");
import path = require("path");

import { spawn, ChildProcess } from "child_process";

//

require("./copyfiles");

//

let server_script_path = path.join(__dirname, "./server");

//

let server_process: ChildProcess | null = null;

function start() {

    //

    console.log("");
    console.log("> Starting server");
    console.log("");

    //

    server_process = spawn("node", [server_script_path, "--config-path", "config.json"]);

    process.stdin.pipe(server_process.stdin);

    server_process.stdout.pipe(process.stdout);
    server_process.stderr.pipe(process.stderr);

    server_process.on("exit", code => {

        //

        console.log("");
        console.log("> Server stopped with code "+code);
        console.log("> Trying to restart...");
        console.log("");

        //

        setImmediate(() => { start(); });
    });
}

//

start();