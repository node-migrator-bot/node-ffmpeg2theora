var util = require('util');
var path = require('path');
var events = require('events');
var Factory = require('./factory');
console.log(Factory)
/*
 * paths and encodeTypes must be an array! @param {Object} paths @param {Object}
 * encodeTypes @param {Object} callBack @api {Private}
 */
var ffmpeg2theora = module.exports = function(encodeTypes, callBack) {

	events.EventEmitter.call(this);
	var self = this;
	this.factory = (new Factory()).on('done', function(result) {
	self.emit('done', result);
	}).on('error', function(error) {
		self.emit('error', error);
	});
}
// So will act like an event emitter
util.inherits(ffmpeg2theora, events.EventEmitter);

ffmpeg2theora.prototype.batch = function(paths, outPutFolder, type, quality, callBack) {
	var self = this;
	if(!Array.isArray(paths)) {
		callBack(false)
	}
	var factory = this.factory;

	var count = paths.length

	for(var j = paths.length - 1; j >= 0; j--) {
		;(function(p, index) {
			console.log('index is ' + index)
			path.exists(p, function(exists) {
				if(!exists) {
					throw ('Path does not exists Path: ' + p)
				}
				if(Array.isArray(type)) {
					for(var i = type.length - 1; i >= 0; i--) {
						factory.createEncode(p, outPutFolder + '/' + path.basename(p, path.extname(p)) + '.' + type[i], quality);
					}
				} else {
					factory.createEncode(p, outPutFolder + '/' + path.basename(p, path.extname(p)) + '.' + type, quality);
				}
				if(--count === 0) {
					factory.runQuta()
				}
			});
		})(paths[j], j)
	}
	factory.open()
}
ffmpeg2theora.prototype.start = function() {
	this.factory.runQuta()
}
ffmpeg2theora.prototype.killAll = function() {
	var active = this.factory.activeJobs;
	console.log('killAll')
	for(var i = active.length - 1; i >= 0; i--) {
		active[i].kill()
	};
}
ffmpeg2theora.prototype.getActive = function() {
	return this.factory.activeJobs
}
ffmpeg2theora.prototype.setThreads = function(c) {
	return this.factory.setThreads(c)
}