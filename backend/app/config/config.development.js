module.exports = {
    appPort: 3000,
    secretKey: '',
    database: {
        host: 'localhost',
        username: 'root',
        password: 'mysql',
        port: 3306,
        database: 'studyvue2'
    },
    cors: {
        origin: true,
        credentials: true
    },
    jwt: {
        accessTokenExpire: '1m',
        refreshTokenExpire: '14d',
    }
}