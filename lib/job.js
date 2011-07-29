var events = require('events');
var util = require('util');

var spawn = require('child_process').spawn;

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};
var Job = module.exports = function(options) {

	this.source = options.source;
	this.dest = options.dest;
	this.contaner = options.contaner || 'mp4';
	this.videoQuality = options.videoQuality;
	this.audioQuality = options.audioQuality;
	this.activity = {};
	this.info;
	this.error;
	this.spawn;
	this.rawPipe = '';
	this.state = 0;
	// 0 == not runnung, 1 == ready, 2 == running, 3 == done.

	events.EventEmitter.call(this);

	return this;
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

	this.state = 2;

	var encode = this.spawn = spawn('ffmpeg2theora', options);

	var rawPipe = this.rawPipe;
	var isFirst = true
var a = 0
	encode.stderr.setEncoding('utf8');
	encode.stderr.on('data', function(data) {
		//console.log(data)
		if(isFirst) {
			
			//console.log(data)
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
			self.emit('error')
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
Job.prototype.loadInfo = function(stderr) {
	var a = {}
	var aspect = /DAR ([0-9\:]+)/.exec(stderr);
	if(aspect === null){
		return false
	}
	var video_bitrate = /bitrate: ([0-9]+) kb\/s/.exec(stderr);
	var fps = /([0-9\.]+) (fps|tb\(r\))/.exec(stderr);
	var container = /Input #0, ([a-zA-Z0-9]+),/.exec(stderr);
	var video_stream = /Stream #([0-9\.]+)([a-z0-9\(\)\[\]]*)[:] Video/.exec(stderr);
	var video_codec = /Video: ([\w]+)/.exec(stderr);
	var duration = /Duration: (([0-9]+):([0-9]{2}):([0-9]{2}).([0-9]+))/.exec(stderr);
	var resolution = /(([0-9]{2,5})x([0-9]{2,5}))/.exec(stderr)
	var audio_bitrate = /Audio: [\w, ]+, ([0-9]+) kb\/s/.exec(stderr);
	var sample_rate = /([0-9]+) Hz/i.exec(stderr);
	var audio_codec = /Audio: ([\w]+)/.exec(stderr);
	var channels = /Audio: [\w]+, [0-9]+ Hz, ([a-z0-9:]+)[a-z0-9\/,]*/.exec(stderr);
	var audio_stream = /Stream #([0-9\.]+)([a-z0-9\(\)\[\]]*)[:] Audio/.exec(stderr);
	var is_synched = (/start: 0.000000/.exec(stderr) != null);
	
	
	//console.log(a)
	this.info = {
		video_bitrate:video_bitrate[1],
		container:container[1],
		video_codec:video_codec[1],
		duration:duration[1],
		resolution:resolution[1],
		audio_bitrate:audio_bitrate[1],
		sample_rate:sample_rate[1],
		audio_codec:audio_codec[1],
		channels:channels[1],
		audio_stream:audio_stream[1],
		is_synched:is_synched
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
		}, 5000)
	}

}