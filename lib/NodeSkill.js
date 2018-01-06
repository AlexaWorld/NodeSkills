/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';
const Alexa = require('alexa-sdk');
const _ = require('lodash');

var library = require('./alexaworld-de.json');

var builtInHandlers = {
	'LaunchRequest': function () {
		this.response.speak(aw.GetRandomText(this.t('LaunchRequest')));
		this.emit(':responseReady');
	},
	'AMAZON.HelpIntent': function () {
		aw.requestBody = this.event;
		const speak = aw.GetRandomText(this.t('AMAZON_HelpIntent'));
		const listen = aw.GetRandomText(this.t('AMAZON_HelpIntent_Ask'));

		this.response.speak(listen).listen(listen);
		this.emit(':responseReady');
	},
	'AMAZON.CancelIntent': function () {
		this.response.speak(aw.GetRandomText(this.t('EndMessage')));
		this.emit(':responseReady');
	},
	'AMAZON.StopIntent': function () {
		this.response.speak(aw.GetRandomText(this.t('EndMessage')));
		this.emit(':responseReady');
	}
};

var aw = {
	Skill: {
		AppId: '',
		Name: ''
	},
	Texts: library,
	GetRandomText: function (items) {
		var index = _.random(0, items.length - 1);
		return items[index];
	},
	IntentHandler: builtInHandlers,
	AlexaHandler: function (event, context, callback) {
		var alexa = Alexa.handler(event, context);
		alexa.resources = aw.Texts;
		alexa.appId = aw.Skill.AppId;
		alexa.registerHandlers(aw.IntentHandler);
		alexa.execute();
	}
}

module.exports = aw;