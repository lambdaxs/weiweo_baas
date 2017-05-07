/**
 * Created by xiaos on 17/4/5.
 */
const mongoose = require('mongoose');
const keygen = require('../lib/keygen');
const util = require('./util');
const db = require('../lib/db');
const config = require('../baas_config.json');

const user_model = require('./user');
const op_data_model = require('./op_data');

const op_op_schema = new mongoose.Schema({
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
    op_id   : {
        type    : Number,
        required: [true, 'data_id is required']
    },
    op_op_name   : {
        type    : String,
        validate: {
            validator: function (val) {
                return (typeof val == 'string')
            },
            message  : 'op_name must be string'
        },
        required: [true, 'op_name is required']
    },
    op_op_data   : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'op_data must be a key/value object'
        }
    },
    uid   : {
        type    : Number,
        required: [true, 'uid is required']
    },
    counter_data : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'counter_data must be a key/value object'
            // message  : val
        },
        required: false
    },
    created_at: Number,
    updated_at: Number
},{
    minimize: false
});

op_op_schema.set('toJSON', {
    transform: util.model_util.transform
});

op_op_schema.pre('save',async function(next){
    //生成时间戳
    util.timestamp.pre_save(this);

    //生成id
    if (!this.id) {
        const id = await keygen.get_id();
        this._id = id;
        this.id = id;
    }

    //判断user/op_data是否存在
    const user_exists = await user_model.findOne({id:this.uid});
    const data_name = op_op_schema.options.get_data_name();
    const op_name = op_op_schema.options.get_op_name();
    const op_data_exists = await op_data_model(data_name).findOne({id:this.op_id,op_name});

    if(!user_exists) {
        next(new Error(`uid为${this.uid}的用户不存在`));
    }else if (!op_data_exists){
        next(new Error(`op_data为${this.op_id}的数据不存在`));
    } else {
        next({
            user:user_exists,
            op_data:op_data_exists
        });
    }
});

op_op_schema.pre('update',async function(next){
    util.timestamp.pre_update(this);
    next();
});

op_op_schema.methods.exists = async function(op_op_name,op_id,uid){
    return this.findOne({op_op_name,op_id,uid});
};

op_op_schema.methods.op_count = async function(op_op_name,op_id){
    return this.findOne({op_op_name,op_id}).count();
};

op_op_schema.methods.user_count = async function(op_op_name,uid){
    return this.findOne({op_op_name,uid}).count();
};

//计数+
// op_op_schema.post('save',async()=>{
//
// });

//计数-
// op_op_schema.post('remove',async()=>{
//
// });

const op_op_model = (data_name,op_name)=>{
    if (!data_name) throw new Error('data_name必须有值');
    if (typeof data_name !== 'string') throw new Error('data_name必须是字符串');
    if (!op_name) throw new Error('op_name必须有值');
    if (typeof op_name !== 'string') throw new Error('op_name必须是字符串');

    db.connections[data_name] = mongoose.createConnection(config.mongo_uri+data_name);

    op_op_schema.set('get_data_name', function () {
        return data_name;
    });
    op_op_schema.set('get_op_name', function () {
        return op_name;
    });

    return db.connections[data_name].model('op_op',op_op_schema);
};

module.exports = op_op_model;