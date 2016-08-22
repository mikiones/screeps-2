var util = {
	make_id : function() {
		var text = "";
		var possible = "ABCDEF0123456789";
		for( var i=0; i < 8; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	},
	choice : function(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}
};

module.exports = util;
