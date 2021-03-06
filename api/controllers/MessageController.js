/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    messageReceived: function(req, res) {
        var sender = req.param('From'),
            twilioReceivingNumber = req.param('To'),
            body = req.param('Body');
        
        // Find User who sent msg 
        User.findOrCreateByPhone({phoneNumber: sender}, function (err, users) {
            console.log(users);
            if (err) {
                console.log("ERROR");
                res.send(err);
                return;
            } else {
                user = users.isArray ? users[0] : users;
            }

            if (twilio.isMainNumber(twilioReceivingNumber)){
                // This creates a message thread
                var regex = /^[0-9]{10}\ /;
                var receiver = regex.exec(body)[0];
                if (receiver) {
                    receiver = /^[0-9]{10}/.exec(body)[0];
                    var message = body.replace(regex, '');
                    User.findOrCreateByPhone({phoneNumber: receiver}, function(err, recipients) {
                        if (err) {
                            twilio.sendError({
                                from: twilio.MAIN_NUMBER,
                                to: sender,
                                msg: "Sorry, something went wrong"
                            });
                            res.send(err);
                            return;
                        } else {
                            recipient = recipients.isArray ? recipients[0] : recipients;
                        }
                        Message.create({
                            from: user,
                            content: message,
                            to: recipient
                        }, function(err,m){
                            if (err) {
                                return;
                            }
                            console.log("About to add to queue");
                            recipient.addToQueue(m);
                            user.addSendCredit();
                            res.send("Probably worked");
                        });
                    });
                } else {
                    return twilio.sendError({
                        from: twilio.MAIN_NUMBER,
                        to: sender,
                        msg: "Doesn't specify a receiving number."
                    });
                }
            } else if(twilio.RECEIVING_NUMBERS.indexOf(twilioReceivingNumber) != -1) {
                user.getThread({throughPhone: twilioReceivingNumber}, function(err, thread) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                        return twilio.sendError({
                            from: twilioReceivingNumber,
                            to: sender,
                            msg: "Sorry, something went wrong"
                        });
                    }
                    User.findOne(thread.from).exec(function(err, receiver) {
                        if (err) {
                            console.log(err);
                            res.send(err);
                            return twilio.sendError({
                                from: twilioReceivingNumber,
                                to: sender,
                                msg: "Sorry, something went wrong"
                            });
                        }
                        twilio.send({
                            from: twilioReceivingNumber,
                            to: receiver.phoneNumber,
                            msg: body
                        });
                        user.closeThread(thread);
                    });
                });
            }
        });
    }
};

