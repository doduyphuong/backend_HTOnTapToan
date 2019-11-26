var express = require('express');
var base = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var Excel = require('exceljs');


base.get('/', async function(req, res) {   
    var data = {};
    res.render('adminpanel/index', data);
});


/* GET home page. */
base.post('/list_page', async function(req, res) {  
    //check quyền
    let cp = await helpers.per_helper.auth_check_permission(req, res, helpers.per_helper.permission.view);

    var data = {};

    req.checkBody('page', 'Name is required').isNumeric();
    req.checkBody('page_size', 'Status is required').isNumeric();
    req.checkBody('model', 'Model is required').notEmpty();
    req.checkBody('filter', 'Filter is required').notEmpty();
    req.checkBody('is_action', 'Is action is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
        req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else{

        let page = 1;
        try{
            page = parseInt(req.body.page);
        }
        catch(e){
        }

        let page_size = 15;
        try{
            page_size = parseInt(req.body.page_size);
        }
        catch(e){
        }
        
        let model = req.body.model;
        let filter = req.body.filter;
		try
        {	
			filter = filter.replace(/\$where/gi, ''); // lọc bug security $where
		}
        catch(e){}
        
        let search_fields = req.body.search_fields;
        let order = req.body.order;

         //Check cụ thể sâu trong module 
         let cp_deep = await helpers.per_helper.deep_check_permission(req, res, model.toLowerCase(), helpers.per_helper.permission.view);
        
        //Xử lý chọn fields
        let fields = 'all_fields';
        var user_data = await helpers.auth_helper.get_userdata(req);
        //tìm data cũ đã lưu
        var find = await bols.My_model.find_first('Manage_module_field', {username : user_data.username, module : model});      
        
        if(find != null){
            if(find.fields != '' && find.fields != undefined)
            {
                fields = find.fields;
            }
        }
		
        //Bắt đầu xử lý query
        let where = {};        
        if(filter != 'none')
        {
            try{
                where = JSON.parse(filter);    
                

                if(search_fields != undefined && where.search != undefined && where.search != '')
                {           
                    let or_cond = [];         
                    let arr_search_fields = search_fields.split(' ');
                    
                    arr_search_fields.forEach(element => {
                        try{
                            let tmp = '{"' + element + '" : ' + '{ "$regex" : "' + where.search + '", "$options" : "i" }}';
                             
                            let obj = JSON.parse(tmp);                       
                            or_cond.push(obj);
                        }
                        catch(e){
                            console.log(e);
                        }            
                    });

                    where['$or'] = or_cond; 
                }
                                
            }
            catch(e){
                console.log(e);
            } 

        }

        try{
            delete(where.search);
        }
        catch(e){

        }        
               
        let order_by = {createAt : 'asc'};
        if(order != '' && order != undefined)
        {
            try{
                order_by = JSON.parse(order);
            }
            catch(e){
            }
        }        

        let str_fields = '';
        let out_fields = {};
        if(fields != 'all_fields')
        {
            str_fields = fields;
            out_fields = fields.split(' ');            
        }   
        else{
            str_fields = '';
            out_fields = await bols.My_model.model_fields(model);
        }       


        var items = await bols.My_model.paging(model, where, str_fields, page, page_size, order_by);
        var total_item = await bols.My_model.total_item(model, where);
        var total_page =  Math.ceil(total_item / page_size);

        //xử lý show tên các field là khóa ngoại
        try{
            let c = items.length;        
            for(var i = 0;i<c;i++){
                if('id_role' in items[i]){
                    items[i]['id_role'] = await helpers.data_helper.get_manage_role_name(items[i]['id_role']);
                }
            }
        }
        catch(e){
        }

        //Xử lý danh sách action
        var action_list = [];
        if(req.body.action_list != '' && req.body.action_list != undefined)
        {
            action_list = JSON.parse(req.body.action_list);
        }

        data = {
            list : items,
            page : page,
            page_size : page_size,
            total_item : total_item,
            total_page : total_page,
            out_fields : out_fields,
            is_action : req.body.is_action,
            action_list : action_list            
        };
    }

    res.render('adminpanel/base/list_page', data);
});


//Xóa data cho 1 module 
base.post('/delete_list_id/:module', async function(req, res) {      
  
    var module = '';
    var model_name = '';

    req.checkBody('fw_cb_items', 'Have not any item valid').notEmpty();  
    var errors = req.validationErrors();  
    
    if(errors){
      //console.log(errors);
      req.flash('message_error', helpers.helper.validator_error_message(errors));      
    }
    else
    {    
        
        if(req.params.module){
            module = req.params.module.toLowerCase();  
            model_name = module.charAt(0).toUpperCase() + module.slice(1);
            if(module != 'manage_user' && module != 'manage_role')
            {
                var find_module = await bols.My_model.find_first('Manage_module', {name : module});
                if(find_module){
                    //check quyền config của user đối với module
                    let cp = await helpers.per_helper.deep_check_permission(req, res, module, helpers.per_helper.permission.delete);
                }
                else{
                    return helpers.helper.redirect(res, '/adminpanel/error/101'); 
                }
            }
            else{
                return helpers.helper.redirect(res, '/adminpanel/error/101');  
            }
        }
        else{
            return helpers.helper.redirect(res, '/adminpanel/error/404');  
        }


        var msg = '';
        var items = [];
        if(typeof(req.body.fw_cb_items) == 'string'){
            items.push(req.body.fw_cb_items);
        }
        else{
            items = req.body.fw_cb_items;
        }
    
        for(var i = 0;i< items.length; i++)
        {
            let where = {
            '_id' : '' + items[i]
            };
    
            let del = await bols.My_model.delete(model_name, where);
            if(del.status == 200){
            msg += 'Deleted success: ' + del.data._id + '<br>'; 
            }
            else{
            msg += 'Deleted fail: ' + del.data._id + '<br>'; 
            }
        }
        req.flash('message_success', msg);
    }
  
    //quay về trang trước
    var returnUrl = helpers.admin_helper.get_returnUrl(req, res);
        
    res.render('adminpanel/notice', { returnUrl : returnUrl });
});

base.post("/delete_all/:module", async function(req, res) {
    var module = "";
    var model_name = "";
    
    if (req.params.module) {
        module = req.params.module.toLowerCase();
        model_name = module.charAt(0).toUpperCase() + module.slice(1);

        if(module != 'manage_user' && module != 'manage_role')
        {
            var find_module = await bols.My_model.find_first("Manage_module", {
                name: module
            });
            if (find_module) {
                
                //check quyền config của user đối với module
                let cp = await helpers.per_helper.deep_check_permission(req, res, module,helpers.per_helper.permission.delete);
            } else {
                return helpers.helper.redirect(res, '/adminpanel/error/101'); 
            }
        }
        else{
            return helpers.helper.redirect(res, '/adminpanel/error/101'); 
        }
    } else {
        return helpers.helper.redirect(res, '/adminpanel/error/404'); 
    }

    let del = await bols.My_model.deleteMany(model_name, null);
    if (del.status == 200) {
        req.flash("message_success", "Deleted success");
    } else {
        req.flash("message_error", "Deleted error");
    }

    //quay về trang trước
    var returnUrl = helpers.admin_helper.get_returnUrl(req, res);

    res.render("adminpanel/notice", { returnUrl: returnUrl });
});

base.post('/upload-photo-binary', function(req, res) { 
    var result = false;
    var data = '';
    var large_w = req.query.large_w;
    var large_h = req.query.large_h;
    var thumb_w = req.query.thumb_w;
    var thumb_h = req.query.thumb_h;
    var file_type = req.query.type;
    var qqfile = req.body;
    
    if(file_type && large_w && large_h && thumb_w && thumb_h && qqfile){
        if(file_type == 'image/jpg' || file_type == 'image/png' || file_type == 'image/jpeg'){
            let extension = 'png';
            if(file_type == 'image/jpg' || file_type == 'image/jpeg')
            {
                extension = 'jpg';
            }
            

            helpers.image_helper.write_base64_to_image(req, res, extension, 'photos', large_w, large_h, thumb_w, thumb_h, 'adtima', function(upload){
                result = upload.result;
                data = upload.data;
                return res.send(JSON.stringify({
                    result : result,
                    data : data,
                    image : '/medias/photos/' + data 
                }));
            });        
        }
        else{
            data = 'Invalid image data. Please check your input.';
            return res.send(JSON.stringify({
                result : result,
                data : data,
                image : ''
            }));    
        }
    }
    else{
        data = 'Invalid image data. Please check your input.';
        return res.send(JSON.stringify({
            result : result,
            data : data,
            image : ''
        }));
    }
});


base.get('/export/:module', async function(req, res) {   
    var downloadPath = '';
    var module = '';
    var model_name = ''
    if(req.params.module){        

        module = req.params.module.toLowerCase();  
        model_name = module.charAt(0).toUpperCase() + module.slice(1);

        var find_module = await bols.My_model.find_first('Manage_module', {name : module});
        if(find_module){          

            //check quyền config của user đối với module
            let cp = await helpers.per_helper.deep_check_permission(req, res, module, helpers.per_helper.permission.export);
            
            //filter
            var filter = {};
            filter = helpers.helper.bind_data_filter(req);           
            
            let fields = '';
            var user_data = await helpers.auth_helper.get_userdata(req);
            //tìm data cũ đã lưu
            var find = await bols.My_model.find_first('Manage_module_field', {username : user_data.username, module : model_name});      
            
            if(find != null){
                if(find.fields != '' && find.fields != undefined)
                {
                    fields = find.fields;
                }
            }
            else{
                fields = await bols.My_model.model_fields(model_name);
                fields = fields.join(' ');
            }

            var arr_field = fields.split(' ');
            
            var ex_arr_field = [];
            for(let i = 0;i < arr_field.length;i++){
                let item = { header: arr_field[i], key : arr_field[i], width : 50 }
                ex_arr_field.push(item);
            }      
            
            let time = helpers.helper.get_string_time();
            var tempt = 'medias/export/export_' + model_name + '_'  + time + '.xlsx'; 
            var tempFilePath = __base + tempt;
            downloadPath = 'export_' + model_name + '_'  + time + '.xlsx';          
            
            var options = {};
            options.filename = tempFilePath;

            const workbook = new Excel.stream.xlsx.WorkbookWriter(options);

            var worksheet = null;
            var num = 0;        
            var stream = await bols.My_model.find_all_stream(model_name, filter, fields);
            const MAX_Record = 500000;

            stream.on('error', (e) => {
                console.log(e);              
            });

            
            var timeBegin = new Date().getTime();

            stream.on('data', (data) => {
                var item = {};
                for (let j = 0; j < arr_field.length; j++) {
                    item[arr_field[j]] = data[arr_field[j]];
                }          
                
                if(num % MAX_Record == 0 || num == 0){
                    worksheet = workbook.addWorksheet('Sheet ' + Math.ceil(num / MAX_Record));
                    worksheet.columns = ex_arr_field;
                    worksheet.state = 'visible';
                }

                worksheet.addRow(item).commit();
                num++;
            });

            stream.on('end', () => {
                workbook.commit().then(() => {                    
                    var key = downloadPath;
                    helpers.redis_helper.set(key, 'success', 60);
                    var t = new Date().getTime() - timeBegin;
                    var est = Math.floor(t / (1000 * 60));
                    helpers.redis_helper.set(key + '_est_time', est, 60);
                })
                .catch((e) => {
                    console.log(e);            
                });
            });     
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

    //quay về trang trước
    var returnUrl = __baseUrl + '/adminpanel/' + module + '/' + helpers.helper.get_full_query_string(req);        
    res.render('adminpanel/download', { returnUrl : returnUrl, downloadPath : downloadPath });
});

base.get('/check-status-file-download', async function(req, res){    
    var status = 'false';
    var time = 0;
    var q = req.query.p;
    if(q){
        var k = q; 
        var get_redis = await helpers.redis_helper.get(k);
        if(get_redis != null)
        {
            if(get_redis == 'success')
            {
                status = 'success';
            }
        }

        var get_redis_time = await helpers.redis_helper.get(k + '_est_time');
        if(get_redis_time != null){
            time = parseInt(get_redis_time);
        }
    }

    var data = {
        status : status,
        time : time
    };
    
    return res.send(JSON.stringify(data));
}); 

//Show menu các module
base.get('/ex_module_menu', async function(req, res){
    
    let ex_module = await bols.My_model.find_all('Manage_module', { is_backend_menu : 1}, 'name description', { backend_menu_weight : 'asc' });
    let c = ex_module.length;
    let return_menu = [];
    //console.log(ex_module);
    for(var i=0;i<c;i++){
        var check_permission = await helpers.per_helper.manual_check_permission(req, ex_module[i].name, helpers.per_helper.permission.view);
       
        if(check_permission == true)
        {
            //có quyền view thì thấy menu
            return_menu.push(ex_module[i]);
        }
    }

    var data = {
        ex_module : return_menu
    };

    res.render('adminpanel/ex_module_menu', data);
}); 

module.exports = base;