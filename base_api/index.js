
//base curd

//user=>user = op_user
//user=>data = op_data
//user=>op = op_op

//user
//user/new.json
//user/find.json
//user/update.json
//user/remove.json

//data
//data/:dataname/new.json
//data/:dataname/find.json
//data/:dataname/update.json
//data/:dataname/remove.json

//op_user
//op/user/new.json
//op/user/find.json
//op/user/update.json
//op/user/remove.json

//op_data
//op/:dataname/new.json
//op/:dataname/find.json
//op/:dataname/update.json
//op/:dataname/remove.json

//op_op
//op/:dataname/:opname/new.json
//op/:dataname/:opname/new.json
//op/:dataname/:opname/new.json
//op/:dataname/:opname/new.json
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const output = require('./lib/output');


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

const router = express.Router();


router.get('/',(req,res)=>{
    return res.send('hello world');
});

//user
const user = require('./routers/user');
router.route('/user/new.json').post(user.user_new_service);
router.route('/user/update_new.json').post(user.user_update_new_service);
router.route('/user/find.json').post(user.user_find_service);
router.route('/user/remove.json').post(user.user_remove_service);

//op_user
const op_user = require('./routers/op_user');
router.route('/op_user/new.json').post(op_user.op_user_new_service);
router.route('/op_user/find.json').post(op_user.op_user_find_service);
router.route('/op_user/update.json').post(op_user.op_user_update_service);
router.route('/op_user/remove.json').post(op_user.op_user_remove_service);

//data
const data = require('./routers/data');
router.route('/data/:data_name/new.json').post(data.data_new_service);
router.route('/data/:data_name/find.json').post(data.data_find_service);
router.route('/data/:data_name/update.json').post(data.data_update_service);
router.route('/data/:data_name/remove.json').post(data.data_remove_service);

//op_data
const op_data = require('./routers/op_data');
router.route('/op_data/:data_name/new.json').post(op_data.op_data_new_service);
router.route('/op_data/:data_name/update.json').post(op_data.op_data_update_service);
router.route('/op_data/:data_name/find.json').post(op_data.op_data_find_service);
router.route('/op_data/:data_name/remove.json').post(op_data.op_data_remove_service);

//op_op
// const op_op = require('./routers/op_op');
// router.route('/op/:data_name/:op_name/new.json').post(op_op.)

//util
const util_sms = require('./routers/util_sms');
const util_email = require('./routers/util_email');
const util_file_upload = require('./routers/util_upload');
router.route('/util/sms_send.json').post(util_sms.send_sms_service);
router.route('/util/email_send.json').post(util_email.send_email_service);
router.route('/util/file_upload.json').post(util_file_upload.file_upload);

//user
const service = require('../app/service');

router.route('/user_reg.json').post(service.user_reg);
router.route('/user_login_by_password.json').post(service.user_login_by_password);
router.route('/user_login_send_code.json').post(service.user_login_send_code);
router.route('/user_login_compare_code.json').post(service.user_login_compare_code);

//item
router.route('/item_find.json').post(service.item_find);
router.route('/item_update_new.json').post(service.item_update_new);
router.route('/item_remove.json').post(service.item_remove);

//item_data
router.route('/item_data_find.json').post(service.item_data_find);
router.route('/item_data_new.json').post(service.item_data_new);
router.route('/item_data_update.json').post(service.item_data_update);
router.route('/item_data_remove.json').post(service.item_data_remove);

//item_dm
router.route('/item_dm_find.json').post(service.item_dm_find);
router.route('/item_dm_update.json').post(service.item_data_update);
router.route('/item_dm_new.json').post(service.item_dm_new);
router.route('/item_dm_remove.json').post(service.item_dm_remove);

//customer
router.route('/customer_new.json').post(service.customer_new);
router.route('/customer_update.json').post(service.customer_update);
router.route('/customer_find.json').post(service.customer_find);
router.route('/customer_remove.json').post(service.customer_remove);

//customer_note
router.route('/customer_note_new.json').post(service.customer_note_new);
router.route('/customer_note_remove.json').post(service.customer_note_remove);
router.route('/customer_note_find.json').post(service.customer_note_find);

//sell
router.route('/sell_find.json').post(service.sell_find);
router.route('/sell_update.json').post(service.sell_update);
router.route('/sell_new.json').post(service.sell_new);
router.route('/sell_remove.json').post(service.sell_remove);

app.use('/',router);

app.listen(8081,()=>{
    console.log('baas start at 8081');
});