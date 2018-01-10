// Copyright 2017, Peter Ullrich. dotup IT solutions
var ResponseBuilder = require('alexaworld-responsebuilder').ResponseBuilder;

//const requestHandler = async function (alexaRequest) {
const requestHandler = function (alexaRequest) {
		//const requestHandler = function (alexaRequest) {
	var rb = new ResponseBuilder(alexaRequest.Context);
	var requestName = alexaRequest.Request.type;
	var text = this.GetRandomText(alexaRequest.Translate(requestName));
	var ask = this.GetRandomText(alexaRequest.Translate("reprompt"));
	rb
		.Say(text)
		.Ask(ask)
		.WithCard(builder => {
			builder.WithSimpleCard(this.Name, text);
		})
		.WithDisplay(builder => {
			builder
				.HideBackButton()
				.WithBodyTemplate(2)
				.WithTitle(this.Name)
				.WithPrimaryPlainText(text)
				.WithSecondaryPlainText(ask)
				;
		})
		;
	return rb;
}

function getHandler(skill){
	return  requestHandler.bind(skill);
}

module.exports.LaunchRequest = getHandler;
module.exports.Unhandled = getHandler;
module.exports.IntentRequest= getHandler;
module.exports.SessionEndedRequest = getHandler;

module.exports.AddToSkill = function (skill) {
	skill.AddRequestHandler('LaunchRequest', getHandler(skill));
	skill.AddRequestHandler('Unhandled', getHandler(skill));
	skill.AddRequestHandler('IntentRequest', getHandler(skill));
	skill.AddRequestHandler('SessionEndedRequest', getHandler(skill));
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

