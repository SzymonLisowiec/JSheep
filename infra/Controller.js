const ControllerCore = function(){
	
	const self = this;
	const Model = require(__dirname+'/Model.js');
	const View = require(__dirname+'/View.js');
	
	self.api = function(request, reply){
		
		var action = request.params.action;
		if(/[A-Za-z_]{1,}\.js/g.test(action)){
			if(fs.existsSync(__dirname+'/../api/'+action)){
				action = require(__dirname+'/../api/'+action);
				reply(action).code(200);
				return true;
			}
		}
		
		reply('{}').code(404);
		return false;
		
	}
	
	self.page = function(request, reply){
		
		var page = request.params.uri;
		
		if(/[A-Za-z_]{1,}/g.test(page)){
			
			if(fs.existsSync(__dirname+'/../app/'+page+'.js')){
				
				var Layout = View.createLayout('default', {
					CHARSET: 'utf-8',
					PAGE_TITLE: 'tytuł'
				});
				Layout.code = 200;
				
				require(__dirname+'/../app/'+page+'.js')(Layout, Model, request);
				
				reply(Layout.render()).code(Layout.code);
				
			}else self.file(request, reply);
			
		}else self.file(request, reply);
		
		return false;
		
	}
	
	self.file = function(request, reply){
		
		var file = request.params.uri.replace(/(\.\.\/)|(\.\/)/g, '');
		
		try {
			
			if(/[A-Za-z_.\/]{1,}/g.test(file)){
				if(fs.existsSync(__dirname+'/../public/'+file)){
					reply(fs.readFileSync(__dirname+'/../public/'+file)).code(200);
				}else{
					var file = View.file(file);
					if(file){
						
						reply(file).code(200);
						
					}else throw 404;
				}
			}else throw 404;
			
		}catch(code){
			
			self.error(code, request, reply);
			
		}
		
		return true;
		
	};
	
	self.error = function(code, request, reply){
		
		var Layout = View.createLayout(false, {
			CHARSET: 'utf-8',
			PAGE_TITLE: 'tytuł',
			CODE: code
		});
		
		switch(code){
			
			case 404:
				Layout.code = 404;
				break;
				
			default:
				Layout.code = 500;
				break;
			
		}
		
		reply(Layout.render()).code(Layout.code);
		
	};
	
	return {
		
		newRequest: function(mode, request, reply){
			
			if(typeof config.router.aliases[request.params.uri] == 'string')
				request.params.uri = config.router.aliases[request.params.uri];

			switch(mode){
				
				case 'api':
					self.api(request, reply);
					break;

				case 'page':
					self.page(request, reply);
					break;

				default:
					new Error('Undefined request mode');
					break;

			}

		}
		
	};
	
};

module.exports = new ControllerCore();