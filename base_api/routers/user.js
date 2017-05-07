/**
 * Created by xiaos on 17/3/30.
 */
const user_model = require('../models/user');
const lodash = require('lodash');
const util = require('./util');


//新建用户
const user_new_service = async(req,res)=>{
    try{
        const {user_data={},private_data={}} = req.body;
        const user = await user_new_action(user_data,private_data);
        return jsonResult(req,res,user);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//全量更新给予mongo的全量操作符
const user_update_service = async (req,res)=>{
    try{
        //doc = {"$set":{"user_data.name":"xiaos"}}
        //doc = {"$push":{"user_data.phones":[18686535083]}}
        //doc = {"user_data":{"name":"shen"}}
        let {conditions={},doc={}} = req.body;
        const result = await user_update_action(conditions,doc);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//update_new：增量更新
const user_update_new_service = async (req,res)=>{
    try{
        let {conditions={},user_data={},private_data={}} = req.body;
        const result = await user_update_new_action(conditions,user_data,private_data);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//通过id删除数据
const user_remove_service = async (req,res)=>{
    try{
        const {id} = req.body;
        const user = await user_remove_action(id);
        return jsonResult(req,res,user);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//user查询
const user_find_service = async(req,res)=>{
    try {
        //total_count=true时会带出find的总数，默认为false
        const {conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false} = req.body;
        const result = await user_find_action(conditions,sort_by,page,limit,since_id,cursor_id,total_count);
        return total_count?selfResult(req,res,result):jsonResult(req,res,result);
    }  catch (err){
        return errorResult(req,res,err);
    }
};

const user_new_action = async (user_data={},private_data={})=>{
    const user = await user_model.create({
        user_data,
        private_data
    });

    if (user.private_data.phone){
        user.user_data.phone = user.private_data.phone;
    }
    return user;
};

const user_update_action = async(conditions,doc)=>{
    if (typeof conditions !== 'object') throw new Error('参数condistions必须为对象');
    if (typeof doc !== 'object') throw new Error('参数doc必须为对象');
    if(Object.keys(conditions).length === 0) throw new Error('缺少必传参数condistions');
    if (Object.keys(doc).length === 0) return '无数据更新';

    if (doc.hasOwnProperty('user_data')){//合并后增量更新
        const user = await user_model.findOne(conditions);
        if (user){
            user.user_data =  lodash.merge(user.user_data,doc.user_data);
            user.isModified('user_data');
            await user.save();
            return user;
        }else {
            return '未找到要更新的数据';
        }
    }else {
        //全功能更新
        await user_model.update(conditions,doc);
        return await user_model.findOne(conditions);
    }
};

const user_update_new_action = async (conditions,user_data,private_data)=>{
    let user_exists = await user_model.findOne(conditions);
    if (!user_exists){//不存在
        return await user_new_action(user_data,private_data);
    }else {//已存在  user_data增量更新 相同字段的值覆盖 不存在的字段增加 且支持mongo所有语法
        const exist_user_data = user_exists.user_data;
        //增量更新
        user_data = lodash.merge(exist_user_data,user_data);
        await user_model.update(conditions,{$set:{user_data}});
        return await user_model.findOne(conditions);
    }
};

const user_remove_action = async(id)=>{
    if(!id) throw new Error('缺少必选参数id');
    return await user_model.findByIdAndRemove({_id:id});
};

const user_find_action = async(conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false)=>{
    return util.find_handle(user_model,conditions,sort_by,page,limit,since_id,cursor_id,total_count);
};



module.exports = {
    user_new_service,
    user_update_new_service,
    user_find_service,
    user_update_service,
    user_remove_service,
    user_new_action,
    user_update_new_action,
    user_find_action,
    user_update_action,
    user_remove_action
};