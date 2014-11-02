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
	    message.to = this.id;
	    var user = this;
	    message.save(function(err, m){
		if (err) {
            console.log("ERROR");
            console.log(err);
            return;
		}
        var size = user.unsentQueue.length;
        console.log("SIZE?");
        //console.log(size);
		user.unsentQueue.add(m);
        console.log(size);
        function ping() {
            setTimeout(function(){
                if (user.unsentQueue.length > size) {
                    user.save(function(err, x) {
                        console.log(err);
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log("SAVED");
                        user.checkRelease();
                        return;
                    });
                } else {
                    console.log(user.unsentQueue.length);
                    ping();
                }
            },1000);
        }
        ping();

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
		console.log("Not null.");
                return;
            }
            // no open threads
            if (user.credits >= 2 && user.unsentQueue.length > 0) {
		console.log("Moving shit.");
                user.credits -= 2;
                var message = user.unsentQueue.shift();
                thread.from = message.from;
                thread.content = message.content;
                thread.save(function(err,t){});
                user.save(function(err,u){});
                message.destroy();
            }
	    });
	},

	getThread: function (opts, cb) {
	    var found = false;
	    this.threads.forEach(function(thread) {
		if (thread.messagingAgent == opts.throughPhone) {
		    cb(null, thread);
		    found = true;
		}
	    });
	    if (!found)
		cb(new Error("not valid thread"));
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

	closeThread: function(thread) {
	    thread.from = null;
	    var user = this;
	    thread.save(function(err, t) {
		user.checkRelease();
	    });
	}
    },

    findOrCreateByPhone: function(opts, cb) {
        User.findOne({phoneNumber: opts.phoneNumber}).populate('threads').populate('unsentQueue').exec(function(err, user) {
            if (err) {
                console.log("ERROR FINDING USER");
                return cb(err);
            }
            if (!user)
                User.create({phoneNumber: opts.phoneNumber}, function(err, user) {
                    if (err) {
                        console.log("ERROR CREATING USER");
                        return cb(err);
                    }
                    var i = 0;
                    twilio.RECEIVING_NUMBERS.forEach(function(number) {
                        Message.create({to: user.id, messagingAgent: number}, function(err, message) {
                            if (err) {
                                return cb(err);
                            }
                            user.threads.add(message);
                            i++;
                        });
                    });
                    function ping() {
                        console.log("PING");
                        setTimeout(function(){
                            if (user.threads.size < 3) {
                                console.log(user.threads.size);
                                ping();
                            } else {
                                console.log("SAVE");
                                user.save(function(err, u) {
                                    cb(null, u);
                                });
                            }
                            /**
                            user.threads.count().where({
                            }).exec(function(err,num){
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                if (num == 3) {
                                    user.save(function(err,u){
                                        cb(null, u);
                                    });
                                } else {
                                    console.log(num);
                                }
                            });**/
                        },1000);
                    }
                    ping();
                });
            else
                return cb(null, user);
        });
    }
};
