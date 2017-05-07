/**
 * Created by xiaos on 17/3/30.
 */
const db = require('../lib/db');
const mongoose = require('mongoose');
const user_model = require('./user');
const config = require('../baas_config.json');
const keygen = require('../lib/keygen');
const util = require('./util');

const DataSchema = new mongoose.Schema({
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
    uid   : {
        type    : Number,
        validate: {
            validator: function (val) {
                return (typeof val == 'number');
            },
            message  : 'uid must be a number'
        },
        default : null
    },
    data      : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'data must be a key/value object'
        },
        required: [true, 'data content is required']
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

DataSchema.set('toJSON', {
    transform: util.model_util.transform
});

DataSchema.pre('save',async function (next) {

    //生成时间戳
    util.timestamp.pre_save(this);

    //生成id
    if (!this.id) {
        const id = await keygen.get_id();
        this._id = id;
        this.id = id;
    }

    //判断用户是否存在
    const user_exists = await user_model.findOne({id:this.uid});
    if(!user_exists) {
        next(new Error(`uid为${this.uid}的用户不存在`))
    }else {
        next({
            user:user_exists
        });
    }
});

DataSchema.pre('update',async function (next) {
    util.timestamp.pre_update(this);
    next();
});

const data_model = (data_name)=>{
    if (!data_name) throw new Error('data_name必须有值');
    if (typeof data_name !== 'string') throw new Error('data_name必须是字符串');

    db.connections[data_name] = mongoose.createConnection(config.mongo_uri+data_name);
    return db.connections[data_name].model('data',DataSchema);
};

module.exports = data_model;

