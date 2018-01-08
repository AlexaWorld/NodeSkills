/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';
const _ = require('lodash');

var library = require('./alexaworld-de.json');

class NodeSkill {
	constructor() {
		this.AppId = '';
		this.Nameame = '';
		this.Texts = library;
		this.IntentHandler = {};
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

	RegisterHandler(name, handler) {
		this.IntentHandler[name] = handler;
	}

	// be compatible with lambda. Should be RequestHandler
	async handler(requestBody,res) {
		var r = requestBody.request.type;
		if(r in this.IntentHandler){
			var result = await this.IntentHandler[r]();

			if (typeof result !== "string")
				result = result.Build();
			return result;
		}
		return '';
	}

	/* 	AlexaHandler: function (event, context, callback) {
			const Alexa = require('alexa-sdk');
			var alexa = Alexa.handler(event, context,callback);
			alexa.resources = aw.Texts;
			alexa.appId = aw.Skill.AppId;
			alexa.registerHandlers(aw.IntentHandler);
			alexa.execute();
		}, */
	GetSlots() {
		if (aw.requestBody.request.intent && aw.requestBody.request.intent.slots)
			return aw.requestBody.request.intent.slots;
		else
			return null;
	}

	GetSlot(slotname) {
		var slots = aw.GetSlots();
		if (slots)
			return slots[slotname];
		else
			return null;
	}

	GetSlotValue(slotname, defaultValue) {
		var slot = aw.GetSlot(slotname);
		if (slot && slot.value)
			return slot.value;
		else
			return defaultValue === null ? null : defaultValue();
	}

	GetHandler(){
		return this.IntentHandler;
	}
}

module.exports = NodeSkill;