module.exports = () => {
    try {
        const express = require('express');
        const path = require('path');
        let router = express.Router();

        const fs = require('fs');
        console.log('\x1b[32m%s\x1b[0m','routing started....');
        fs.readdirSync('./routes').forEach(async file => {
            let filePath = `./routes/${file}`;
            let stat = fs.statSync(filePath);
            if (stat.isFile()) {
                if (file != 'index.js') {
                    console.log('\x1b[31m%s\x1b[0m', `✌️ ${file} router loaded.. ✌️`);
                    let finalPath = path.join(process.cwd(), filePath);
                    await require(finalPath)(router);
                    // await require(`../routes/${file}`)(router);
                }
            } else {
                // if folder
                fs.readdirSync(filePath).forEach(async file => {
                    let filePathCur = `${filePath}/${file}`;
                    var stat = fs.statSync(filePathCur);
                    if (stat.isFile()) {
                        if (file != 'index.js') {
                            console.log('\x1b[36m%s\x1b[0m', `  ✌️ ${filePathCur.replace('./routes', '')} router loaded.. ✌️`);
                            let finalPath = path.join(process.cwd(), filePathCur);
                            await require(finalPath)(router);
                        }
                    }
                });
            }
        });
        return router;
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `ROUTER ERROR.. ✌️`);
    }
}