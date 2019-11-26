var express = require('express');
var report = express.Router();
var db = require('../models');
var bols = require('../model_bols');

report.get('/', async function(req, res) {   
    var data = {};
    res.render('adminpanel/index', data);
});

report.get('/standard/:module', async function(req, res){
    var module = '';
    var model_name = ''
    if(req.params.module){
        module = req.params.module.toLowerCase();  
        model_name = module.charAt(0).toUpperCase() + module.slice(1);

        var find_module = await bols.My_model.find_first('Manage_module', {name : module});
        if(find_module){
            //check quyền config của user đối với module
            let cp = await helpers.per_helper.deep_check_permission(req, res, module, helpers.per_helper.permission.report);

        }
        else{
            helpers.helper.show_404(res);  
        }
    }
    else{
        helpers.helper.show_404(res);  
    }

    var data = {
        module : module,
        model_name : model_name
    }

    res.render('adminpanel/report', data);
});

report.post('/get-data', async function(req, res){
    var data = {};
    let res_array = [];   
    res_array = [
        ['Date', 'Count']
    ];

    req.checkBody('startDate', 'Start Date is required').notEmpty();
    req.checkBody('endDate', 'End Date is required').notEmpty();
    req.checkBody('module', 'Module is required').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        //console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else{
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;
        var module = req.body.module;
        var model_name = module.charAt(0).toUpperCase() + module.slice(1);


        var arrayDate = helpers.helper.get_array_date(startDate, endDate);
        //console.log(arrayDate);

        let c = arrayDate.length;

        for(let i = 0 ;i < c;i ++){
            var where = {
                startDate : arrayDate[i],
                endDate : arrayDate[i]
            };

            let total_per_day = await bols.My_model.total_item(model_name, helpers.helper.bind_data_where(where));

            let item = [arrayDate[i], total_per_day];

            res_array.push(item);            
        }     

        //Tổng tử ngày đến ngày
        var where = {
                startDate : startDate,
                endDate : endDate
            };
        let total = await bols.My_model.total_item(model_name, helpers.helper.bind_data_where(where));
        
        data = {
            total : total,
            res_array : res_array
        }    

        //console.log(data);
    }

    res.send(JSON.stringify(data));
});

module.exports = report;