/**
 * Created by xiaos on 17/4/5.
 */
const mongoose = require('mongoose');
const keygen = require('../lib/keygen');
const util = require('./util');
const db = require('../lib/db');
const config = require('../baas_config.json');

const user_model = require('./user');
const data_model = require('./data');

const op_data_schema = new mongoose.Schema({
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
    data_id   : {
        type    : Number,
        required: [true, 'data_id is required']
    },
    op_name   : {
        type    : String,
        validate: {
            validator: function (val) {
                return (typeof val == 'string')
            },
            message  : 'op_name must be string'
        },
        required: [true, 'op_name is required']
    },
    op_data   : {
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

op_data_schema.set('toJSON', {
    transform: util.model_util.transform
});

op_data_schema.pre('save',async function(next){
    //生成时间戳
    util.timestamp.pre_save(this);

    //生成id
    if (!this.id) {
        const id = await keygen.get_id();
        this._id = id;
        this.id = id;
    }

    //判断user/data是否存在
    const user_exists = await user_model.findOne({id:this.uid});
    const data_name = op_data_schema.options.get_data_name();
    const data_exists = await data_model(data_name).findOne({id:this.data_id});

    if(!user_exists) {
        next(new Error(`uid为${this.uid}的用户不存在`));
    }else if (!data_exists){
        next(new Error(`data为${data_name}的data_id为${this.data_id}的数据不存在`));
    } else {
        next({
            user:user_exists,
            data:data_exists
        });
    }
});

op_data_schema.pre('update',function (next) {
   util.timestamp.pre_update(this);
   next();
});

op_data_schema.methods.exists = async function(op_name,data_id,uid){
    return this.findOne({op_name,data_id,uid});
};

op_data_schema.methods.data_count = async function(op_name,data_id){
    return this.findOne({op_name,data_id}).count();
};

op_data_schema.methods.user_count = async function(op_name,uid){
    return this.findOne({op_name,uid}).count();
};

//计数+
// op_data_schema.post('save',async()=>{
//
// });

//计数-
// op_data_schema.post('remove',async()=>{
//
// });

const op_data_model = (data_name)=>{
    if (!data_name) throw new Error('data_name必须有值');
    if (typeof data_name !== 'string') throw new Error('data_name必须是字符串');

    db.connections[data_name] = mongoose.createConnection(config.mongo_uri+data_name);
    op_data_schema.set('get_data_name', function () {
        return data_name;
    });
    return db.connections[data_name].model('op_data',op_data_schema);
};

module.exports = op_data_model;