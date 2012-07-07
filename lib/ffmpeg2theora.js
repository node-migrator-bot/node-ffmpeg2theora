var util = require('util');
var path = require('path');
var events = require('events');
var Factory = require('./factory');
var utils = require('./utils');
var Mixin = utils.Mixin;
console.log(Factory)
/*
 * paths and encodeTypes must be an array! @param {Object} paths @param {Object}
 * encodeTypes @param {Object} callBack @api {Private}
 */
var ffmpeg2theora = module.exports = function(encodeTypes, callBack) {

	events.EventEmitter.call(this);
	var self = this;
	this.factory = (new Factory()).on('encode', function(result) {
	self.emit('encode', result);
	}).on('error', function(error) {
		self.emit('error', error);
	});
	this.factory.open()
}
// So will act like an event emitter
util.inherits(ffmpeg2theora, events.EventEmitter);

ffmpeg2theora.prototype.batch = function(videos, defaults) {
	defaults = Mixin({
		contaners : ['mp4'],
		quality : {
			video : 5,
			audio : 5
		},
		pingTime : 5000
	}, defaults);

	var quota = [];
	var factory = this.factory;

	for(var j = videos.length - 1; j >= 0; j--) {

		var vid = Mixin(defaults, videos[j]);
		vid = Mixin(defaults, videos[j]);
		if(!(vid.source && vid.dest)) {
			continue;
		}
		var contaners = vid.contaners
		for(var i = contaners.length - 1; i >= 0; i--) {
			factory.createEncode({
				dest : vid.dest + '.' + contaners[i],
				contaner : contaners[i],
				quality : vid.quality,
				source : vid.source,
				pingTime : vid.pingTime
			});
		}

	}

}
ffmpeg2theora.prototype._batch = function(paths, outPutFolder, type, quality, callBack) {
	var self = this;
	if(!Array.isArray(paths)) {
		callBack(false)
	}
	var factory = this.factory;

	var count = paths.length

	for(var j = paths.length - 1; j >= 0; j--) {(function(p, index) {
			console.log('index is ' + index)
			fs.exists(p, function(exists) {
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
}
ffmpeg2theora.prototype.start = function() {
	this.factory.runQuta()
}
ffmpeg2theora.prototype.killAll = function() {
	
}
ffmpeg2theora.prototype.getActive = function() {
	return this.factory.activeJobs
}
ffmpeg2theora.prototype.setThreads = function(c) {
	return this.factory.setThreads(c)
}