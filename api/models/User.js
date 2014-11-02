/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    connection: 'hush',
    adapter: 'someMongodbServer',
    schema: false,

    attributes: {
	phoneNumber: {
	    type: 'string',
	    required: true,
	    unique: true,
	    primaryKey: true
	},

	threads: {
	    collection: 'Message',
	    via: 'to'
	},

	unsentQueue: {
	    collection: 'Message',
	    via: 'to'
	},

	credits: 'integer',

	addToQueue: function(message) {
	    this.queue.add(message);
	    this.checkRelease();
	},

	checkRelease: function() {
	    this.threads.find({from: null}, function(err, threads) {
		// no open threads
		if (threads.length == 0 ||
		    // not enough credits
		    this.credits < 2 ||
		    // empty queue
		    this.unsentQueue.length == 0)
		    return;
		this.unsentQueue.find({sort: 'createdAt DESC'}, function(err, sorted) {
		    for (var i = 0;
			 i < threads.length && this.credits >= 2 && this.queue.length > 0;
			 i++) {
			credits -= 2;
			var message = sorted.pop();
			threads[i].from = message.from;
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

	closeThread: function(from) {
	    this.threads.findOne({from: from.id}, function(err, thread) {
		thread.from = null;
		thread.save(function(){});
	    });
	}
    },
    findOrCreateByPhone: function(opts, cb) {
	User.findOne({phoneNumber: opts.phoneNumber}, function(err, user) {
	    if (err)
		cb(err);
	    if (!user)
		User.create({phoneNumber: opts.phoneNumber}, function(err, user) {
		    if (err)
			cb(err);
		    //twilio.RECEIVING_NUMBERS.forEach(function(number) {
		    ["123", "245"].forEach(function(number) {
			Message.create({to: user.phoneNumber, messagingAgent: number}, function(err, message) {
			    if (err)
				cb(err);
			    user.unsentQueue.add(message);
			    user.save(function(err, u){console.log(err);});
			});
		    });
		});
	    else
		cb(null, user);
	});
    }
};
