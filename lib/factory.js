var Job = require('./job')
var events = require('events')
var util = require('util')

var factory = module.exports = function() {
	this.jobs = [];
	this.activeJobs = [];
	this.threads = 1;
	this.state = false;

};
// So will act like an event emitter
util.inherits(factory, events.EventEmitter);

factory.prototype.runQuta = function() {
	if (this.state && this.activeJobs.length < this.threads && this.jobs.length >= 1) {
		var nextJob = this.jobs.shift();
		var nextJobRun = nextJob.run();
		if (nextJobRun) {
			var self = this;

			nextJobRun.on('done', function() {
				self.emit('encode', nextJobRun);
				self.activeJobs.splice(nextJobRun, 1);
				self.runQuta();
			})
			this.activeJobs.push(nextJobRun);
			this.emit('quota', nextJobRun);
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
factory.prototype.createEncode = function(vid) {
	//console.log(vid)
	this.jobs.push(new Job(vid))
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
