var configdev = {
    app: {
        appName: 'Framework',
        baseUrl: '', //add refix dạng '/projectname'
        staticUrl: '',
        port: 3000,
        secretKey: 'th@sBz$90k1sWVqP',
        proxy: '',
        sessionKey : 'kp@NUqa#lovep213jklP',
        sessionRedis : true //sử dụng session redis
    },
    recaptcha: {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        secretkey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    },
    zaloapp: {
        appid: '3750196300769930234',
        secretkey: 'w5GHYMicXUkTZWPveR34',
        callback: 'http://crm.zing.vn:3000/callback/zalo'
    },
    db: {
        host: 'localhost',
        port: '27017',
        name: 'nodejs_fw',
        username: 'root',
        password: '123456'
    },
    cors:{
        whitelist : ['http://localhost']
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        options: {}
    }
};

module.exports = configdev;