/**
 * Created by xiaos on 17/4/14.
 */

const model_util = {
    transform (doc, ret, options) {
        ret.id = ret._id;

        if (ret.private_data){//用户
            if(ret.private_data.phone) ret.user_data.phone = ret.private_data.phone;
            if(ret.private_data.email) ret.user_data.email = ret.private_data.email;
        }

        delete ret._id;
        delete ret.__v;
        delete ret.private_data;
        delete ret.counter_data;
    }
};

//时间戳
const timestamp = {};
timestamp.pre_update = (query)=>{
    query.update({},{$set:{updated_at:new Date().getTime()}})
};

timestamp.pre_save = (data) =>{
    const currentTime = new Date().getTime();
    data.updated_at = currentTime;
    if (!data.created_at) data.created_at = currentTime;
};

module.exports = {
    model_util,
    timestamp
};