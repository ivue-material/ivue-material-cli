const fs = require("fs");
const chalk = require("chalk");

/**
 * copy file
 *
 * @param  {String} from copied file
 * @param  {String} to   target file
 */
function copyFile (from, to) {
    fs.writeFileSync(to, fs.readFileSync(from));
}

/**
 * copy directory
 *
 * @param  {String} from
 * @param  {String} to
 */
async function copyDir (from, to) {
    try {
        await isExist(to);
    } catch (err) {
        fs.mkdirSync(to);
    }
    await fs.readdir(from, (err, paths) => {
        paths.forEach((path) => {
            var src = `${from}/${path}`;
            var dist = `${to}/${path}`;
            fs.stat(src, (err, stat) => {
                if (stat.isFile()) {
                    fs.writeFileSync(dist, fs.readFileSync(src));
                } else if (stat.isDirectory()) {
                    copyDir(src, dist);
                }
            });
        });
    });
}

/**
 * is exists
 *
 * @param  {String} file
 * @return {Promise}
 */
function isExist (path) {
    return new Promise((resolve, reject) => {
        fs.access(path, (err) => {
            if (err !== null) {
                reject(`${path} does not exist`);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * file or a folder
 *
 * @param  {String} path
 * @return {Promise}
 */
function pathType (path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err === null) {
                if (stats.isDirectory()) {
                    resolve("dir"); // it's directory
                } else if (stats.isFile()) {
                    resolve("file"); // it's file
                }
            } else {
                reject(error(path)); // files or directory don't exist
            }
        });
    });
}

/**
 * error output
 *
 * @param  {String} path
 * @return {String}
 */
function error (msg) {
    return chalk.red(`error: ${msg}`);
}

/**
 *  copy main function
 *
 * @param  {String} from which file or directory you wanna copy
 * @param  {String} to   the target file or dir you copyed
 */
exports.copy = async function (from, to) {
    if (!from) {
        console.log(error("pleace input the file or directory you wanna copy"));
        return;
    }
    try {
        await isExist(from);
        if (!to) {
            console.log(error("pleace  the target file or directory you wanna copy"));
            return;
        }

        const type = await pathType(from);

        if (type == "file") {
            copyFile(from, to); // file copy
        } else {
            copyDir(from, to); // directory copy
        }
    } catch (err) {
        console.log(error(err));
    }
}
