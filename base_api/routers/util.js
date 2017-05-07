/**
 * Created by xiaos on 17/4/17.
 */
const lodash = require('lodash');

// const find_handle = {};
const find_handle = async(model,conditions={},sort_by={},page=1,limit=20,since_id=0,cursor_id=0,total_count=false)=>{
    if (limit > 200){
        throw new Error('limit参数不能超过200');
    }
    //时间线
    //分页优先级 since_id/limit > cursor/limit > page/limit
    if (since_id !== 0){
        return await model.find(conditions).where({id:{$gt:since_id}}).limit(limit).sort({id:1}).exec();
    }else if (cursor_id !== 0){
        return await model.find(conditions).where({id:{$lt:cursor_id}}).limit(limit).sort({id:-1}).exec();
    }else {
        //普通的page/limit分页
        const all_count = await model.find().count();
        const offset = (page - 1)*limit;
        const result = await model.find(conditions).skip(offset).limit(limit).sort(sort_by).exec();
        return  total_count?{error_code:0,result,total_count:all_count}:{error_code:0,result};
    }
};

const update_handle = async(model,data_obj_name,conditions={},doc)=>{

    if (typeof conditions !== 'object') throw new Error('参数condistions必须为对象');
    if (typeof doc !== 'object') throw new Error('参数doc必须为对象');
    if(Object.keys(conditions).length === 0) throw new Error('缺少必传参数condistions');
    if (Object.keys(doc).length === 0) return '无数据更新';
    if(data_obj_name !== 'user_data' && data_obj_name !== 'op_data' && data_obj_name !== 'private_data' && data_obj_name !== 'data') throw new Error('data的key不正确');

    if (doc.hasOwnProperty(data_obj_name)){//合并后增量更新
        const data = await model.findOne(conditions);
        if (data){
            data[data_obj_name] =  lodash.merge(data[data_obj_name],doc[data_obj_name]);
            data.isModified(data_obj_name);
            await data.save();
            return data;
        }else {
            return '未找到要更新的数据';
        }
    }else {//全功能更新
        await model.update(conditions,doc);
        return await model.findOne(conditions);
    }
};

const remove_handle = async(model,id)=>{
    return await model.findByIdAndRemove({id:id});
};

//解析include
const parse_includes = async(result,model,{key,return_key,path=[]})=>{
    if (!key) return result;

    const keyMap = {
        'uid':'user_data',
        'data_id':'op_data',
        'op_id':'op_op_data',
        'op_op_id':'op_op_data'
    };

    const keys = result.map(obj=>{
        return lodash.get(obj,key);
    });

    if (path.length === 0){//all
        const users = await model.find({}).in('id',keys);
        return result.map(obj=>{
            obj['user_data'] = users.user_data;
           return obj;
        });
    }else {//part

        const users = await model.find({}).in('id',keys);

        return result.map((obj)=>{

            const user = users.filter(user=>{
               return user.id === obj[key];
            }).pop();

            if (user){
                const data_obj = user._doc[keyMap[key]];

                for (let k of Object.keys(data_obj)){
                    if (path.indexOf(k) === -1){//不存在
                        delete data_obj[k];
                    }
                }
                obj._doc['user_data'] = data_obj;
                return obj;
            }else {
                return obj;
            }

        });
    }
};

module.exports = {
    find_handle,
    update_handle,
    remove_handle,
    parse_includes
};