'use strict';
const hapi = require('@hapi/hapi');
const path = require('path');
const inert = require('@hapi/inert');

(async function() {

	const server = hapi.server({
		routes: {
			files: {
				relativeTo: path.join(__dirname, '')
			}
		}
	});

	await server.register(inert);

	server.route({
		method: 'GET',
		path: '/{filepath*}',
		handler: {
			directory: {
				path: '.'
			}
		}
	});

	await server.start();

	console.log('Server running at:', server.info.uri);

})();
