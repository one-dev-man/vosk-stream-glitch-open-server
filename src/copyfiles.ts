import fs = require("fs");
import path = require("path");

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

copy(path.join(__dirname, "../src/"), path.join(__dirname, "../dist/"), {
    exclude: /(.+)\.ts/g
});