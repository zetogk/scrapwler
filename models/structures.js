'use strict';

const Mongoose = require('mongoose');

const Structure = Mongoose.model('Structure', {
    date: { type: Date, default: Date.now },
    name: { type: String, required: true },
    web: { type: String, required: true },
	paths: [
        { type: String }
    ],
	active: { type: Boolean, default: true },
	selectors: [
        {
            name: { type: String, required: true },
            selector: { type: String, required: true },
            multiple: { type: Boolean, required: false, default:false }
        }
    ]
});

module.exports = Structure;
