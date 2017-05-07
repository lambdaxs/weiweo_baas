const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const KeygenSchema = new Schema({
    date: Number,
    seid: Number
});

Number.prototype.shift = function (bit) {
    return parseInt(this * (2 << bit));
};

function getSec () {
    return Date.parse(new Date()) / 1000 - 1420041600;
}

function getYmd () {
    return (new Date()).toISOString().slice(2, 10).replace(/-/g, '');
}

const get_id = async ()=>{
    let doc = await mongoose.model('Keygen', KeygenSchema).findOneAndUpdate({date: getYmd()},
        {$inc: {seid: 1}},
        {new: true, upsert: true});
    return getSec().shift(23) + exports.extid.shift(15) + parseInt(doc.seid % 65535);
};

module.exports.extid = 17;
module.exports = {
    get_id
};

