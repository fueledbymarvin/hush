/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    attributes: {
	phone: {
	    type: 'string',
	    unique: true
	},
	credits: {
	    type: 'integer'
	},
	addToQueue: function(message) {
	    this.queue.add(message);
	    this.checkRelease();
	},
	checkRelease: function() {
	    this.threads.find({fromPhone: ""}, function(err, threads) {
		// no open threads
		if (threads.length == 0 ||
		    // not enough credits
		    this.credits < 2 ||
		    // empty queue
		    this.queue.length == 0)
		    return;
		this.queue.find({sort: 'createdAt DESC'}, function(err, sorted) {
		    for (var i = 0;
			 i < threads.length && this.credits >= 2 && this.queue.length > 0;
			 i++) {
			credits -= 2;
			var message = sorted.pop();
			threads[i].fromPhone = message.fromPhone;
			threads[i].content = message.content;
			message.destroy();
			this.save(function(){});
		    }
		});
	    });
	},
	getThreadPhone: function (opts, cb) {
	    this.threads.findOne({throughPhone: opts.throughPhone}, function(err, message) {
		if (err)
		    cb(err);
		cb(null, message.fromPhone);
	    });
	},
	addSendCredit: function() {
	    this.credits++;
	    checkRelease();
	},
	closeThread: function(fromPhone) {
	    this.threads.findOne({fromPhone: opts.fromPhone}, function(err, thread) {
		thread.fromPhone = "";
		thread.save(function(){});
	    });
	}
    }
};

