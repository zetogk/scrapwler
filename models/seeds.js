'use strict';

const Mongoose = require('mongoose');

const Seed = Mongoose.model('Seed', {
	url: { type: String, required: true },
	selectorLinks: [
        { type: String }
    ],
	active: { type: Boolean, default: true }
});

module.exports = Seed;
