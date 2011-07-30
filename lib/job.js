var events = require('events');
var util = require('util');

var spawn = require('child_process').spawn;

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};
var Job = module.exports = function(options) {

	this.source = options.source;
	this.dest = options.dest;
	this.contaner = options.contaner;
	this.videoQuality = options.quality.video;
	this.audioQuality = options.quality.audio;
	this.pingTime = options.pingTime;
	this.activity = {};
	this.info;
	this.error;
	this.spawn;
	this.rawPipe = '';
	this.state = 0;
	// 0 == not runnung, 1 == ready, 2 == running, 3 == done.

	events.EventEmitter.call(this);
	return this.run();
};
// So will act like an event emitter
util.inherits(Job, events.EventEmitter);

Job.prototype.kill = function() {
	this.spawn.stdin.destroy()
}
Job.prototype.run = function() {
	if(this.state == 2 || this.state == 3) {
		return
	}
	var options = [];

	options.push(this.source)
	options.push('-o')
	options.push(this.dest)
	options.push('--videoquality')
	options.push(this.videoQuality)
	options.push('--audioquality')
	options.push(this.audioQuality)
console.log(options)
	this.state = 2;

	var encode = this.spawn = spawn('ffmpeg2theora', options);

	var rawPipe = this.rawPipe;
	var isFirst = true;
	var a = 0;
	var self = this;
	
	encode.stderr.setEncoding('utf8');
	
	encode.stderr.on('data', function(data) {
		// console.log(data)
		if(isFirst) {
			
			// console.log(data)
			if(self.loadInfo(data)){
				isFirst = false
			}
			
		} else {
			self.rawPipe = data;
		}
	});
	encode.on('exit', function(code) {
		self.state = 4;
		if(code === 0) {
			self.emit('done')
		} else {
			//self.emit('error')
			self.error = {
				code : code,
				message : 'Code error.'
			}
		}
	});
	var self = this;
	setTimeout(function() {
		self.ping()
	}, 5000)
	return this;
}
Job.prototype.loadInfo = function(str) {
	var a = {}
	var aspect = /DAR ([0-9\:]+)/.exec(str);
	if(aspect === null){
		return false
	}
	var video_bitrate = /bitrate: ([0-9]+) kb\/s/.exec(str);
	var fps = /([0-9\.]+) (fps|tb\(r\))/.exec(str);
	var container = /Input #0, ([a-zA-Z0-9]+),/.exec(str);
	var video_stream = /Stream #([0-9\.]+)([a-z0-9\(\)\[\]]*)[:] Video/.exec(str);
	var video_codec = /Video: ([\w]+)/.exec(str);
	var duration = /Duration: (([0-9]+):([0-9]{2}):([0-9]{2}).([0-9]+))/.exec(str);
	var resolution = /(([0-9]{2,5})x([0-9]{2,5}))/.exec(str)
	var audio_bitrate = /Audio: [\w, ]+, ([0-9]+) kb\/s/.exec(str);
	var sample_rate = /([0-9]+) Hz/i.exec(str);
	var audio_codec = /Audio: ([\w]+)/.exec(str);
	var channels = /Audio: [\w]+, [0-9]+ Hz, ([a-z0-9:]+)[a-z0-9\/,]*/.exec(str);
	var audio_stream = /Stream #([0-9\.]+)([a-z0-9\(\)\[\]]*)[:] Audio/.exec(str);
	var is_synched = (/start: 0.000000/.exec(str) != null);
	
	
	// console.log(a)
	
	this.info = {
		video_bitrate:/bitrate: ([0-9]+) kb\/s/.exec(str),
		container:/Input #0, ([a-zA-Z0-9]+),/.exec(str)[1],
		video_codec:/Video: ([\w]+)/.exec(str)[1],
		duration:/Duration: (([0-9]+):([0-9]{2}):([0-9]{2}).([0-9]+))/.exec(str)[1],
		resolution:/(([0-9]{2,5})x([0-9]{2,5}))/.exec(str)[1],
		audio_bitrate:/Audio: [\w, ]+, ([0-9]+) kb\/s/.exec(str),
		sample_rate: /([0-9]+) Hz/i.exec(str)[1],
		audio_codec:/Audio: ([\w]+)/.exec(str)[1],
		channels:/Audio: [\w]+, [0-9]+ Hz, ([a-z0-9:]+)[a-z0-9\/,]*/.exec(str)[1],
		audio_stream:/Stream #([0-9\.]+)([a-z0-9\(\)\[\]]*)[:] Audio/.exec(str)[1],
		is_synched:(/start: 0.000000/.exec(str) != null)
	}
	return true;
}
Job.prototype.ping = function() {
	console.log('JOB PING')
	if(this.state === 2) {
		var rawPipe = this.rawPipe

		var remaining = /time remaining: (([0-9]{2}):([0-9]{2}):([0-9]{2}))/.exec(rawPipe)
		if(remaining) {
			remaining = remaining[1]
		}
		var time = /(([0-9]+):([0-9]{2}):([0-9]{2}).([0-9]+))/.exec(rawPipe);

		if(time) {
			time = time[1]
		}
		var audio = /audio: ([0-9]+)kbps/.exec(rawPipe);

		if(audio) {
			audio = audio[1]
		}
		var video = /video: ([0-9]+)kbps/.exec(rawPipe);

		if(video) {
			video = video[1]
		}
		this.activity = {
			time : time,
			audio : audio,
			video : video,
			remaining : remaining
		}

		var self = this;
		setTimeout(function() {
			self.ping()
		}, this.pingTime)
	}

}