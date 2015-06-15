var config = {
	port : 80,

	defaultFile : 'default.html',

	error404 : '/'
};

var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs');

var handle = function (uri, response, error) {
	var filename = path.join(process.cwd(), uri);

	fs.exists(filename, function (exists) {
		if (exists) {
			if (fs.statSync(filename).isDirectory()) {
				if (uri.substr(-1) !== '/' && uri.length > 0) {
					response.writeHead(500, {
						'Location' : uri + '/'
					});

					response.end();

					return;
				}

				else {
					filename += config.defaultFile;
				}
			}

			fs.readFile(filename, 'binary', function (readError, file) {
				if (readError) {
					if (config.error500) {
						handle(config.error500, response, 500);
					}

					else {
						response.writeHead(500, {
							'Content-Type': 'text/plain'
						});

						response.write(error);
						response.end();
					}
				}

				else {
					response.writeHead(error || 200);
					response.write(file, 'binary');
					response.end();
				}
			});
		}

		else {
			if (config.error404) {
				handle(config.error404, response, 404);
			}

			else {
				response.writeHead(404, {
					'Content-Type': 'text/plain'
				});

				response.write('404 Not Found');
				response.end();
			}
		}
	});
};

http.createServer(function (request, response) {
	var uri = url.parse(request.url).pathname;

	handle(uri, response);
}).listen(config.port);

console.log('HTTP web-server started on port ' + config.port + '. Woot!');