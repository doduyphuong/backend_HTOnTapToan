var config = {
    app: {
        appName: 'Ôn tập kiến thức',
        baseUrl: '', //add refix dạng '/projectname'
        staticUrl: '',
        port: 80,
        secretKey: 'th@sBz$90k1sWVqP',
        proxy: ''
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
    db: {
        host: 'on-tap-cung-be.mongo.cosmos.azure.com',
        port: '10255',
        name: 'test',
        username: 'on-tap-cung-be',
        password: 'gaZTlm8SVfoDoR2Ghrzec49NIXZQrTIFJd0IV4KHqtIGV8l1heUWbhX42wv9HUqi17hJC3PyqA3huhxQ0pf80A%3D%3D'
    },
    cors:{
        whitelist : ['https://localhost:3000', 'https://localhost:3001']
    },
    // redis: {
    //     host: '127.0.0.1',
    //     port: 6379,
    //     db: 0,
    //     options: {}
    // }
};

module.exports = config;