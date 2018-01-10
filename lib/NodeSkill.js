// Copyright 2017, Peter Ullrich. dotup IT solutions
/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';
const _ = require('lodash');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const isTypeOf = require('alexaworld-nodejs-common').isTypeOf;

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
	get [Symbol.toStringTag]() {
		return 'NodeSkill';
	}

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
	// async handler(requestBody, res) {
	handler(requestBody, res) {
		var self = this;
		var p = new Promise(function (resolve, reject) {
			var inner = self.handlerPromise(requestBody, res);
			inner.then(value => {
				try {
					if (isTypeOf(value, "ResponseBuilder"))
						value = value.Build();
					resolve(value);
				} catch (error) {
					reject(error);
				}
			});
		});
		return p;
	}

	handlerPromise(requestBody, res) {
		var self = this;
		var p = new Promise(function (resolve, reject) {

			try {
				let type = requestBody.request.type;

				let result = null;

				let request = getAlexaRequest(self, requestBody);

				if (type === "IntentRequest") {

					var name = requestBody.request.intent.name;
					result = self.IntentHandler[name](request);
					if (name in self.IntentHandler)
						// Intent handler found
						result = self.IntentHandler[name](request);
					else
						// Intent handler NOT found
						result = self.RequestHandler[type](request);

				} else {
					// Look up for request handler
					if (type in self.RequestHandler)
						result = self.RequestHandler[type](request);
				}

				// TODO: Support -> return "response";
				//if (typeof result !== "string")
				//	result = result.Build();


				// Promissed result 
				if (isTypeOf(result, "Promise")) {
					resolve(result);
				}

				if (isTypeOf(result, "ResponseBuilder"))
					result = result.Build();

				resolve(result);

			} catch (error) {
				reject(error);
			}
		});
		return p;
	}
}

module.exports = NodeSkill;