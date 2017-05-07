/**
 * Created by xiaos on 17/3/31.
 */

const data_model = require('../models/data');
const user_model = require('../models/user');
const util = require('./util');

const data_new_service = async(req,res)=>{

    try{
        const {data_name} = req.params;
        const {uid,data={}} = req.body;

        if (!data_name) return errorResult(req,res,'缺少必传参数data_name');
        if (!uid) return errorResult(req,res,'缺少必传参数uid');
        if (typeof data !== 'object') return errorResult(req,res,'data格式必须为object');

        const result = await data_new_action(data_name,req.body);

        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err.message);
    }
};

const data_update_service = async(req,res)=>{
    try{
        const {data_name} = req.params;
        const {conditions={},doc} = req.body;

        const result = await data_update_action(data_name,req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};

const data_remove_service = async(req,res)=>{
    try{
        const {data_name} = req.params;
        const {id} = req.body;

        const result = await data_remove_acion(data_name,req.body);
        return jsonResult(req,res,result);
    }catch (err){
        return errorResult(req,res,err);
    }
};


const data_find_service = async(req,res)=>{
    try{
        const {data_name} = req.params;
        const {conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false,includes} = req.body;

        let result = await data_find_action(data_name,req.body);

        if (includes){
            result = await util.parse_includes(result.result,user_model,{
                key:includes.key,
                return_key:includes.return_key,
                path:includes.path
            });
        }

        return total_count? selfResult(req,res,result):jsonResult(req,res,result);
    }catch (err){
        console.log(err);
        return errorResult(req,res,err.message);
    }
};

const data_new_action = async(data_name,{uid,data})=>{
    return await data_model(data_name).create({
        uid,
        data
    });
};

const data_find_action = async(data_name,{conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false})=>{
    return await util.find_handle(data_model(data_name),conditions,sort_by,page,limit,since_id,cursor_id,total_count);
};

const data_update_action = async(data_name,{conditions,doc})=>{
    return await util.update_handle(data_model(data_name),'data',conditions,doc);
};

const data_remove_action = async(data_name,{id})=>{
    return await util.remove_handle(data_model(data_name),id);
};

module.exports = {
    data_new_service,
    data_find_service,
    data_remove_service,
    data_update_service,
    data_find_action,
    data_new_action,
    data_update_action,
    data_remove_action
};