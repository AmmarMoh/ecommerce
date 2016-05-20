/**
 * MessagesController
 *
 * @description :: Server-side logic for managing Messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var async = require("async");

module.exports = {
	
	inbox: function(req, res){
		if(req.method != 'GET'){
			return res.forbidden(Response.failure("Method Not Allowed", 405));
		}

		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401));
			var uid = data.id;
			var data_return;
			var skip = 0;
			if(req.query.skip){
				skip = req.query.skip;
			}
			Inbox.findOrCreate({user_id:uid}, {user_id:uid}, function(err, created){
				if(!err && created){
					Thread.find({box:uid, trash:0}).skip(skip).limit(20).exec(function(err, finded){
						if(!err && finded){
							return res.ok(Response.success(finded))	
						} else{
							return res.serverError(Response.failure(err, 500));		
						}
						
					})
				} else{
					return res.serverError(Response.failure(err, 500));
				}
			})
		})

	},

	thread: function(req, res){
		if(req.method != 'GET'){
			return res.forbidden(Response.failure("Method Not Allowed", 405));
		}

		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401)); 
			var uid = data.id;
			var skip = 0;
			if(req.query.skip){
				skip = req.query.skip;
			}
			if(!req.query.identifier) return res.badRequest(Response.failure("Bad Request", 400));
			Message.find({thread_identifier:req.query.identifier}).skip(skip).limit(20).exec(function(err, created){
				if(!err && created){
					Thread.update({identifier:req.query.identifier, box:uid}, {read:1}).exec(function afterwards(err, updated){
						if(err) return res.serverError(Response.failure(err, 500));
						return res.ok(Response.success(created));
					})	
				} else{
					return res.serverError(Response.failure(err, 500));
				}
			})
		})

	},

	trash: function(req,res){
		if(req.method != 'GET'){
			return res.forbidden(Response.failure("Method Not Allowed", 405));
		}

		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401)); 
			var uid = data.id;
			var skip = 0;
			if(req.query.skip){
				skip = req.query.skip;
			}

			Inbox.findOrCreate({user_id:uid}, {user_id:uid}, function(err, created){
				if(!err && created){
					Thread.find({box:uid, trash:1}).skip(skip).limit(20).exec(function(err, finded){
						if(!err && finded){
							return res.ok(Response.success(finded))	
						} else{
							return res.serverError(Response.failure(err, 500));		
						}
						
					})
				} else{
					return res.serverError(Response.failure(err, 500));
				}
			})
		})
	},

	send: function(req, res){
		if(req.method != 'POST'){
			return res.forbidden(Response.failure("Method Not Allowed", "405"));
		}
		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401)); 
			var thread_createdAt, thread_title;
			var uid = data.id;
			var body = req.body;
			body.sender = {
				username: data.name.display,
				id : uid
			};
			var users = body.receivers;
			if(!body.identifier){
				body.identifier = Math.random().toString(36).substr(2,15);
			}
			

			async.each(users, function(user, callback){
				Inbox.findOrCreate({user_id:user.id}, {user_id:user.id}, function(err, created){
					if(!err && created){
						Thread.findOrCreate({identifier:body.identifier}, {identifier:body.identifier, title:body.title, box:created.user_id, receivers:body.receivers, listing:body.listing},  function(err, created){
							if(err){
								return res.serverError(Response.failure(err, 500));
							}
							if(user.id == uid){
								Thread.update({identifier:body.identifier, box:uid}, {read:1}, function(err, updated){
									if(err) return res.serverError(Response.failure(err, 500));
								})							
							}
							thread_createdAt = created.createdAt;
							thread_title = created.title;
							callback(null);
						})
					}
				})
			}, function(err){
				if(err){
					return res.serverError(Response.failure(err, 500));
				}
				Message.create({thread_identifier:body.identifier, body:body.body, sender:body.sender, thread_createdAt:thread_createdAt, title:thread_title}).exec(function createCB(err, created){
					if(err){
						return res.serverError(Response.failure(err, 500));
					} else{
						return res.ok(Response.success(created));
					}
				})
			})
			
		})

	},

	delete : function(req, res){
		if(req.method != 'POST'){
			return res.forbidden(Response.failure("Method Not Allowed", 405));
		}
		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401)); 
			var data_return;
			var body = req.body;
			var uid = data.id;
			if(!body.identifier || body.identifier.length<1) return res.badRequest(Response.failure("Bad Request", 400));
			async.each(body.identifier, function(id, callback){
				Thread.update({identifier:id, box:uid}, {trash:2}, function(err, updated){
					if(err){
						return res.serverError(Response.failure(err, 500));
					} else{
						data_return = updated
						callback(null);
					}
				})
			}, function(err){
					if(err) return res.serverError(Response.failure(err, 500));
					return res.ok(Response.success(data_return));
			})
		})
	},

	listing: function(req, res){
		if(req.method != 'GET'){
			return res.forbidden(Response.failure("Method Not Allowed", 405));
		}
		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401)); 

			if(!req.query.listing) return res.badRequest(Response.failure("Bad Request", 400));
			var listing = req.query.listing;
			var uid = data.id;

			Thread.find({listing: listing, box: uid}, function(err, records){
				if(!err && records.length>0 && req.query.buyer){
					async.each(records, function(record, callback){
						for (var i = record.receivers.length - 1; i >= 0; i--) {
							if(record.receivers[i].id == req.query.buyer){
								return res.ok(Response.success(record));
							}
						}
						callback(null);
					}, function(err){
						if(!err) return res.notFound(Response.failure("No Found", 404));	
					})
				} else if(!err && records.length >0 && !req.query.buyer){
					return res.ok(Response.success(records));
				} else if(!err && records.length<=0){
					return res.notFound(Response.failure("No Found", 404));
				} else{
					return res.serverError(Response.failure(err, 500));
				}
			})

		})
	},

	count: function(req, res){
		if(req.method != 'GET'){
			return res.forbidden(Response.failure("Method Not Allowed", 405));
		}
		AuthFunctions.getUser(req.headers['authorization'], function(data){
			if(data == 'bad') return res.forbidden(Response.failure("Not Authorized", 401));
			var uid = data.id;
			Thread.count({box:uid}, function(err, counts){
				if(!err){
					return res.ok(Response.success(counts));
				} else{
					res.serverError(Response.failure(err, 500));
				}
			})
		})
	}

};

