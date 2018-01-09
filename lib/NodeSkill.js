/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';
const _ = require('lodash');
const i18n = require('i18n')
var library = require('./alexaworld-de.json');
var AlexaRequest = require('./AlexaRequest');

function getAlexaRequest(skill,requestBody) {

	const translate = function() {
		return this.i18n.t.apply(this.i18n, arguments);
	};

	var request = new AlexaRequest();
	request.i18n = i18n;
	request.Context = requestBody.context;
	request.Request = requestBody.request;
	request.Session = requestBody.session;
	request.Version = requestBody.version;
	request.Translate = translate;
	return request;
}

function getTranslator(skill, requestBody) {
	if (skill.texts) {
		i18n.use(sprintf).init({
			overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
			returnObjects: true,
			lng: requestBody.Request.locale,
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
			var index = _.random(0, items.length - 1);
			return items[index];
		}

		AddRequestHandler(name, handler) {
			this.RequestHandler[name] = handler;
		}

		AddIntentHandler(name, handler) {
			this.IntentHandler[name] = handler;
		}

		// be compatible with lambda. Should be RequestHandler
		async handler(requestBody, res) {
			let type = requestBody.request.type;

			let result = null;

			let request = getAlexaRequest(this, requestBody);

			// Look up for request handler first
			if (type in this.RequestHandler)
				result = await this.RequestHandler[type](request);

			// Then for intent handler
			if (type in this.IntentHandler)
				result = await this.IntentHandler[type](request);

			// TODO: Support -> return "response";
			if (typeof result !== "string")
				result = result.Build();

			return result;
		}

		/* 	AlexaHandler: function (event, context, callback) {
				const Alexa = require('alexa-sdk');
				var alexa = Alexa.handler(event, context,callback);
				alexa.resources = aw.Texts;
				alexa.appId = aw.Skill.AppId;
				alexa.registerHandlers(aw.IntentHandler);
				alexa.execute();
			}, */

	}

	module.exports = NodeSkill;