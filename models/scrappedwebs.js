'use strict';

const Mongoose = require('mongoose');

const ScrappedWeb = Mongoose.model('ScrappedWeb', {
	date: { type: Date, default: Date.now },
	url: { type: String },
	hash: { type: String },
	structure: { type: String },
	data: [
		{
			name : { type: String },
			content: {}
		}
	]
});

module.exports = ScrappedWeb;