/**
 * Created by xiaos on 17/4/15.
 */
const https = require('https');
const querystring = require('querystring');
const {luosimao} = require('../config/config.json').sms;
const util = require('util');


//发送短信服务
const UtilSendSmsRouter = {};
UtilSendSmsRouter.send_sms_service = async(req,res)=>{
    try{
        const {phone,msg} = req.body;
        if (util.isUndefined(phone)) return errorResult(req,res,'phone必选');
        if (util.isUndefined(msg)) return errorResult(req,res,'msg必选');

        await send_sms_action(phone,msg);
        return jsonResult(req,res,true);
    }catch (err) {
        return errorResult(req,res,`短信发送失败:${err.message||err}`);
    }
};

const send_sms_action = (mobile,message) => {
    //获取配置数据
    const {api_key,sign} = luosimao;
    // //校验
    if (!api_key)return Promise.reject('appkey为空');
    if (!sign) return Promise.reject('签名为空');
    if (!mobile) return Promise.reject('手机号为空');


    //控制单发群发
    message = `${message}【${sign}】`;
    const {postData,path} = handleOptions(mobile,message);

    if (postData.mobile_list) {
        const length = postData.mobile_list.split(',').length;
        if (length > 500){
            return Promise.reject('单次群发数量不得大于500')
        }
    }

    const content = querystring.stringify(postData);
    const options = {
        host:'sms-api.luosimao.com',
        path,
        method:'POST',
        auth:`api:key-${api_key}`,
        agent:false,
        rejectUnauthorized : false,
        headers:{
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length' :content.length
        }
    };

    return new Promise((resolve,reject)=>{
        const request = https.request(options, (response) => {
            let rs = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                rs += chunk
            });

            response.on('end', function () {
                let {error,msg} = JSON.parse(rs);

                if (error && error < 0) {//发送失败
                    msg = errorDescMap().get(error) || '未知错误';
                    reject(msg)
                } else {//发送成功
                    resolve()
                }
            })
        });
        request.write(content);
        request.end();
    });
};


//错误描述信息表
const errorDescMap = ()=>{
    const options = [
        [-10,'验证信息失败'],
        [-11,'用户接口被禁用'],
        [-20,'短信余额不足'],
        [-30,'短信内容为空'],
        [-31,'短信内容存在敏感词'],
        [-32,'短信内容缺少签名信息'],
        [-33,'短信过长,超过300字'],
        [-34,'签名不可用'],
        [-40,'错误的手机号'],
        [-41,'号码在黑名单中'],
        [-42,'短信发送频率过快'],
        [-43,'号码数量太多'],
        [-50,'请求发送IP不在白名单中']];
    return new Map(options)
};

//单发群发
const handleOptions = (mobile,message)=>{
    if (!(typeof mobile === 'string')) {//手机号强转字符串
        mobile = mobile + ''
    }

    let path = '';
    let mobileList = mobile.replace(/(^,)|(,$)/g, '').split(',').filter(v => v != '')
    //组装发送data
    let postData = {
        message
    };

    if (mobileList.length === 1){//单发
        mobile = mobileList.pop();
        path = '/v1/send.json';
        postData.mobile = mobile;
    }else {//群发
        mobile = mobileList.join(',');
        path = '/v1/send_batch.json';
        postData.mobile_list = mobile
    }

    return {
        postData,
        path
    }
};

UtilSendSmsRouter.send_sms_action = send_sms_action;

module.exports = UtilSendSmsRouter;