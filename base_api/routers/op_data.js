/**
 * Created by xiaos on 17/3/31.
 */

const op_data_model = require('../models/op_data');
const util = require('./util');

const op_data_new_service = async(req,res)=>{

    try{
        const {data_name} = req.params;
        const {uid,data_id,op_name,op_data={}} = req.body;

        if (!data_name) return errorResult(req,res,'缺少必传参数data_name');
        if (!uid) return errorResult(req,res,'缺少必传参数uid');
        if (typeof op_data !== 'object') return errorResult(req,res,'data格式必须为object');

        const result = await op_data_new_action(data_name,req.body);

        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err.message);
    }
};

const op_data_update_service = async(req,res)=>{
    try{
        const {data_name} = req.params;
        const {conditions={},doc} = req.body;

        const result = await op_data_update_action(data_name,req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

const op_data_remove_service = async(req,res)=>{
    try{
        const {data_name} = req.params;
        const {id} = req.body;

        const result = await op_data_remove_acion(data_name,req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


const op_data_find_service = async(req,res)=>{
    try{
        const {data_name} = req.params;
        const {conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false} = req.body;

        const result = await op_data_find_action(data_name,req.body);
        return total_count? selfResult(req,res,result):jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err.message);
    }
};

const op_data_new_action = async(data_name,{uid,data_id,op_name,op_data})=>{
    return await op_data_model(data_name).create({
        uid,
        data_id,
        op_name,
        op_data
    });
};

const op_data_find_action = async(data_name,{conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false})=>{
    return await util.find_handle(op_data_model(data_name),conditions,sort_by,page,limit,since_id,cursor_id,total_count);
};

const op_data_update_action = async(data_name,{conditions,doc})=>{
    return await util.update_handle(op_data_model(data_name),'op_data',conditions,doc);
};

const op_data_remove_action = async(data_name,{id})=>{
    return await util.remove_handle(op_data_model(data_name),id);
};

module.exports = {
    op_data_new_service,
    op_data_find_service,
    op_data_remove_service,
    op_data_update_service,
    op_data_find_action,
    op_data_new_action,
    op_data_update_action,
    op_data_remove_action
};