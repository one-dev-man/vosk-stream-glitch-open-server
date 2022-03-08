import fs = require("fs");
import path = require("path");

import http = require("http");
import https = require("https");

import AdmZip = require("adm-zip");

import VoskStream from "vosk-stream";
import { CLI } from "./cli/cli";

//

let cli = new CLI();

cli.setFirstCommand({
    callback: async (label: string, args: any[], cli: CLI) => {
        try {
            if(!args["config-path"]) {
                console.warn("No config path specified");
                return true;
            }

            let config_path = path.parse(args[0]).root == path.parse(args["config-path"]).root ? args["config-path"] : path.join(path.dirname(args[0]), args["config-path"]);
            let config = JSON.parse(fs.readFileSync(config_path, "utf-8"));
            
            //
            
            let http_server = http.createServer((request, response) => {
                response.end("");
            });
            
            http_server.listen(process.env.PORT || 5678);
            
            //
            
            let transcription_server = new VoskStream.WebSocket.Server({ httpServer: http_server });

            let models_root_path = path.join(path.dirname(config_path), config.models_root);

            let models_archives_path = path.join(models_root_path, "./archives/");
            !fs.existsSync(models_archives_path) ? mkdirs(models_archives_path) : null;
            let models_extracted_path = path.join(models_root_path, "./extracted/");
            !fs.existsSync(models_extracted_path) ? mkdirs(models_extracted_path) : null;

            let models_ = config.models;
            for(let i = 0; i < models_.length; ++i) {
                try {
                    let model_ = models_[i];

                    let model_archive_path = await downloadFile(models_[i].url, models_archives_path, { cwd: path.dirname(config_path) });
                    let model_archive_filename = path.basename(model_archive_path);

                    let model_extracted_path = path.join(models_extracted_path, model_archive_filename.substring(0, model_archive_filename.length-path.extname(model_archive_filename).length));
                    let model_path = path.join(model_extracted_path, model_.path);
                    
                    !fs.existsSync(model_extracted_path) ? mkdirs(model_extracted_path) : null;

                    //
                    console.info(`Extracting model archive "${model_archive_filename}"...`);
                    //
                    
                    let zip = new AdmZip(model_archive_path);
                    zip.extractAllTo(model_extracted_path);

                    //
                    console.info(`Model archive "${path.basename(model_archive_filename)}" extracted to "${model_extracted_path}"`);
                    //

                    //
                    console.info(`Loading model "${path.basename(model_path)}" (${model_path})...`);
                    //

                    await transcription_server.loadModel(model_.label, model_path);

                    //
                    console.info(`Model "${path.basename(model_path)}" loaded with label "${model_.label}"`);
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

//

function downloadFile(url: string, dir: string, options?: { cwd?: string }): Promise<string> {
    options = options || {} as any;
    (options as any).cwd = (options as any).cwd || process.cwd();

    let _url: URL;
    try { _url = new URL("file://"+url); }
    catch(e) { _url = new URL(url);}

    return new Promise((resolve, reject) => {
        let file_name = path.basename(_url.pathname);
        let file_path = path.join(dir, file_name);
    
        if(!fs.existsSync(file_path)) {
            if(_url.protocol == "file:") {
                let source_path = path.parse((options as any).cwd).root == path.parse(url).root ? url : path.join((options as any).cwd, url);

                copy(source_path, file_path);
                resolve(file_path);
            }
            else {
                let request = https.request(_url.href, {
                    method: "GET"
                }, (response: http.IncomingMessage) => {
                    
                    fs.writeFileSync(file_path, Buffer.from([]));
                    let file_wstream = fs.createWriteStream(file_path); 
        
                    response.on("data", d => { file_wstream.write(d); });
        
                    response.on("close", () => {
                        file_wstream.close();
                        resolve(file_path);
                    });
                });
        
                request.end();
            }
        }
        else resolve(file_path);
    });
}

function mkdirs(_path: string) {
    !fs.existsSync(path.dirname(_path)) ? mkdirs(path.dirname(_path)) : null;
    fs.mkdirSync(_path);
}

function copy(src: string, dest: string, options?: { exclude: RegExp }) {
    options = options || {} as any;
    (options as any).exclude = (options as any).exclude || null;

    let file_name = path.basename(src);
    
    if(!file_name.match((options as any).exclude)) {
        if(fs.statSync(src).isDirectory()) {
            !fs.existsSync(dest) ? fs.mkdirSync(dest) : null;
            fs.readdirSync(src).forEach(fn => {
                copy(path.join(src, fn), path.join(dest, fn), options);
            });
        }
        else {
            fs.writeFileSync(dest, Buffer.from([]));
            fs.createReadStream(src).pipe(fs.createWriteStream(dest));
        }
    }
}