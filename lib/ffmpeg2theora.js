var sys = require('sys');
var path = require('path');
var child_process = require('child_process');
var events = require('events');
var util = require('util');


var exec = child_process.exec;
var spawn = child_process.spawn;
var emitter = new events.EventEmitter;
var isArray = Array.isArray;

var tmpFolder = '/tmp';

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
}
/*
 * paths and encodeTypes must be an array! @param {Object} paths @param {Object}
 * encodeTypes @param {Object} callBack @api {Private}
 */
var ffmpeg2theora = function(encodeTypes, callBack) {


	events.EventEmitter.call(this);
	/*
	 * @param {Number} this.state = 0; Stoped not active. @param {Number}
	 * this.state = 1; Starting. @param {Number} this.state = 2; Active quota.
	 * @param {Number} this.state = 3; Encoding. @param {Number} this.state = 4;
	 * Finishing. @param {Number} this.state = 5; Done. @api {Private}
	 */
	this.state = 0;

	/*
	 * this.quota = []; Array of the current todo list. if quota.length === 0 it
	 * is done. @api (Private)
	 */
	this.quota = [];

	/*
	 * this.encodeTypes = encodeTypes; encodeTypes must be an array of file
	 * ext's @api {Private}
	 */
	this.encodeTypes = encodeTypes

	/*
	 * Will get set on this.start(callBack) @api (Public)
	 */
	this.callBack = callBack;

	/*
	 * If no active encodes this.active.all will be null
	 * 
	 * @param {String} active.time; Time that has elapsed. @param {String}
	 * active.audio; Audio bit rate. @param {String} active.video; Video bit
	 * rate. @param {String} active.remaining; Time till end. @param {String}
	 * active.input; File name of source file name. @param {String}
	 * active.output; File name of encoded file name.
	 * 
	 * @api {Private}
	 */
	this.active = {
		time : null,
		audio : null,
		video : null,
		remaining : null,
		input : null,
		output : null
	};

}

//So will act like an event emitter
util.inherits(ffmpeg2theora, events.EventEmitter);

ffmpeg2theora.prototype.next = function() {
	
	console.log('Next!')
	var first = this.quota.shift();
	
	if (!first) {
		this.state = 5;
		return this.callBack()
	}
	
	this.state = 2;
	var self = this;
	
	this.spawn({
		input : first.input,
		output : first.output,
		a : 3,
		v : 3
	}, function(err) {
		if (err) {

		} else {
			self.next()
		}
	})
}
ffmpeg2theora.prototype.start = function(callBack) {
	this.callBack = callBack || this.callBack;
	var first = this.quota.shift();

	console.log('Starting!')
	var self = this;

	this.state = 2;

	this.spawn({
		input : first.input,
		output : first.output,
		a : 1,
		v : 1
	}, function(err) {
		if (err) {

		} else {
			self.next()
		}
	})
}
ffmpeg2theora.prototype.add = function(paths, callBack) {
	var self = this;
	if (!isArray(paths)) {
		callBack(false)
	}

	var pathsLength = paths.length;

	paths.forEach(function(Path) {
		path.exists(Path, function(exists) {
			if (!exists) {
				throw ('Path does not exists Path: ' + Path)
			}
			for ( var i = self.encodeTypes.length - 1; i >= 0; i--) {
				self.quota.push({
					input : Path,
					output : path.dirname(Path) + '/' + path.basename(Path, path.extname(Path)) + '.' + self.encodeTypes[i],
					ext : path.extname(Path)
				});
			}
			if (--pathsLength == 0) {
				callBack(self)
			}
		});
	})
}
ffmpeg2theora.prototype.spawn = function(options, callBack) {

	var encode = spawn('ffmpeg2theora', [ options.input, '-o', options.output, '--videoquality', options.v || 5, '--audioquality', options.a || 5 ]);

	var Data = '';

	this.active = {
		time : '',
		audio : '',
		video : '',
		remaining : '',
		input : options.input,
		output : options.output
	};

	var setInter = 0;
	var hasPolled = true;

	var pollData = function() {
		hasPolled = false;
		setInter = setInterval(function() {
			self.active.time = Data.split('audio')[0].trim();
			self.active.audio = Data.split('audio:')[1].split('video')[0].trim();
			self.active.video = Data.split('video:')[1].split(', time')[0].trim();
			self.active.remaining = Data.split('time remaining:')[1].trim();
			console.log(self.active)
		}, 10000)
	}
	var self = this;

	this.state = 3;

	var count = 20;

	encode.stderr.on('data', function(data) {
		Data = data.toString();
		if (hasPolled && (--count == 0)) {
			pollData()
		}
	});
	encode.on('exit', function(code) {
		self.state = 4;
		clearInterval(setInter)
		self.active = {
			time : null,
			audio : null,
			video : null,
			remaining : null,
			input : null,
			output : null
		};
		if (code === 0) {
			callBack(null, true)
		} else {

			callBack(true)
		}
	});
};

return ffmpeg2theora;
