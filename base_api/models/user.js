'use strict';
const mongoose = require('mongoose');
const db = require('../lib/db');
const bcrypt = require('bcryptjs');
const keygen = require('../lib/keygen');
const util = require('./util');

const UserSchema = new mongoose.Schema({
    _id       : {
        type    : Number,
        index   : {
            unique: true
        }
    },
    id          : {
        type    : Number,
        index   : {
            unique: true
        }
    },
    user_data : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'user_data must be a key/value object'
        },
        required: false
    },
    private_data : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'private_data must be a key/value object'
        },
        required: false
    },
    counter_data : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'counter_data must be a key/value object'
        },
        required: false
    },
    created_at: Number,
    updated_at: Number
},{
    minimize: false
});


UserSchema.set('toJSON', {
    transform: util.model_util.transform
});

const create_password = (origin_password)=>{
    return new Promise((s,f)=>{
        bcrypt.genSalt(9, function (err, salt) {
            if (err) return f(err);
            bcrypt.hash(origin_password, salt, function (err, hash) {
                if (err) return f(err);
                 s(hash);
            });
        });
    });
};

UserSchema.pre('save',async function (next) {

    //生成时间戳
    util.timestamp.pre_save(this);

    //生成id
    if (!this.id) {
        const id = await keygen.get_id();
        this._id = id;
        this.id = id;
    }

    //手机号强制转换为字符串
    if (this.private_data.phone) {
        this.private_data.phone = this.private_data.phone+'';
    }

    //更新用户数据时跳过密码生成
    if (!this.private_data.password) return next();
    //未更新密码字段是跳过密码生成
    if (!this.isModified('private_data.password')) return next();

    //生成密码
    this.private_data.password = await create_password(this.private_data.password);
    next()
});

UserSchema.pre('update',async function (next) {
   util.timestamp.pre_update(this);
   next();
});

//比较密码
UserSchema.methods.comparePassword = function (candidatePassword) {
    if (!this.private_data.password) return false;
    return bcrypt.compareSync(candidatePassword, this.private_data.password);
};


module.exports = db.connections.main.model('user', UserSchema);

