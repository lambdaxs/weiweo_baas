const mongoose         = require('mongoose');
const db               = require('./lib/db');
const keygen = require('./lib/keygen');

const EventDataSchema = new mongoose.Schema({
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
    event : {
        type    : String
    },
    unique_uid : {
        type    : String,
    },
    uid : {
        type    : String,
    },
    event_attr : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'data must be a key/value object'
        },
    },
    date : {
        type    : mongoose.Schema.Types.Mixed,
        default : {},
        validate: {
            validator: function (val) {
                return (typeof val == 'object');
            },
            message  : 'date must be a key/value object'
        },
    },
    timestamp: Number
},{
    minimize: false
});

EventDataSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

EventDataSchema.pre('save',async function (next) {


    // const currentDate = new Date().getTime();
    // this.updated_at = currentDate;
    // if (!this.timestamp) this.timestamp = currentDate;

    //生成id uid
    if (!this.id||this._id) {
        const id = await keygen.get_id();
        this._id = id;
        this.id = id;

        const uid = await keygen.get_id();
        this.uid = uid+'';
        this.unique_id = uid+'';
    }

    next();
});

module.exports = function (event_data_name) {
    if (!event_data_name) throw new Error('data_name必须有值');
    if (typeof event_data_name !== 'string') throw new Error('data_name必须是字符串');
    db.connections[event_data_name] = mongoose.createConnection(db.mongo_uri+event_data_name);
    return db.connections[event_data_name].model('event_data',EventDataSchema);
};

