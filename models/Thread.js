
module.exports = {

  attributes: {
  	identifier: {
  		type:'string',
  		required: true,
  		primaryKey:true
  	},
  	box:{
  		type:'string',
  		required: true
  	},
  	title:{
  		type:'string',
  		defaultsTo:'No Title'
  	},
  	listing: {
  		type:'string',
  		defaultsTo: 'No listing associated'
  	},
  	receivers: {
  		type:'array',
  		required:true
  	},
  	trash: {
  		type: 'integer',
  		defaultsTo: 0
  	},
  	read: {
  		type: 'integer',
  		defaultsTo : 0
  	}
  }
};