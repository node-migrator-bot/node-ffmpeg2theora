var Job = require('./job')
var events = require('events')
var util = require('util')

var factory = module.exports = function() {
	this.jobs = [];
	this.activeJobs = [];
	this.threads = 1;
	this.state = false;

};
//So will act like an event emitter
util.inherits(factory, events.EventEmitter);

factory.prototype.runQuta = function() {
	console.log(this.state && this.activeJobs.length < this.threads && this.jobs.length >= 1)
	if(this.state && this.activeJobs.length < this.threads && this.jobs.length >= 1) {
		var nextJob = this.jobs.shift();
		var nextJobRun = nextJob.run();
		if(nextJobRun) {
			var self = this;

			nextJobRun.on('done', function() {
				self.emit('done', nextJobRun);
				self.activeJobs.splice(nextJobRun, 1);
				self.runQuta();
			})
			this.activeJobs.push(nextJobRun);
		} else {
			this.emit('error', nextJob)
		}
		var self = this;
		process.nextTick(function() {
			self.runQuta()
		})
	}
	return this
};
factory.prototype.createEncode = function(source, dest, quality) {
	this.jobs.push(new Job({
		source : source,
		dest : dest,
		videoQuality : quality.video || 5,
		audioQuality : quality.audio || 5
	}))
	return this
};
factory.prototype.setThreads = function(threadCount) {
	this.threads = threadCount;
};
factory.prototype.open = function() {
	this.state = true;
	return this
};
factory.prototype.close = function() {
	this.state = false;
	return this
};
