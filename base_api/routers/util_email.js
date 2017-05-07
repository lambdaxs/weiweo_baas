/**
 * Created by xiaos on 17/1/18.
 */
const nodemailer = require('nodemailer');
const util = require('util');
const email_config = require('../config/config.json').email;


let UtilSendEmailRouter = {};
//常规的点对点发送 和 点对多群发
UtilSendEmailRouter.send_email_service = (req,res) =>{

    const {to,subject,msg} = req.body;

    if (util.isUndefined(to)) return errorResult(req,res,'to必选');
    if (util.isUndefined(subject)) return errorResult(req,res,'subject必选');
    if (util.isUndefined(msg)) return errorResult(req,res,'msg必选');

    if (typeof to != 'string') return errorResult(req,res,'to类型错误');
    if (typeof subject != 'string') return errorResult(req,res,'subject类型错误');
    if (typeof msg != 'string') return errorResult(req,res,'msg类型错误');

    //过滤删除to中的无效数据
    // e.g. to = '  ,xs@geekniu.com,  18844124100@163.com' => 'xs@geekniu.com,18844124100@163.com'
    const realTo = to.replace(/(^,)|(,$)/g, '').split(',').map(str=>str.trim()).filter(v => v != '').join(',');

    send_email_action(realTo,subject,msg)
        .then(_=>{//邮件发送成功
            return jsonResult(req,res,true)
        },error_msg=>{//发送失败
            return errorResult(req,res,error_msg)
        })
};

//点对点群发,收件人只能看到自己的邮箱地址的群发场景
UtilSendEmailRouter.send_batch_email_service = (req,res) =>{
    const {to,subject,msg} = req.body;

    if (util.isUndefined(to)) return errorRequest(req,res,Code.MISS_PARAMS,'to');
    if (util.isUndefined(subject)) return errorRequest(req,res,Code.MISS_PARAMS,'subject');
    if (util.isUndefined(msg)) return errorRequest(req,res,Code.MISS_PARAMS,'msg');

    if (typeof to != 'string') return errorRequest(req,res,Code.PARAM_ERROR,'to');
    if (typeof subject != 'string') return errorRequest(req,res,Code.PARAM_ERROR,'subject');
    if (typeof msg != 'string') return errorRequest(req,res,Code.PARAM_ERROR,'msg');

    //获取发送方
    const {from = null} = configData();
    if (!from) return errorRequest(req,res,Code.EMAIL_SEND_FAIL,error_msg);

    //过滤删除to中的无效数据
    // e.g. to = '  ,xs@geekniu.com,  18844124100@163.com' => ['xs@geekniu.com','18844124100@163.com']
    const toList = to.replace(/(^,)|(,$)/g, '').split(',').map(str=>str.trim()).filter(v => v != '');

    //开始异步发送任务
    toList.forEach(toItem=>{
        send_email_action(toItem,subject,msg)
            .then(rs=>{
                console.info(`${req.url} 发送方:${from} 发送标题:${subject} 发送内容:${msg} 发送邮件成功,收件人地址:${toItem},smtp结果:${rs}`);
            },error_msg=>{
                console.error(`${req.url} 发送方:${from} 发送标题:${subject} 发送内容:${msg} 发送邮件失败,收件人地址:${toItem},smtp结果:${rs}`);
            })
    });
    //群发邮件任务已启动
    return jsonResponse(res,true,req)
};

const send_email_action = (to,subject,html) => {
    //获取配置信息
    const {from = null, smtp = null, sign = null} = email_config;

    if (!smtp) return Promise.reject('stmp配置为空');
    if (!from) return Promise.reject('发件人邮箱为空');
    if (!sign) return Promise.reject('发件人标注为空');


    //e.g. from= '极牛<service@geekniu.com>'
    const fromReg = /^(.*)<(.*)>$/;
    if (!fromReg.test(from)) return Promise.reject('from格式错误');

    //e.g. fromEmail = 'service@geekniu.com'
    const fromEmail = from.match(fromReg)[2];
    if (!(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(fromEmail))){
        return Promise.reject('发件人邮箱格式错误')
    }

    //发送邮件
    const transporter = nodemailer.createTransport(smtp);
    const mailOptions = {
        from,
        to,
        subject,
        html
    };

    return new Promise((resolve,reject)=>{
        transporter.sendMail(mailOptions, function(error, info){
            console.log(error,info);
            if(error){//发送失败
                let error_msg = '未知错误';
                if (error.responseCode){
                    error_msg = errorMap().get(error.responseCode) || '未知错误'
                }
                reject(error_msg)
            }else {
                //发送成功
                resolve(info.response)
            }
        })
    })
};

//smtp协议错误信息描述表
const errorMap = ()=>{
    const options = [
        [500,'格式错误,命令不可识别'],
        [501,'参数格式错误'],
        [221,'服务关闭传输信道'],
        [421,'服务未就绪，关闭传输信道'],
        [251,'用户非本地，将转发'],
        [450,'要求的邮件操作未完成，邮箱不可用'],
        [550,'邮箱未找到'],
        [451,'放弃要求的操作；处理过程中出错'],
        [551,'用户非本地'],
        [452,'系统存储不足，要求的操作未执行'],
        [552,'过量的存储分配，要求的操作未执行'],
        [553,'邮箱格式错误'],
        [554,'操作失败'],
        [535,'发件人邮箱账号验证失败'],
        [235,'发件人邮箱账号验证成功'],
        [334,'等待发件人输入验证信息']
    ];
    return new Map(options)
};

UtilSendEmailRouter.send_email_action = send_email_action;

module.exports = UtilSendEmailRouter;

