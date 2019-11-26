var config = {
    app: {
        appName: 'Framework',
        baseUrl: '/crm', //add refix dạng '/projectname'
        staticUrl: 'http://app.brand.zing.vn/crm',
        port: 80,
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
        appid: '3685435022798396002',
        secretkey: '20GmfUL3GukSLOF33EU4',
        callback: 'http://app.event.zalo.me/zs/app/callback?type=app&state=3326E94E611F3B3B5003'
    },
    db: { //staging database
        host: '10.30.46.201',
        port: 27017,
        name: 'staging_zsl_crm',
        username: 'staging_zsl_crm_user',
        password: 'lLg8Eh1JBzJedE2u'
    },
    cors:{
        whitelist : ['http://crm.zing.vn', 'http://app.event.zalo.me', 'http://app.brand.zing.vn', 'http://localhost']
    },
    redis: {
        host: '10.30.46.20',
        port: 6379,
        prefix: 'fw_',
        db: 0,
        options: {}
    }
};

module.exports = config;