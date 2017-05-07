/**
 * Created by xiaos on 17/3/30.
 */

const mongoose = require('mongoose');
const user_model = require('./user');
const keygen = require('../lib/keygen');
const db = require('../lib/db');
const util = require('./util');
const config = require('../baas_config.json');

const OpUserSchema = new mongoose.Schema({
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
    to_uid    : {
        type    : Number,
        required: [true, '缺少必选参数to_uid']
    },
    uid   : {
        type    : Number,
        required: [true, '缺少必选参数uid']
    },
    op_name   : {
        type    : String,
        required: [true, '缺少必选参数op_name'],
        validate: {
            validator: function (val) {
                return (typeof val == 'string')
            },
            message  : 'op_name必须为string'
        }
    },
    op_data   : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'op_data必须为object'
        }
    },
    created_at: Number,
    updated_at: Number
},{
    minimize: false
});

OpUserSchema.set('toJSON', {
    transform: util.model_util.transform
});

OpUserSchema.pre('save',async function (next) {
    //生成时间戳
    util.timestamp.pre_save(this);

    //生成id
    if (!this.id) {
        const id = await keygen.get_id();
        this._id = id;
        this.id = id;
    }

    //查库检查uid to_uid用户是否存在
    let uid_user = await user_model.findOne({id:this.uid});
    if (!uid_user) throw new Error(`uid 为${this.uid} 的用户不存在`);
    let to_uid_user = await user_model.findOne({id:this.to_uid});
    if (!to_uid_user) throw new Error(`uid 为${this.to_uid} 的用户不存在`);

    next({
        user:uid_user,
        to_user:to_uid_user
    });
});

OpUserSchema.pre('update',async function (next) {
    util.timestamp.pre_update(this);
    next();
});

//op存完后写入counter
// OpUserSchema.post('save',async function (doc) {
//
// });

module.exports = db.connections.main.model('op_user',OpUserSchema);