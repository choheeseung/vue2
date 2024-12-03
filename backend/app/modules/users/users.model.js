const usersModel = {};

usersModel.tableName = "tbl_members";
usersModel.getUser = async(value, column="id") => {
    const db = database();
    let result = null;

    try {
        await db(usersModel.tableName)
            .select("*")
            .select(db.raw("INET_ATON(`loged_ip`) AS `loged_ip`"))
            .where(column, value)
            .limit(1)
            .then((rows) => {
                if (rows && rows.length > 0) {
                    result = rows[0];
                }
            })
    }
    catch {
        result = null;
    }
    return result;
}

usersModel.addUser = async(data) => {
    data.status = data?.status ?? 'Y';
    data.login_id = data?.login_id ?? '';
    data.login_pass = data?.login_pass ?? '';
    data.phone = data?.phone ?? '';
    data.nickname = data?.nickname ?? '';
    data.auth = data?.auth ?? 1;
    data.created_at = data?.created_at ?? new Date();
    data.updated_at = data?.updated_at ?? new Date();
    data.agree_marketing = data?.agree_marketing ?? 'N';
    data.privacy_agree_at = data?.privacy_agree_at ?? new Date();

    data.login_pass = require('sha256')(require('md5')(appConfig.secretKey + data.login_pass));

    let result = false;
    const db = database();

    try {
        await db(usersModel.tableName)
            .insert(data)
            .then(() => {
                result = true;
            });
    }
    catch {

    }
    return result;
}

usersModel.createToken = async(type, userInfo) => {
    const jwt = require('jsonwebtoken');
    const expiresIn = type === 'refresh' ? appConfig.jwt.refreshTokenExpire : appConfig.jwt.accessTokenExpire;

    return await jwt.sign({
        id: userInfo.id
    }, appConfig.secretKey, {
        expiresIn
    })
}

usersModel.responseToken = async(userInfo) => {
    let newAccessToken = '',
        newRefreshToken = '';
    await usersModel.createToken('access', userInfo).then((v) => (newAccessToken = v));
    await usersModel.createToken('refresh', userInfo).then((v) => (newRefreshToken = v));

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}

module.exports = usersModel;