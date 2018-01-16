// Copyright 2017, Peter Ullrich. dotup IT solutions
// https://developer.amazon.com/de/docs/custom-skills/slot-type-reference.html#date
const isTypeOf = require('alexaworld-nodejs-common').isTypeOf;
const parser = require('./AlexaDateParser');
const AlexaDateTypes = require('./AlexaDateParser').AlexaDateTypes;

const weekday = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const month = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

class AlexaDate {
	get [Symbol.toStringTag]() {
		return 'AlexaDate';
	}

	constructor(dt) {
		if (dt)
			this.Parse(dt);
	}

	static get Types() { return AlexaDateTypes; }

	GetAnswerForType() {
		switch (this.type) {
			case AlexaDateTypes.day:
				return `Für den ${AlexaDate.ToSpeakableDate(this.from)}`;
				break;
			case AlexaDateTypes.month:
				return `Für ${this.GetMonth()}`;
				break;
			case AlexaDateTypes.season:
				break;
			case AlexaDateTypes.timespan:
				break;
			case AlexaDateTypes.week:
			return `Für die Woche`;
				break;
			case AlexaDateTypes.weekend:
			return `Für's Wochenende`;
			break;
			case AlexaDateTypes.year:
				return `Für ${this.Year}`;
				break;

		}
	}

	Parse(dt) {
		if (isTypeOf(dt, "Date")) {
			result = {
				rawValue: dt.toString(),
				type: AlexaDateTypes.day,
				from: dt,
				to: dt
			};
		}
		else {
			var parts = dt.split('-');
			switch (parts.length) {
				case 1:
					var result = parser.parseAmazonDate1(dt);
					break;
				case 2:
					var result = parser.parseAmazonDate2(parts);
					break;
				case 3:
					var result = parser.parseAmazonDate3(parts);
					break;
			}
		}
		if (result) {
			this.rawValue = dt;
			this.type = result.type;
			this.from = result.from;
			this.to = result.to;
			return result;
		}
	}

	AddYears(years) {
		this.from.setFullYear(this.from.getFullYear() + years);
	}

	static ToDate(value) {
		if (!value.substr)
			return value;
		let d = value.substr(0, 2);
		let m = value.substr(3, 2);
		let y = value.substr(6, 4);
		return new Date(y, Number(m) - 1, d, 0, 0, 0);
	}

	static ToSpeakableDate(value) {
		var s = `${value.getDate()}.${value.getMonth() + 1}.${value.getFullYear()}`
		return s;
		//return date.toLocaleDateString('de-DE');//, options);
	}

	//set Value(value) { this.value = value; }
	get From() { return this.from; }
	get To() { return this.to; }
	get Type() { return this.type; }
	//	set RawValue(value) { this.rawValue = value; }
	get RawValue() { return this.rawValue; }
	get Year() { return this.from.getFullYear(); }

	GetMonth() {
		return month[this.from.getMonth()];
	}

	IsToday() {
		var now = new Date();
		return this.from.getFullYear() == now.getFullYear() &&
			this.from.getMonth() == now.getMonth() &&
			this.from.getDate() == now.getDate()
			;
	}

	IsValid(){
		return this.from !== undefined && this.type != undefined;		
	}
}

module.exports = AlexaDate;