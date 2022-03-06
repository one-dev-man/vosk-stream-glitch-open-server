import fs = require("fs");
import path = require("path");

import http = require("http");

import AdmZip = require("adm-zip");

import VoskStream from "vosk-stream";
import { CLI } from "./cli/cli";

//

let cli = new CLI();

cli.setFirstCommand({
    callback: async (label: string, args: any[], cli: CLI) => {
        try {
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
            
            // config.models.forEach((model_: { label: string, archive: string, path: string }) => {
            //     let model_path = path.join(path.dirname(config_path), model_.path);
            //     let archive_path = path.join(path.dirname(config_path), model_.archive);
            //     if(!fs.existsSync(model_path) && fs.existsSync(archive_path)) {
            //         fs.mkdirSync(model_path);
                    
            //         let zip = new AdmZip(archive_path);
            //         zip.extractAllTo(model_path);

            //         process.exit(0);
            //     }

            //     transcription_server.loadModel(model_.label, model_path); 
            // });

            let models_root_path = path.join(path.dirname(config_path), config.models_root);

            let models_archives_path = path.join(models_root_path, "./archives/");
            !fs.existsSync(models_archives_path) ? fs.mkdirSync(models_archives_path) : null;
            let models_extracted_path = path.join(models_root_path, "./extracted/");
            !fs.existsSync(models_extracted_path) ? fs.mkdirSync(models_extracted_path) : null;

            let models_archives_filenames = fs.readdirSync(models_archives_path).filter(fn => { return fn.endsWith(".zip"); });

            VoskStream.setVoskLogLevel(0);
            for(let i = 0; i < models_archives_filenames.length; ++i) {
                let model_archive_filename = models_archives_filenames[i];
                try {
                    let model_archive_path = path.join(models_archives_path, model_archive_filename);
                    let model_extracted_path = path.join(models_extracted_path, model_archive_filename.substring(0, model_archive_filename.length-path.extname(model_archive_filename).length));
                    
                    !fs.existsSync(model_extracted_path) ? fs.mkdirSync(model_extracted_path) : null;

                    //
                    console.info(`Extracting model archive "${model_archive_filename}"...`);
                    //
                    
                    let zip = new AdmZip(model_archive_path);
                    zip.extractAllTo(model_extracted_path);

                    //
                    console.info(`Model archive "${path.basename(model_archive_filename)}" extracted to "${path.basename(model_extracted_path)}"`);
                    //

                    //
                    console.info(`Loading model "${path.basename(model_extracted_path)}"...`);
                    //

                    await transcription_server.loadModel(model_archive_filename, model_extracted_path);

                    //
                    console.info(`Model "${path.basename(model_extracted_path)}" loaded`);
                    //
                }
                catch(e) {
                    console.error(e);
                }
            }

            await transcription_server.open();

        }
        catch(e) {
            console.error(e);
        }

        return true;
    }
});

cli.first();