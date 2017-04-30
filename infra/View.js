const LayoutCore = function(theme, GlobalContext){
	
	var self = this;
	var path = __dirname+'/../themes/';
	if(theme) path += theme+'/';
	var HTML = '';
	
	self.loadFile = function(file){
		
		var file = String(fs.readFileSync(path+file));
		return file;
		
	};
	
	self.parser = function(context, source){
		
		if(typeof context != 'object'){
			context = {};
		}
		
		context = Object.assign(context, GlobalContext);
		
		var html = '';
		var tag = false;
		if(typeof source != 'string')
			source = HTML;
		
		for(var i = 0;i < source.length;i++){
			var char = source[i];
			
			if(tag){
				tag.raw += char;
				
				if(['{', '}', '#'].indexOf(char) == -1 && !tag.contentProcess){
					tag.name += char;
				}else if(tag.contentProcess){
					
					if(tag.end){
						
						tag.end += char;
						
						if(char == '}'){
							
							if(tag.end == tag.raw.substr(0, tag.raw.indexOf('}')+1)){
								tag.same++;
								tag.content += tag.end;
							}else if(tag.end == '{/'+tag.name+'}'){
								if(tag.same > 0){
									tag.same--;
									tag.content += tag.end;
								}else{
									html += self.parser_executer(tag, context);
									tag = false;
								}
							}else{
								tag.content += tag.end;
								tag.end = false;
							}
							
							tag.end = false;
							
						}
						
					}else{
						
						if(char == '{'){
							tag.end = char;
						}else tag.content += char;
						
					}
				}else if(char == '}'){
					if(tag.raw.indexOf('#') > -1 && !tag.contentProcess){
						tag.contentProcess = true;
						tag.content = '';
					}else{
						
						html += self.parser_executer(tag, context);
						tag = false;
						
					}
				}
			}else{
				if(char == '{'){
					tag = {
						raw: char,
						name: '',
						same: 0,
						contentProcess: false
					};
				}else html += char;
			}
			
		}
		
		HTML = html;
		return html;
		
	};
	
	self.parser_executer = function(tag, context){
		
		var html = '';
		
		switch(typeof context[tag.name]){
				
			case 'string':
				html = context[tag.name];
				break;
				
			case 'number':
				html = String(context[tag.name]);
				break;
				
			case 'function':
				html = String(context[tag.name]());
				break;
				
			case 'object':
				html = self.parser(context[tag.name], tag.content);
				break;
				
			default:
				html = tag.raw;
				break;
				
		}
		
		return html;
		
	};
	
	HTML = self.loadFile('document.html');
	self.parser();
	
	return {
		
		code: 500,
		
		section: function(name, file, context){
			
			var data = {};
			file = self.loadFile(file);
			data['section_'+name] = file;
			self.parser(data);
			
		},
		
		render: function(){
			
			return HTML;
			
		}
		
	};
	
}

module.exports = {
	
	createLayout: LayoutCore,
	
	file: function(file){
		
		if(fs.existsSync(__dirname+'/../themes/'+config.view.theme+'/src/'+file))
			return fs.readFileSync(__dirname+'/../themes/'+config.view.theme+'/src/'+file);
		else return false;
		
	}
	
};