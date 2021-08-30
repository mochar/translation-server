const functions = require("firebase-functions");

const process = require('process');
const config = require('config');
const Koa = require('koa');
const _ = require('koa-route');
// const bodyParser = require('koa-bodyparser');
const cors = require('./cors');

// Prevent UnhandledPromiseRejection crash in Node 15, though this shouldn't be necessary
process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled rejection:', reason.stack || reason)
});

require('./zotero');
const Debug = require('./debug');
const Translators = require('./translators');
const SearchEndpoint = require('./searchEndpoint');
const WebEndpoint = require('./webEndpoint');
const ExportEndpoint = require('./exportEndpoint');
const ImportEndpoint = require('./importEndpoint');

// const app = module.exports = new Koa();
const app = new Koa();
app.use(cors);
// app.use(bodyParser({ enableTypes: ['text', 'json']}));
app.use(_.post('/web', WebEndpoint.handle.bind(WebEndpoint)));
app.use(_.post('/search', SearchEndpoint.handle.bind(SearchEndpoint)));
app.use(_.post('/export', ExportEndpoint.handle.bind(ExportEndpoint)));
app.use(_.post('/import', ImportEndpoint.handle.bind(ImportEndpoint)));

Debug.init(process.env.DEBUG_LEVEL ? parseInt(process.env.DEBUG_LEVEL) : 1);
Translators.init().then(function () {
	// Don't start server in test mode, since it's handled by supertest
	// if (process.env.NODE_ENV == 'test') return;
	return;
	
	var port = config.get('port');
	var host = config.get('host');
	app.listen(port, host);
	Debug.log(`Listening on ${host}:${port}`);
});

module.exports.api = functions.https.onRequest(app.callback());
