// Copyright 2017, Peter Ullrich. dotup IT solutions
const RequestHandler = require('./RequestHandler');

class IntentHandler extends RequestHandler {
	get [Symbol.toStringTag]() {
    return 'IntentHandler';
	}

	constructor(name) {
		super();
		super.Name = name;
	}

	// GetResponse(alexaRequest) {
	// 	super.GetResponse(alexaRequest);
	// }

	static AddToSkill(skill) {

		const getHandler = function (name, textKey, shouldAsk = false) {
			var handler = new IntentHandler(name);
			handler.ShouldAsk = shouldAsk;
			handler.TextKey = textKey || handler.Name.replace('.', '_');
			handler.Skill = skill;
			return handler;
		};

		skill.AddIntentHandler(getHandler('AMAZON.HelpIntent', null, true));
		skill.AddIntentHandler(getHandler('AMAZON.CancelIntent', "EndMessage"));
		skill.AddIntentHandler(getHandler('AMAZON.StopIntent', "EndMessage"));
		//skill.AddIntentHandler(getHandler('AMAZON.YesIntent'));
	}

}
module.exports = IntentHandler;



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