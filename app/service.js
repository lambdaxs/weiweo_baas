/**
 * Created by xiaos on 17/4/20.
 */

const user_router = require('../base_api/routers/user');
const user_model = require('../base_api/models/user');

const data_router = require('../base_api/routers/data');
const data_model = require('../base_api/models/data');

const op_data_router = require('../base_api/routers/op_data');
const op_data_mode = require('../base_api/models/op_data');

const captcah_model = require('../base_api/models/captcha');

const check_user_group = (user_group)=>{
    //用户角色：后台管理员 秘书 销售主任 客户
    const user_groups = ['admin','secr','sell','customer'];
    return user_groups.indexOf(user_group) !== -1;
};

//用户注册接口
const user_reg = async(req,res)=>{
    try{
        const {phone=null,password=null,user_group=null,user_data} = req.body;
        if (!phone || !password || !user_group) return errorResult(req,res,'请填写完整信息phone|password|user_group');
        if (!check_user_group(user_group)) return errorResult(req,res,'user_group参数为枚举类型(admin/sell/secr/customer)');

        //查询是否已注册
        const exists_user = await user_model.findOne({'private_data.phone':phone});
        if (exists_user) return errorResult(req,res,'该手机号已注册');

        //入库
        user_data.user_group = user_group;
        const user = await user_router.user_new_action(user_data,{phone,password});
        return jsonResult(req,res,user);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//用户密码登录接口
const user_login_by_password = async(req,res)=>{
    try{
        const {phone=null,password=null} = req.body;
        if (!phone || !password) return errorResult(req,res,'请填写完整信息');

        const exists_user = await user_model.findOne({'private_data.phone':phone});
        if (!exists_user) return errorResult(req,res,'该用户不存在');

        if (!exists_user.comparePassword(password)) return errorResult(req,res,'密码错误');

        return jsonResult(req,res,exists_user);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//发送验证码
const user_login_send_code = async(req,res)=>{
    try{
        const {phone=null} = req.body;
        const cap = new captcah_model();
        const result = await cap.send_code(phone);
        return result?jsonResult(req,res,result):errorResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//用户短信验证码登录
const user_login_compare_code = async(req,res)=>{
    try{
        const {phone=null,code=null} = req.body;
        if (!phone || !code) return errorResult(req,res,'phone和code为必传字段');

        const cap = new captcah_model();
        const result = await cap.compare_code(phone,code);
        return result?jsonResult(req,res,result):errorResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


//楼盘项目
//查询项目列表
const item_find = async(req,res)=>{
    try{
        const item = await data_model('item').find({});
        if (item){
            return jsonResult(req,res,item[0]);
        }{
            return jsonResult(req,res,item);
        }
    }catch (err) {
        return errorResult(req,res,err);
    }
};

//删除项目
const item_remove = async(req,res)=>{
    try{
        const {item_ids} = req.body;
        if (!item_ids) return errorResult(req,res,'缺少必要参数（item_ids）');

        if (Array.isArray(item_ids)){//批量删除
            const result =  await data_model('item').remove({}).in('id',item_ids);
            return jsonResult(req,res,result);
        }else {//根据id删除
            const result =  await data_model('item').remove({id:item_ids});
            return jsonResult(req,res,result);
        }
    }catch (err){
        return errorResult(req,res,err);
    }
};

//新建项目数据
const item_update_new = async(req,res)=>{
    try{
        //项目名字 项目地址 项目数据{占地 建地 户数 物业 得房率 绿地率}
        //coverArea buildingArea houseNUm property getHouseRate greenRate garage volumeRate deedTax
        //estateDevelop investors designer manufacturer supervisor east south western north
        const {uid,item_name,item_location,item_data} = req.body;

        if (!uid || !item_name || !item_location) return errorResult(req,res,'缺少必要参数（uid,item_name,item_location）');

        //检查是否是管理员
        const admin_user = await user_model.findOne({id:uid,user_data:{user_group:'admin'}});
        if (!admin_user) return errorResult(req,res,'该用户不是管理员');

        //查询项目名是否已经存在
        const exists_item = await data_model('item').findOne({data:{item_name}});
        if (exists_item) {//更新数据
            const conditions = {
                data:{
                    item_name
                }
            };
            const doc = {
                data:{
                    item_name,
                    item_location,
                    item_data
                }
            };
            const result = await data_router.data_update_action('item',{conditions,doc});
            return jsonResult(req,res,result);
        }else {
            //新建项目
            const data = {
                item_name,
                item_location,
                item_data
            };
            const item = await data_model('item').create({
                uid,
                data
            });
            return jsonResult(req,res,item);
        }
    }catch (err){
        return errorResult(req,res,err);
    }
};

const item_location_map = {
    location:"item_location",
    detail:"item_detail"
};

//查看区位介绍
const item_data_find = async(req,res)=>{
    try{
        const {item_id = null,type=null} = req.body;
        if (!item_id || !type) return errorResult(req,res,'缺少必选参数（item_id,type）');
        if (['location','detail'].indexOf(type) === -1) return errorResult(req,res,'type参数只能为location或detail');

        const conditions = {
            data_id:item_id,
            op_name:item_location_map[type]
        };
        const item_datas = await op_data_router.op_data_find_action('item',{conditions});
        return jsonResult(req,res,item_datas);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//添加区位介绍
const item_data_new = async(req,res)=>{
    try{
        const {uid=null,item_id=null,title=null,content=null,imgUrl,type=null} = req.body;
        if (!uid || !item_id || !title || !content ||!type) return errorResult(req,res,'缺少必选参数（uid,item_name,title,content,type）');
        if (['location','detail'].indexOf(type) === -1) return errorResult(req,res,'type参数只能为location或detail');

        const data = {
            uid,
            data_id:item_id,
            op_name:item_location_map[type],
            op_data:{
                title,
                content,
                imgUrl
            }
        };
        const item_location = await op_data_router.op_data_new_action('item',data);
        return jsonResult(req,res,item_location);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//编辑区位介绍
const item_data_update = async(req,res)=>{
    try{
        const {id=null,title=null,content=null,imgUrl} = req.body;
        if (!id || !title || !content) return errorResult(req,res,'缺少必选参数（id,title,content）');

        const conditions = {
            id:id
        };
        const doc = {
            op_data:{
                title,
                content,
                imgUrl
            }
        };
        const item_location = await op_data_router.op_data_update_action('item',{conditions,doc});
        return jsonResult(req,res,item_location);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//删除区位介绍
const item_data_remove = async(req,res)=>{
    try{
        const {id=null} = req.body;
        if (!id) return errorResult(req,res,'缺少必选参数（id）');
        const conditions = {
            id:id
        };
        const item_location = await op_data_router.op_data_remove_action('item',{conditions});
        return jsonResult(req,res,item_location);
    }catch (err){
        return errorResult(req,res,err);
    }
};


//为项目新增DM
const item_dm_new = async(req,res)=>{
    try{
        //项目id:item_id
        //标题:title 内容:textContent 图片地址:imgUrl  销售人员姓名:sellerName 销售人员电话:sellerTel 评论列表:comments
        //户型基本信息:houseBaseInfo 户型:type 房号:number 建面:area 单价:unit_price 总价:price 首付:first_pay 贷款:loan 月供:month_pay 描述:house_desc

        //dm_type = ['house','location','introduce']
        const {uid,dm_type,title,textContent,imgUrl,sellerName,sellerTel,comments,houseBaseInfo} = req.body;
        if (dm_type === 'house'){
            const data = {
                title,
                textContent,
                imgUrl,
                sellerName,
                sellerTel,
                comments,
                houseBaseInfo,
                dm_type
            };
            const result = await data_model('item_dm').create({
                uid,
                data
            });
            return jsonResult(req,res,result);
        }else {
            const data = {
                title,
                textContent,
                imgUrl,
                dm_type
            };
            const result = await data_model('item_dm').create({
                uid,
                data
            });
            return jsonResult(req,res,result);
        }
    }catch (err){
        return errorResult(req,res,err);
    }
};

//查找项目的户型DM列表
const item_dm_find = async(req,res)=>{
    try{
        const {item_id,dm_type} = req.body;
        const conditions = {'data.dm_type':dm_type,'data.item_id':item_id};
        const result = await data_model('item_dm').find(conditions);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


//更新户型
const item_dm_update = async(req,res)=>{
    try{
        const {dm_id,data} = req.body;
        const conditions = {id:dm_id};
        const doc = {
            data
        };
        const result = await data_router.data_update_action('item_dm',{conditions,doc});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//删除户型
const item_dm_remove = async(req,res)=>{
    try{
        const {dm_id} = req.body;
        const result = await data_router.data_remove_action('item_dm',{id:dm_id});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


//客户管理
//客户列表
const customer_find = async(req,res)=>{
    try{
        const {conditions={},page=1,limit=20} = req.body;
        const customers = await data_model('customer').find(conditions);
        return jsonResult(req,res,customers);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//新建客户
const customer_new = async(req,res)=>{
    try{
        //客户基本信息: name phone state qudao sex age height native_place live_place appearance  clothes voice nature work_place work_content income deposit other
        const {uid,data} = req.body;
        const customer = await data_model('customer').create({
            uid,
            data
        });
    }catch (err){
        return errorResult(req,res,err);
    }
};

//更新客户信息
const customer_update = async(req,res)=>{
    try{
        const {customer_id,data} = req.body;
        const doc = {
            data
        };
        const conditions = {'data.customer_id':customer_id};
        const result = await data_router.data_update_action('customer',{conditions,doc});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//删除客户信息
const customer_remove = async(req,res)=>{
    try{
        const {customer_id} = req.body;
        const result = await data_router.data_remove_action('customer',{id:customer_id});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//客户补录信息查询
const customer_note_find = async(req,res)=>{
    try{
        const {customer_id,page=1,limit=20} = req.body;
        const conditions = {
          'data.customer_id':customer_id
        };
        const result = await data_router.data_find_action('customer_note',{conditions,page,limit});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//客户信息补录新增
const customer_note_new = async(req,res)=>{
    try{
        const {uid,customer_id,date,note_type,note_num,note_content} = req.boyd;
        const data = {
            customer_id,
            date,
            note_type,
            note_num,
            note_content
        };
        const result = await data_router.data_new_action('customer_note',{uid,data});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//客户信息补录删除
const customer_note_remove = async(req,res)=>{
    try{
        const {customer_note_id} = req.body;
        const result = await data_router.data_remove_action('customer_note',{id:customer_note_id});
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


//销售人员管理
//新建销售人员
const sell_new = async(req,res)=>{
    try{
        const {phone,name,id_no,gander,id_image_url} = req.body;
        const user_data = {
            phone,
            name,
            id_no,
            gander,
            id_image_url,
            user_group:'sell'
        };
        await user_router.user_new_action(user_data,{});
    }catch (err){
        return errorResult(req,res,err);
    }
};

//销售人员列表
const sell_find = async(req,res)=>{
    try{
        const {conditions={},page=1,limit=20} = req.body;
        conditions.user_group = 'sell';
        const result = await user_router.user_find_action(conditions,page,limit);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//更新销售人员
const sell_update = async(req,res)=>{
    try{
        const {sell_id,phone,name,id_no,gander,id_image_url} = req.body;
        const conditions = {
            id:sell_id
        };
        const doc = {
            user_data:{
                phone,
                name,
                id_no,
                gander,
                id_image_url
            }
        };
        const result = await user_router.user_update_action(conditions,doc);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//删除销售人员
const sell_remove = async(req,res)=>{
    try{
        const {sell_id} = req.body;
        const result = await user_router.user_remove_action(sell_id);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

module.exports = {
    user_reg,
    user_login_by_password,
    user_login_send_code,
    user_login_compare_code,

    item_find,
    item_update_new,
    item_remove,

    item_data_find,
    item_data_new,
    item_data_update,
    item_data_remove,

    item_dm_find,
    item_dm_new,
    item_dm_update,
    item_dm_remove,

    customer_find,
    customer_new,
    customer_update,
    customer_remove,

    customer_note_find,
    customer_note_new,
    customer_note_remove,

    sell_find,
    sell_new,
    sell_update,
    sell_remove
};