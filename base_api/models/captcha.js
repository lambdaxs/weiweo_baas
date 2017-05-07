/**
 * Created by xiaos on 17/4/15.
 */
//验证码模块
const mongoose = require('mongoose');
const util = require('./util');
const keygen = require('../lib/keygen');
const util_sms = require('../routers/util_sms');
const util_email = require('../routers/util_email');

const captcha_schema = new mongoose.Schema({
    sign:String,
    code:Number,
    created_at:Number,
    updated_at:Number
});

captcha_schema.set('toJSON',{
   transform:util.model_util.transform
});

captcha_schema.pre('save',async function (next) {
    util.timestamp.pre_save(this);
    next();
});

captcha_schema.pre('update',async function (next) {
   util.timestamp.pre_update(this);
   next();
});


const send_code = async(sign,code)=>{
    let is_phone = false;
    let is_email = false;
    if (/^1[0-9]{2}\d{8}$/.test(sign)){//手机号
        is_phone = true;
    }else if(/.*@.*/.test(sign)){//邮箱
        is_email = true;
    }else {
        throw new Error('sign格式错误，不是手机号/邮箱号');
    }

    if (is_phone){
        await util_sms.send_sms_action(sign,`您的验证码是:${code}`);
        return true;
    }else if(is_email){
        await util_email.send_email_action(sign,`验证码`,`您的验证码是:${code}`);
        return true;
    }else {
        return false;
    }
};


//发送验证码
captcha_schema.methods.send_code = async(sign)=>{

    //60s内不允许重复发送验证码
    const captcha_model = mongoose.model('captcha');
    const exist_phone = await captcha_model.findOne({sign});
    const code = Math.floor(Math.random() * 900000) + 100000;

    if (exist_phone){//已发送过验证码 继续判断是否超过60s
        const {updated_at} = exist_phone;
        const time_diff = new Date().getTime() - updated_at;
        if (time_diff > 60*1000){//再次发送验证码
            return await send_code(sign,code);
        }else {
            throw new Error(`请${parseInt(time_diff/1000)}s后再次请求验证码`);
        }
    }else {//先存库，再发送验证码
        await  captcha_model.create({
            sign,
            code
        });
        return await send_code(sign,code);
    }
};

//验证验证码
captcha_schema.methods.compare_code = async(sign,code)=>{
    const captcha_model = mongoose.model('captcha');
    const exist_captcha = await captcha_model.findOne({sign});
    if (!exist_captcha) {
        throw new Error('请发送验证码');
    }else {
        const {updated_at} = exist_captcha;
        if (new Date().getTime() - updated_at > 30*60*1000){//检查验证码是否过期 30min
            throw new Error('验证码已过期，请重新发送');
        }else {
            const origin_code = exist_captcha.code;
            return origin_code === code;
        }
    }
};

module.exports = mongoose.model('captcha',captcha_schema);

