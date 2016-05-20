module.exports = {
	success : function(data){
		return {success: {data:data}};
	},
	failure : function(msg, code){
		return {failure:{msg:msg, code:code}};
	}
}