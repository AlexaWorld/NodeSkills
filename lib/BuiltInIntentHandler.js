// Copyright 2017, Peter Ullrich. dotup IT solutions
var ResponseBuilder = require('alexaworld-responsebuilder').ResponseBuilder;

//const intentHandler = async function (alexaRequest) {
const intentHandler = function (alexaRequest) {
	var rb = new ResponseBuilder(alexaRequest.Context);
	var requestName = alexaRequest.Request.type;

	var key = this.textKey || requestName;
	var text = this.skill.GetRandomText(alexaRequest.Translate(key));

	rb
		.SaySsml(text)
		.WithCard(builder => {
			builder.WithSimpleCard(this.skill.Name, text);
		})
		.WithDisplay(builder => {
			builder
				.HideBackButton()
				.WithBodyTemplate(2)
				.WithTitle(this.skill.Name)
				.WithPrimaryPlainText(text)
				;
			if (this.repromt)
				builder.WithSecondaryPlainText(this.repromt);
		})
		;

	if (this.repromt)
		rb.Ask(this.repromt);
	return rb;
}

function getHandler(skill, textKey) {
	var context = {
		skill: skill,
		textKey: textKey
	};
	return intentHandler.bind(context);
}

module.exports.HelpIntent = getHandler;
module.exports.CancelIntent = getHandler;
module.exports.StopIntent = getHandler;

module.exports.AddToSkill = function (skill) {
	skill.AddIntentHandler('AMAZON.HelpIntent', getHandler(skill));
	skill.AddIntentHandler('AMAZON.CancelIntent', getHandler(skill));
	skill.AddIntentHandler('AMAZON.StopIntent', getHandler(skill));
	skill.AddIntentHandler('AMAZON.YesIntent', getHandler(skill));
}
/*
		public static string CancelIntent = "AMAZON.CancelIntent";
		public static string HelpIntent = "AMAZON.HelpIntent";
		public static string StopIntent = "AMAZON.StopIntent";
		public static string YesIntent = "AMAZON.YesIntent";

		public static string LoopOffIntent = "AMAZON.LoopOffIntent";
		public static string LoopOnIntent = "AMAZON.LoopOnIntent";
		public static string NextIntent = "AMAZON.NextIntent";
		public static string NoIntent = "AMAZON.NoIntent";
		public static string PauseIntent = "AMAZON.PauseIntent";
		public static string PreviousIntent = "AMAZON.PreviousIntent";
		public static string RepeatIntent = "AMAZON.RepeatIntent";
		public static string ResumeIntent = "AMAZON.ResumeIntent";
		public static string ShuffleOffIntent = "AMAZON.ShuffleOffIntent";
		public static string ShuffleOnIntent = "AMAZON.ShuffleOnIntent";
		public static string StartOverIntent = "AMAZON.StartOverIntent";
*/