const fs = require("fs");
const path = require("path");

function del(dir) {
    let files_names = fs.readdirSync(dir);

    for(let i = 0; i < files_names.length; ++i) {
        let file_name = files_names[i];
        let file_path = path.join(dir, file_name);
        
        if(fs.statSync(file_path).isDirectory()) {
            del(file_path);
            fs.rmdirSync(file_path);
        }
        else {
            fs.unlinkSync(file_path);
        }
    }
}

del(path.join(__dirname, "./dist/"));