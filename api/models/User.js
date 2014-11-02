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
	},

	unsentQueue: {
	    collection: 'Message',
	},

	credits: {
        type: 'integer',
        defaultsTo: 0
    },

	addToQueue: function(message) {
	    message.content = "change";
	    message.to = this.id;
	    var user = this;
	    message.save(function(err, m){
            if (err) {
                console.log(err);
                return;
            }
            user.unsentQueue.add(m);
            user.save(function(err, x) {});
            user.checkRelease();
	    });
	},

	checkRelease: function() {
		if (this.credits < 2 ||
		    // empty queue
		    this.unsentQueue.length == 0)
		    return;
        var user = this;
        this.threads.forEach(function(thread) {
            if (thread.from != null) {
                return;
            }
            // no open threads
            if (user.credits >= 2 && user.unsentQueue.length > 0) {
                user.credits -= 2;
                var message = user.unsentQueue.shift();
                thread.from = message.from;
                thread.content = message.content;
                console.log(thread);
                thread.save(function(err,t){console.log(t);});
                message.destroy();
            }
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
        this.save(function(err,u){
            if (err) {
                console.log(err);
                return;
            }
            u.checkRelease();
        });
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
		    twilio.RECEIVING_NUMBERS.forEach(function(number) {
			Message.create({to: user.id, messagingAgent: number}, function(err, message) {
			    if (err)
				cb(err);
			    user.threads.add(message);
			    user.save(cb);
			});
		    });
		});
	    else
		cb(null, user);
	});
    }
};
