/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';
const _ = require('lodash');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

var library = require('./alexaworld-de.json');
var AlexaRequest = require('./AlexaRequest');

function getAlexaRequest(skill, requestBody) {

	var x = getTranslator(skill, requestBody);
	const translate = function () {
		return this.i18n.t.apply(this.i18n, arguments);
	};

	var request = new AlexaRequest();
	request.i18n = i18n;
	request.Context = requestBody.context;
	request.Request = requestBody.request;
	request.Session = requestBody.session;
	request.Version = requestBody.version;
	request.Translate = translate; //.bind(request);
	return request;
}

function getTranslator(skill, requestBody) {
	if (skill.texts) {
		var x = i18n.use(sprintf).init({
			overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
			returnObjects: true,
			lng: requestBody.request.locale,
			resources: skill.texts
		}, (err) => {
			if (err) {
				throw new Error('Error initializing i18next: ' + err);
			}
		});
	}
}

class NodeSkill {
	constructor() {
		this.AppId = '';
		this.Nameame = '';
		this.Texts = library;
		this.IntentHandler = {};
		this.RequestHandler = {};
	}

	set AppId(value) {
		this.appId = value;
	}
	get AppId() {
		return this.appId;
	}

	set Name(value) {
		this.name = value;
	}
	get Name() {
		return this.name;
	}

	set Texts(value) {
		this.texts = value;
	}
	get Texts() {
		this.texts = value;
		return this.name;
	}

	GetRandomText(items) {
		if (typeof items == "string")
			return items;
		var index = _.random(0, items.length - 1);
		return items[index];
	}

	AddRequestHandler(name, requestHandler) {
		if (requestHandler.name == "getHandler")
			requestHandler = requestHandler(this);
		this.RequestHandler[name] = requestHandler;
	}

	AddIntentHandler(name, intentHandler) {
		if (intentHandler.name == "getHandler")
			intentHandler = intentHandler(this);
		this.IntentHandler[name] = intentHandler;
	}

	// be compatible with lambda. Should be RequestHandler
	async handler(requestBody, res) {
		let type = requestBody.request.type;

		let result = null;

		let request = getAlexaRequest(this, requestBody);

		if (type === "IntentRequest") {
			var name = requestBody.request.intent.name;
			if (name in this.IntentHandler)
				// Intent handler found
				result = await this.IntentHandler[name](request);
			else
				// Intent handler NOT found
				result = await this.RequestHandler[type](request);

		} else {
			// Look up for request handler
			if (type in this.RequestHandler)
				result = await this.RequestHandler[type](request);
		}

		// TODO: Support -> return "response";
		if (typeof result !== "string")
			result = result.Build();

		return result;
	}
}

module.exports = NodeSkill;