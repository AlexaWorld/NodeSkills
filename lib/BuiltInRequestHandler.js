// Copyright 2017, Peter Ullrich. dotup IT solutions
var ResponseBuilder = require('alexaworld-responsebuilder').ResponseBuilder;

//const requestHandler = async function (alexaRequest) {
const requestHandler = function (alexaRequest) {
		//const requestHandler = function (alexaRequest) {
	var rb = new ResponseBuilder(alexaRequest.Context);
	var requestName = alexaRequest.Request.type;

	var key = this.textKey || requestName;
	var text = this.skill.GetRandomText(alexaRequest.Translate(key));
	var repromt = this.skill.GetRandomText(alexaRequest.Translate("Reprompt"));
	rb
		.SaySsml(text)
		.Reprompt(repromt)
		.WithCard(builder => {
			builder.WithSimpleCard(this.skill.Name, text);
		})
		.WithDisplay(builder => {
			builder
				.HideBackButton()
				.WithBodyTemplate(2)
				.WithTitle(this.skill.Name)
				.WithPrimaryPlainText(text)
//				.WithSecondaryPlainText(ask)
				;
		})
		;
	return rb;
}

function getHandler(skill, textKey) {
	var context = {
		skill: skill,
		textKey: textKey
	};
	return requestHandler.bind(context);
}

module.exports.LaunchRequest = getHandler;
module.exports.Unhandled = getHandler;
module.exports.IntentRequest= getHandler;
module.exports.SessionEndedRequest = getHandler;

module.exports.AddToSkill = function (skill) {
	skill.AddRequestHandler('LaunchRequest', getHandler(skill));
	skill.AddRequestHandler('Unhandled', getHandler(skill));
	skill.AddRequestHandler('IntentRequest', getHandler(skill));
	skill.AddRequestHandler('SessionEndedRequest', getHandler(skill),'EndMessage');
}

/* module.exports.AddToSkill = function(skill){
	skill.AddRequestHandler('LaunchRequest', async function (alexaRequest) {
		var rb = new ResponseBuilder(alexaRequest.Context);
		
		var text = skill.GetRandomText( alexaRequest.Translate('LaunchRequest'));
		var ask = "Noch was?"; // TODO: text library
		rb
			.Say(text)
			.Ask(ask)
			.WithCard(builder => {
				builder.WithSimpleCard(skill.Name, text);
			})
			.WithDisplay(builder => {
				builder
					.WithBodyTemplate(2)
					.WithTitle(skill.Name)
					.WithPrimaryPlainText(text)
					.WithSecondaryPlainText(ask)
				;
			})
		;
		return rb;
	});
} */

