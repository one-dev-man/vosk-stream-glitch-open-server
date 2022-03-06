"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const http = require("http");
const AdmZip = require("adm-zip");
const vosk_stream_1 = __importDefault(require("vosk-stream"));
const cli_1 = require("./cli/cli");
//
let cli = new cli_1.CLI();
cli.setFirstCommand({
    callback: async (label, args, cli) => {
        if (!args["config-path"]) {
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
        let transcription_server = new vosk_stream_1.default.WebSocket.Server({ httpServer: http_server });
        config.models.forEach((model_) => {
            let model_path = path.join(path.dirname(config_path), model_.path);
            if (!fs.existsSync(model_path)) {
                fs.mkdirSync(model_path);
                console.log(path.join(path.dirname(config_path), model_.archive));
                let zip = new AdmZip(path.join(path.dirname(config_path), model_.archive));
                zip.extractAllTo(model_path);
                process.exit(0);
            }
            transcription_server.loadModel(model_.label, model_path);
        });
        return true;
    }
});
cli.first();
//# sourceMappingURL=server.js.map