var configdev = {
    app: {
        appName: 'Ôn tập kiến thức',
        baseUrl: '', //add refix dạng '/projectname'
        staticUrl: '',
        port: 3001,
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
        host: '127.0.0.1',
        port: '27017',
        name: 'on_tap_cung_be',
        username: '',
        password: ''
    },
    cors:{
        whitelist : ['https://localhost:3000', 'https://localhost:3001']
    }
};

module.exports = configdev;