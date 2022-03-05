import fs = require("fs");
import path = require("path");

import http = require("http");

import VoskStream from "vosk-stream";
import { CLI } from "./cli/cli";

//

let cli = new CLI();

cli.setFirstCommand({
    callback: async (label: string, args: any[], cli: CLI) => {
        if(!args["config-path"]) {
            console.log("No config path specified");
            return true;
        }

        let config_path = path.join(path.dirname(args[0]), args["config-path"]);
        let config = JSON.parse(fs.readFileSync(config_path, "utf-8"));
        
        //
        
        let http_server = http.createServer((request, response) => {
            response.end();
        });
        
        http_server.listen(process.env.PORT || 5678);
        
        //
        
        let transcription_server = new VoskStream.WebSocket.Server({ httpServer: http_server });
        
        config.models.forEach((model_: { label: string, path: string }) => {
            transcription_server.loadModel(model_.label, path.join(path.dirname(config_path), model_.path)); 
        });
    }
})

cli.first();