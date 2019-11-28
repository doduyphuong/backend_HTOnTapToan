var config = {
    app: {
        appName: 'CRM Event Handle',
        baseUrl: '/webhook-crm', //add refix dạng '/projectname'
        staticUrl: 'http://app.brand.zing.vn/webhook-crm',
        port: 80,
        secretKey: 'th@sBz$90k1sWVqP',
        proxy: 'http://10.30.46.99:3128'
    },
    recaptcha: {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        secretkey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    },
    zaloapp: {
        appid: '3685435022798396002',
        secretkey: '20GmfUL3GukSLOF33EU4',
        callback: 'https://app.event.zaloapp.com/zs/app/callback?type=app&state=3326E94E611F3B3B5003',
        oasecret : 'LCW41870QOVH1tD6PbNI'
    },
    db: { //staging database
        host: '10.30.46.201',
        port: 27017,
        name: 'staging_zsl_crm',
        username: 'staging_zsl_crm_user',
        password: 'lLg8Eh1JBzJedE2u'
    },
    cors:{
        whitelist : ['http://crm.zing.vn', 'http://localhost', 'http://app.event.zalo.me', 'http://app.brand.zing.vn']
    },
    redis: {
        host: '10.30.46.20',
        port: 6379,
        prefix: 'zsl_crm_',
        db: 0,
        options: {}
    }
};

module.exports = config;