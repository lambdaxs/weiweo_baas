/**
 * Created by xiaos on 17/3/31.
 */

const jsonResult = (req,res,body)=>{
    res.type('json');
    const res_body = JSON.stringify({
        error_code:0,
        result:body || null
    });
    console.log('%j',res_body);
    return res.send(res_body);
};

const selfResult = (req,res,body)=>{
    res.type('json');
    const res_bdoy = JSON.stringify(body);
    console.log(res_bdoy);
    return res.send(res_bdoy);
};

const errorResult = (req,res,error,error_code=-1)=>{
    res.type('json');

    let message = '';

    if (error.message){
        message = error.message;
    }else if(typeof error === 'string'){
        message = error;
    }else {
        message = '未知错误'
    }

    const res_body = JSON.stringify({
        error_code,
        error_msg:message
    });
    console.log('%J',res_body);
    return res.send(res_body);
};

global.jsonResult = jsonResult;
global.selfResult = selfResult;
global.errorResult = errorResult;