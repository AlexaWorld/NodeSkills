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
const AlexaWorldAttributes = require('alexaworld-nodejs-common').AlexaWorldAttributes;
const ResponseBuilder = require('alexaworld-responsebuilder').ResponseBuilder;
const AlexaRequest = require('./AlexaRequest');
const library = require('./alexaworld-de.json');

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
	request.systemState = getAlexaWorldAttributes(requestBody);
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

function getAlexaWorldAttributes(requestBody) {
	let sys;

	// restore system attributes first
	if (requestBody.session && requestBody.session.attributes && requestBody.session.attributes["AlexaWorld"])
		sys = requestBody.session.attributes["AlexaWorld"];
	else {
		sys = new AlexaWorldAttributes();
		sys.isLaunched = requestBody.request.type === "LaunchRequest";
	}

	// Add current request
	if (requestBody.request.type == "IntentRequest") {
		sys.callStack.push(requestBody.request.intent.name);
	} else {
		sys.callStack.push(requestBody.request.type);
	}

	return sys;
	// if (requestBody.session && requestBody.session.attributes && requestBody.session.attributes["AlexaWorld"])
	// 	requestBody.session.attributes["AlexaWorld"] = JSON.stringify(sys);
}

class NodeSkill {
	get [Symbol.toStringTag]() {
		return 'NodeSkill';
	}

	constructor() {
		this.AppId = process.env.APP_ID || '';
		this.Name = '';
		this.Texts = library;
		this.IntentHandler = {};
		this.RequestHandler = {};
	}

	get AppId() { return this.appId; }
	set AppId(value) { this.appId = value; }

	get Name() { return this.name; }
	set Name(value) { this.name = value; }

	get Texts() { return this.texts; }
	set Texts(value) { this.texts = value; }

	AddTextLibrary(textLibrary) {
		helper.MergeProperties(this.Texts, textLibrary);
	}

	OverrideText(language, key, value) {
		this.texts[language].translation[key] = value;
	}

	GetRandomText(items) {
		if (typeof items == "string")
			return items;
		var index = _.random(0, items.length - 1);
		return items[index];
	}

	AddRequestHandler(handler, name) {
		if (!name)
			name = handler.name;
		this.RequestHandler[name] = handler;
	}

	AddIntentHandler(handler, name) {
		if (!name)
			name = handler.name;
		this.IntentHandler[name] = handler;
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
			let request = null;

			try {
				request = getAlexaRequest(self, requestBody);
				let type = requestBody.request.type;
				let result = null;

				if (self.OnNewSession && request.IsNewSession) self.OnNewSession(request);

				if (type === "IntentRequest") {

					if (self.OnIntentRequest) self.OnIntentRequest(request);

					var name = requestBody.request.intent.name;
					if (name in self.IntentHandler) {
						// Intent handler found
						let handler = self.IntentHandler[name];
						if (isTypeOf(handler, "Function"))
							result = handler(request);
						else
							result = handler.GetResponse(request);
					}
					else {
						// Intent handler NOT found
						let handler = self.RequestHandler[type];
						if (isTypeOf(handler, "Function"))
							result = handler(request);
						else
							result = handler.GetResponse(request);
					}
				} else {

					if (self.OnRequest) self.OnRequest(request);

					// Look up for request handler
					if (type in self.RequestHandler) {
						let handler = self.RequestHandler[type];
						if (isTypeOf(handler, "Function"))
							result = handler(request);
						else
							result = handler.GetResponse(request);
					}
				}

				if (self.OnResult) self.OnResult(request, result);

				// TODO: Support -> return "response";
				//if (typeof result !== "string")
				//	result = result.Build();

				// Promisse result 
				if (isTypeOf(result, "Promise"))
					resolve(result);

				if (isTypeOf(result, "ResponseBuilder"))
					resolve(result.Build());

				// TODO: this is a return null. E.g.. handler = _ => {return;};
				resolve(result || {});
			} catch (error) {
				//				reject(error);
				console.log(error);
				let text = request.Translate("PleaseRepeat");
				text = self.GetRandomText(text);
				let rb = new ResponseBuilder(request);
				rb.Ask(text);
				let sorry = rb.Build();
				resolve(sorry);
			}
		});
		return p;
	}

	export() {
		if (process.env.AWS_EXECUTION_ENV) {
			console.info("exported on aws");
			var self = this; // in AWS this is not bound 
			return {
				handler(event, context, callback) {
					self.HttpRequestHandler(event, context)
						.then(r => callback(null, r))
						.catch(r => callback(r));
				}
			}
		} else {
			console.info("exported on skill server");
			return this; // SkillServer
		}
	}

}

module.exports = NodeSkill;