// Copyright 2017, Peter Ullrich. dotup IT solutions
/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';
const _ = require('lodash');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const isTypeOf = require('alexaworld-nodejs-common').isTypeOf;
const typeOf = require('alexaworld-nodejs-common').typeOf;
const helper = require('alexaworld-nodejs-common').helper;

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
		return this.texts;
	}

	AddTextLibrary(textLibrary) {
		helper.MergeProperties(this.Texts, textLibrary);
	}

	GetRandomText(items) {
		if (typeof items == "string")
			return items;
		var index = _.random(0, items.length - 1);
		return items[index];
	}

	AddRequestHandler(handler) {
		this.RequestHandler[handler.name] = handler;
	}
	AddRequestHandler(name, requestHandler) {
		if (requestHandler.name == "getHandler")
			requestHandler = requestHandler(this);
		this.RequestHandler[name] = requestHandler;
	}

	AddIntentHandler(handler) {
		this.IntentHandler[handler.name] = handler;
	}
	AddIntentHandler(name, intentHandler) {
		if (intentHandler.name == "getHandler")
			intentHandler = intentHandler(this);
		this.IntentHandler[name] = intentHandler;
	}

	// async handler(requestBody, res) {
	HttpRequestHandler(requestBody, res) {
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
				let request = getAlexaRequest(self, requestBody);
				let result = null;

				if (type === "IntentRequest") {

					var name = requestBody.request.intent.name;
					if (name in self.IntentHandler) {
						// Intent handler found
						let handler = self.IntentHandler[name];
						if (isTypeOf(handler, "IntentHandler"))
							result = handler.GetResponse(request);
						else
							result = handler(request);
					}
					else {
						// Intent handler NOT found
						let handler = self.RequestHandler[type];
						if (isTypeOf(handler, "RequestHandler"))
							result = handler.GetResponse(request);
						else
							result = handler(request);
					}
				} else {
					// Look up for request handler
					if (type in self.RequestHandler) {
						let handler = self.RequestHandler[type];
						if (isTypeOf(handler, "RequestHandler"))
							result = handler.GetResponse(request);
						else
							result = handler(request);
					}
				}

				// TODO: Support -> return "response";
				//if (typeof result !== "string")
				//	result = result.Build();

				// Promisse result 
				if (isTypeOf(result, "Promise"))
					resolve(result);

				if (isTypeOf(result, "ResponseBuilder"))
					resolve(result.Build());

			} catch (error) {
				reject(error);
			}
		});
		return p;
	}

	export() {
		if (process.env.AWS_EXECUTION_ENV) {
			var self = this; // in AWS this is not bound 
			return {
				handler(event, context, callback) {
					self.HttpRequestHandler(event, context)
						.then(r => callback(null, r))
						.catch(r => callback(r));
				}
			}
		} else {
			return this; // SkillServer
		}
	}

}

module.exports = NodeSkill;