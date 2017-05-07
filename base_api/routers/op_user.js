/**
 * Created by xiaos on 17/3/31.
 */

const op_user_model = require('../models/op_user');
const util = require('./util');
const lodash = require('lodash');

//service
const op_user_new_service = async(req,res)=>{
    const {uid,to_uid,op_name,op_data={}} = req.body;
    //参数校验

    try{
        const result = await op_user_new_action(req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

const op_user_update_service = async(req,res)=>{
    const {conditions={},doc} = req.body;
    //参数校验

    try{
        const result = await op_user_update_action(conditions,doc);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


const op_user_remove_service = async(req,res)=>{
    const {id} = req.bdoy;

    try{
        const result = op_user_remove_action(req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

const op_user_find_service = async(req,res)=>{
    const {conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false} = req.body;
    //检验

    try{
        const result = await op_user_find_action(req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

//action
const op_user_new_action = async({uid,to_uid,op_name,op_data})=>{
    return await op_user_model.create({
        uid,
        to_uid,
        op_name,
        op_data
    });
};

const op_user_update_action = async({conditions,doc})=>{
    return util.update_handle(op_user_model,'op_data',conditions,doc);
};

const op_user_remove_action = async({id})=>{
    if(!id) throw new Error('缺少必选参数id');
    return await op_user_model.findByIdAndRemove({id});
};

const op_user_find_action = async({conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false})=>{
    return util.find_handle(op_user_model,conditions,sort_by,page,limit,since_id,cursor_id,total_count);
};

module.exports = {
    op_user_find_service,
    op_user_new_service,
    op_user_update_service,
    op_user_remove_service,
    op_user_find_action,
    op_user_new_action,
    op_user_update_action,
    op_user_remove_action,
};