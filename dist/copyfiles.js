"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function copy(src, dest, options) {
    options = options || {};
    options.exclude = options.exclude || null;
    let file_name = path.basename(src);
    if (!file_name.match(options.exclude)) {
        if (fs.statSync(src).isDirectory()) {
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
//# sourceMappingURL=copyfiles.js.map