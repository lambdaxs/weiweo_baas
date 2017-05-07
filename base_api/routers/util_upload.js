/**
 * Created by xiaos on 17/5/5.
 */

const fs = require('fs');
const path = require('path');
const {access_key,secret_key,bucket,url_pre} = require('../config/config.json').qiniu;
const qiniu = require("qiniu");
const keygen = require('../lib/keygen');

const root_path = path.resolve(__dirname, '../../');

//调用uploadFile上传
const upload_qiniu = async(key,file_path)=>{

    qiniu.conf.ACCESS_KEY = access_key;
    qiniu.conf.SECRET_KEY = secret_key;

    const putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
    const token = putPolicy.token();

    const extra = new qiniu.io.PutExtra();
    return new Promise((s,f)=>{
        qiniu.io.putFile(token, key, file_path, extra, function(err, ret) {
            if(!err) {
                s(`${url_pre}${ret.key}`);
            } else {
                f(err);
            }
        });
    });
};


const file_upload = async(req,res)=>{
    try {
        const {file} = req.files;

        const file_type = path.extname(file.name);
        const key = await keygen.get_id();
        const file_name = `${key}${file_type}`;
        const file_path = `${root_path}/uploads/${file_name}`;

        file.mv(file_path,async(err)=>{
            if (!err) {
                const file_url = await upload_qiniu(file_name,file_path);
                return jsonResult(req,res,{
                    file_url
                });
            }else {
                return errorResult(req,res,'文件上传失败');
            }
        });
    }catch (err){
        return errorResult(req,res,err);
    }
};

module.exports = {
    file_upload
};