import fs = require("fs");
import path = require("path");

function copy(src: string, dest: string, options?: { exclude: RegExp }) {
    options = options || {} as any;
    (options as any).exclude = (options as any).exclude || null;

    let files_names = fs.readdirSync(src);

    for(let i = 0; i < files_names.length; ++i) {
        let file_name = files_names[i];
        let src_file_path = path.join(src, file_name);
        let dest_file_path = path.join(dest, file_name);
        
        if(!file_name.match((options as any).exclude)) {
            if(fs.statSync(src_file_path).isDirectory()) {
                !fs.existsSync(dest_file_path) ? fs.mkdirSync(dest_file_path) : null;
                copy(src_file_path, dest_file_path, options);
            }
            else {
                fs.writeFileSync(dest_file_path, Buffer.from([]));
                fs.createReadStream(src_file_path).pipe(fs.createWriteStream(dest_file_path));
            }
        }
    }
}

copy(path.join(__dirname, "../src/"), path.join(__dirname, "../dist/"), {
    exclude: /(.+)\.ts/g
});