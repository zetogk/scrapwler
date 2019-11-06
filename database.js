'use strict';

const Mongoose = require('mongoose');

const { error, log } = console;

class MongoConnector {

    constructor(host, port, dbName, user, password, secure = false) {
        
        this.host = host;
        this.port = port;
        this.dbName = dbName;
        this.user = user;
        this.password = password;
        this.secure = secure;
        this.fullUrlConnection = secure == false ? this.generateInsecureUrl() : this.generateSecureUrl();
        this.models = {};
        this.connect();

    }

    generateInsecureUrl() {

        return `mongodb://${this.host}:${this.port}/${this.dbName}`;

    }

    generateSecureUrl() {

        return `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.dbName}`;

    }

    getModels() {

        this.models.scrapping = {};
        this.models.scrapping.scrappedwebs = require('./models/scrappedwebs');
        this.models.scrapping.seeds = require('./models/seeds');
        this.models.scrapping.structures = require('./models/structures');

    }

    connect() {

        Mongoose.connect(this.fullUrlConnection, { useNewUrlParser: true, useUnifiedTopology: true });
        this.getModels();
        Mongoose.Promise = global.Promise;
        this.db = Mongoose.connection;
        this.db.on('error', console.error.bind(console, 'Connection error [Mongo]'));
        this.db.once('open', function callback() {

            log("Connection success [Mongo].");

        });

    }

}

module.exports = MongoConnector;
