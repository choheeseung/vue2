const usersController = {};

usersController.phoneAuth = async(req, res) => {
    const phone = req.body?.phone?.replace('/-/g', '') ?? '';
    const code = Math.floor(100000 + Math.random() * 900000);

    if (phone.length === 0) {
        return res.status(400).json({error: '핸드폰 번호를 입력하세요.'});
    }

    const result = {
        authCode: code
    }
    return res.json({result})
}

usersController.userRegister = async(req, res) => {
    let login_id = req.body?.email ?? '';
    let login_pass = req.body?.password ?? '';
    let login_pass_confirm = req.body?.passwordConfirm ?? '';
    let nickname = req.body?.nickname ?? '';
    let phone = req.body?.phone ?? '';
    let agree_marketing = req.body?.agreeMarketing ? 'Y' : 'N';
    let privacy_agree_at = (new Date())

    const usersModel = loadModule('users', 'model');

    if (nickname === '') {
        return res.status(400).json({error:'[닉네임]은 필수 입력값입니다'})
    }
    if (login_id === '') {
        return res.status(400).json({error:'[이메일주소]는 필수 입력값입니다'})
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    console.log(emailRegex.test(login_id));
    if (!emailRegex.test(login_id))
    {
        return res.status(400).json({error:'올바른 형식의 [이메일주소]가 아닙니다'});
    }

    const check1 = await usersModel.getUser(login_id, 'login_id');
    if (check1 !== null) {
        return res.status(400).json({error:'이미 가입된 [이메일주소] 입니다.'});
    }

    if (login_pass === '') {
        return res.status(400).json({error:'[비밀번호]는 필수 입력값입니다'});
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&amp;])[A-Za-z\d@$!%*#?&amp;]{8,}$/;
    if (!passwordRegex.test(login_pass)) {
        return res.status(400).json({error:'[비밀번호]는 8자 이상, 하나이상의 문자,숫자 및 특수문자를 사용하셔야 합니다'});
    }

    if (login_pass !==  login_pass_confirm)
    {
        return res.status(400).json({error:'[비밀번호]와 [비밀번호 확인]이 서로 다릅니다.'});
    }

    const result = await usersModel.addUser({
        login_id,
        login_pass,
        phone,
        nickname,
        agree_marketing,
        privacy_agree_at
    });

    if (result) {
        return res.json({result: 'success'});
    }
    else {
        return res.status(500).json({result: 'fail'});
    }
}

usersController.authorize = async(req, res) => {
    const loginId = req.body?.loginId ?? '',
        loginPass = req.body?.loginPass ?? '';

    if( loginId.length === 0 )
        return res.status(400).json({error:'[이메일주소]를 입력하세요.'});

    if( loginPass.length === 0 )
        return res.status(400).json({error:'[비밀번호]를 입력하세요.'});

    const UserModel = loadModule('users', 'model');
    let user = await UserModel.getUser(loginId, 'login_id');

    if (user === false || user === null)
        return res.status(400).json({error:'가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.'});

    const encryptedPassword = require('sha256')(require('md5')(appConfig.secretKey + loginPass));

    if (user.login_pass !== encryptedPassword)
        return res.status(400).json({error:'가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.'});

    if (user.status !== 'Y')
        return res.status(400).json({error:'가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.'});

    return await UserModel.responseToken(user)
        .then(result => {
            return res.json(result);
        });
}

usersController.refreshToken = async(req, res) => {
    const refreshToken = req.body?.refreshToken ?? '';
    const jwt = require('jsonwebtoken');

    if (!refreshToken)
        return res.status(401).json({error: '사용자 로그인 정보가 유효하지 않습니다.'});

    await jwt.verify(refreshToken, appConfig.secretKey, async(error, decoded) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({error: '사용자 로그인 정보가 유효하지 않습니다.'});
            }
            return res.status(401).json({error: '사용자 로그인 정보가 유효하지 않습니다.',});
        }
        const UserModel = loadModule('users', 'model');

        let user = {};
        try {
            await UserModel.getUser(decoded.id, 'id')
                .then((res) => {
                    user = res;
                });
        } catch {
            user = null;
        }

        if (user === {} || user === null || user.status !== 'Y')
            return res.status(400).json({error: '가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.'});

        return await UserModel.responseToken(user).then((json) => {
            return res.status(200).json(json);
        })
    })
}

usersController.getInfo = async(req, res) => {
    const loginUserId = req.loginUser?.id ?? 0;

    if (loginUserId === undefined || loginUserId < 1) {
        return res.status(400).json({error: '잘못된 접근입니다.'})
    }

    const UserModel = loadModule('users', 'model');

    let user = {};
    try {
        await UserModel.getUser(loginUserId, 'id').then(res => { user = res });
    } catch {
        user = null;
    }

    if (user === {} || user === null || user.status !== 'Y')
        return res.status(400).json({code:'AUTH.ERR007', error: '탈퇴한 회원이거나 접근이 거부된 회원입니다.'});

    return res.json(user);
}

usersController.loginUserCheck = async(req, res, next) => {
    const jwt = require('jsonwebtoken');
    const ipToInt = require('ip-to-int');

    req.loginUser = {
        id: 0,
        ip: ipToInt(req.headers['x-forwarded-for'] || req.connection.remoteAddress).toInt()
    }

    if (req.path === '/users/authorize/token' || req.path === '/users/authorize') {
        return next();
    }

    let accessToken = req.headers['Authorization'] || req.headers['authorization'];
    if (!accessToken) return next();
    accessToken = accessToken.replace('Bearer', '');
    await jwt.verify(accessToken, appConfig.secretKey, async(error, decoded) => {
        if (error) {
            return res.status(401).json({error: '토큰 유효기간이 만료되었습니다.'});
        }
        else {
            req.loginUser.id = decoded.id;
            return next();
        }
    })
}

module.exports = usersController;