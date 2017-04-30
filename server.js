const Hapi = require('hapi');
const server = new Hapi.Server();
const Controller = require(__dirname+'/infra/Controller.js');

global.config = require(__dirname+'/config.json');
global.fs = require('fs');

server.connection({
	host: config.connection.host,
	port: config.connection.port
});

if(config.router.api){
	
	var path = (typeof config.router.api === 'string')?config.router.api:'api';
	
	server.route({
		method: '*',
		path: '/'+path+'/{action*}',
		handler: function(request, reply){
			Controller.newRequest('api', request, reply);
			return true;
		}
	});
	
}

server.route({
	method: '*',
	path: '/{uri*}',
	handler: function(request, reply){
		Controller.newRequest('page', request, reply);
		return true;
	}
});

server.start(function(error){
	console.log(server.info.uri);
});