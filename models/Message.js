/**
 * Messages.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	thread_identifier:{
  		type:'string',
  		primaryKey:true
  	},
  	body:{
  		type:'string'
  	},
  	sender: {
  		type: 'json',
  		required: true
  	},
  	title: {
  		type: 'string',
  		defaultsTo: 'No Subject'
  	},
  	thread_createdAt: {
  		type: 'string'
  	}
  }
};

