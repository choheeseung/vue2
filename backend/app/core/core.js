const App = {
    express: null,
    isDev : false,
    config : {}
}

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const cookieParser = require('cookie-parser')

process.env.TZ = 'Asia/Seoul';

App.express = express()

require('./global')

App.express.use(cookieParser(appConfig.secretKey))
App.express.use(bodyParser.json())
App.express.use(bodyParser.urlencoded({extended: true}))
App.express.use(cors(appConfig.cors))

let fileList = fs.readdirSync(root + '/helpers');
fileList.forEach(async (fileName) => {
    require(root + '/helpers/' + fileName);
});

const router = require('express').Router();

let dirList = fs.readdirSync(modulePath)
dirList.forEach((dir) => {
    if (fs.lstatSync(modulePath + '/' + dir).isDirectory()) {
        const routePath = `${modulePath}/${dir}/${dir}.routes.js`;
        const matchPath = `/${dir}`;

        if (fs.existsSync(routePath)) {
            router.use(matchPath, require(routePath))
        }
    }
});

App.express.use(router);

App.start = () => {
    App.express.listen(appConfig.appPort, '0.0.0.0', () => {
        console.log(`[${isDev ? '개발 모드' : '릴리즈 모드'}] 서버가 작동되었습니다 : port ${appConfig.appPort}`);
    })
}

module.exports = App;