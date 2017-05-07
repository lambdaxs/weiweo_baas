/**
 * Created by xiaos on 17/3/30.
 */
const {mongo_uri,main_database} = require('../baas_config.json');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const connections  = [];
const dbUri = `${mongo_uri}${main_database}`;

connections.main = mongoose.createConnection(dbUri);
mongoose.connection = connections.main;

mongoose.connection.on('connected', function () {
    console.info('Mongoose connection open to ' + dbUri);
}).on('error', function (err) {
    console.info('Mongoose connection error: ' + err);
}).on('disconnected', function () {
    console.info('Mongoose connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.info('Mongoose connection disconnected through app termination');
        process.exit(0);
    });
});

module.exports.connections = connections;
module.exports.mongo_uri = mongo_uri;
