module.export = {
	setCookieDefault: function(req, value){
		req.cookie('login', value, { maxAge: 900000, httpOnly: true });
	},
	
	
	setCookie: function(req, name, value, option){
		req.cookie(name, value, option);
	},
	
	clearCookie: function(req, name){
		req.clearCookie(name);
	}
};