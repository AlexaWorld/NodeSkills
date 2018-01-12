// Copyright 2017, Peter Ullrich. dotup IT solutions
var ResponseBuilder = require('alexaworld-responsebuilder').ResponseBuilder;

const isIntentRequest = function(request){

}

class RequestHandler {
	get [Symbol.toStringTag]() {
    return 'RequestHandler';
	}

	constructor(name){
			this.shouldAsk = false;
			this.name = name;
	}


	get Name() { return this.name; }
	set Name(value) { this.name = value; }

	get Skill() { return this.skill; }
	set Skill(value) { this.skill = value; }

	get ShouldAsk() { return this.shouldAsk; }
	set ShouldAsk(value) { this.shouldAsk = value; }

	get TextKey() { return this.textKey; }
	set TextKey(value) { this.textKey = value; }

	get Reprompt() { return this.reprompt; }
	set Reprompt(value) { this.reprompt = value; }

	//const intentHandler = async function (alexaRequest) {
	GetResponse(alexaRequest) {
		var rb = new ResponseBuilder(alexaRequest.Context);

		//var requestName = alexaRequest.Request.intent.name;

		var text = this.skill.GetRandomText(alexaRequest.Translate(this.textKey));

		if (this.shouldAsk)
			rb.AskSsml(text);
		else
			rb.SaySsml(text);

		rb
			.WithCard(builder => {
				builder.WithSimpleCard(this.skill.Name, text);
			})
			.WithDisplay(builder => {
				builder
					.WithTitle(this.skill.Name)
					.WithPrimaryPlainText(text)
					;
				if (this.repromt)
					builder.WithSecondaryPlainText(this.repromt);
			})
			;

		if (this.repromt)
			rb.RepromptSsml(this.repromt);
		return rb;
	}

	static AddToSkill(skill) {

		const getHandler = function (name, textKey, shouldAsk = false) {
			var handler = new RequestHandler(name);
			handler.ShouldAsk = shouldAsk;
			handler.TextKey = textKey || handler.Name.replace('.', '_');
			handler.Skill = skill;
			return handler;
		};

		skill.AddRequestHandler(getHandler('LaunchRequest', null, true));
		skill.AddRequestHandler(getHandler('Unhandled'));
		skill.AddRequestHandler(getHandler('IntentRequest'));
		skill.AddRequestHandler('SessionEndedRequest', _ => { return; });
	}
}

module.exports = RequestHandler;