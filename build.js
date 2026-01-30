import fs from 'fs';
import pug from 'pug';

const root = "./";
var options = {};
options.basedir = root;
options.filters = {
    'dirs': function(text, options) {
        const path = root + options.dir.substring(1);
        console.log(path)
        const dir = fs.opendirSync(path);
        var result = "";

        var d = dir.readSync();
        while (d !== null) {
            if (d.isDirectory()) {
                var name = d.name;
                if (name.search('.git') != -1) continue;
                const summ = fs.readFileSync(`${path}/${name}/summary`);
                result += `<p><a href='${options.dir}/${name}'>${name}</a>. ${summ.toString()}</p>\n`;
            }
            d = dir.readSync();
        }

        dir.closeSync();

        return result;
    }
};

function traverse(path) {
    console.log(path);
    const dir = fs.opendirSync(path, { withFileTypes: true });
    var d = dir.readSync();
    while (d !== null) {
        if (d.isDirectory()) {
            if (d.name.search('.git') != -1) {
                d = dir.readSync()
                continue;
            }
            if (path == root && (d.name == 'out' || d.name == 'views' || d.name == 'includes' || d.name == 'node_modules')) {
                d = dir.readSync();
                continue;
            }
            const dirpath = root + 'out/' + path.substring(root.length) + d.name + '/';
            if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
            traverse(path + d.name + '/');
        } else if (d.name.search('.pug') != -1) {
            const result = pug.renderFile(path + d.name, options);
            fs.writeFileSync(root + 'out/' + path.substring(root.length) + d.name.replace('.pug', '.html'), result);
        } else if (d.name != 'build.js' && d.name.search('.json') == -1 && d.name.search('.js') != -1 || d.name.search('.css') != -1) {
            fs.copyFileSync(path + d.name, root + 'out/' + path.substring(root.length) + d.name);
        }
        d = dir.readSync();
    }
    dir.closeSync();
}
traverse(root);
