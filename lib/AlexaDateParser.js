// Copyright 2017, Peter Ullrich. dotup IT solutions
// https://developer.amazon.com/de/docs/custom-skills/slot-type-reference.html#date

// winter: WI, spring: SP, summer: SU, fall: FA
// [Year offset, month, day] for 'to' the last day of the previous month is used

/*
var d = new AlexaDate();
let result;
result = d.Parse("202X");
result = d.Parse("2020");
result = d.Parse("2018-2");
result = d.Parse("2018-WI");
result = d.Parse("2018-SP");
result = d.Parse("2018-SU");
result = d.Parse("2018-FA");
result = d.Parse("2018-W40");
result = d.Parse("2018-W1");
result = d.Parse("2018-W2");
result = d.Parse("2018-W2-WE");
*/

const AlexaDateTypes= {
		day: "day",
		month: "month",
		year: "year",
		season: "season",
		timespan: "timespan",
		weekend: "weekend",
		week: "week"
};

const season = {
	WI: { from: [0, 11, 1], to: [1, 2, 1] }, 	// 01.12. - xx.02.
	SP: { from: [0, 2, 1], to: [0, 5, 1] },		// 01.3. - xx.5.
	SU: { from: [0, 5, 1], to: [0, 8, 1] },		// 01.6. - xx.8.
	FA: { from: [0, 8, 1], to: [0, 11, 1] }	// 01.9. - xx.11.
}

const getMonday = function (dt) {
	var day = dt.getDay() || 7; // Get current day number, converting Sun. to 7
	if (day !== 1)                // Only manipulate the date if it isn't Mon.
		dt.setHours(-24 * (day - 1));
	return dt;
}

function getDateOfISOWeek(w, y) {
	var simple = new Date(y, 0, 1 + (w - 1) * 7);
	var dow = simple.getDay();
	var ISOweekStart = simple;
	if (dow <= 4)
		ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
	else
		ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
	return ISOweekStart;
}

const getLastDayOfMonth = function (date, month) {
	return new Date(date.getFullYear(), month + 1, 0).getDate();
}

const getRegularDate = function (dt, type) {
	try {
		var result = new Date(dt);
		var from = new Date(result.getFullYear(), result.getMonth(), result.getDate(), 0, 0, 0, 0);
		var to = new Date(result.getFullYear(), result.getMonth(), result.getDate(), 23, 59, 59, 999);
		return {
			type: type,
			from: from,
			to: to
		};
	} catch (error) {
		return null;
	}
}

const parseAmazonDate1 = function (dt) {

	if (dt.indexOf('X') > -1) {
		// “this decade”: 201X
		var year = dt.replace('X', '');
		var from = new Date(parseInt(year + '0'), 0, 1, 0, 0, 0, 0);
		var to = new Date(parseInt(year + '9'), 11, 31, 23, 59, 59, 999);
		return {
			type: AlexaDateTypes.timespan,
			from: from,
			to: to
		};
	} else {
		// “next year”: 2016
		var from = new Date(parseInt(dt), 0, 1, 0, 0, 0, 0);
		var to = new Date(parseInt(dt) + 1, 0, 1, 23, 59, 59, 999);
		to.setDate(to.getDate() - 1);
		return {
			type: AlexaDateTypes.year,
			from: from,
			to: to
		};
	}
}

const parseAmazonDate2 = function (dtp) {
	var year = parseInt(dtp[0]);

	// “this month”: 2015-11
	if (Number.isInteger(parseInt(dtp[1]))) {
		var month = parseInt(dtp[1] - 1);
		var from = new Date(year, month, 1, 0, 0, 0, 0);
		var to = new Date(year, month, getLastDayOfMonth(from, month), 23, 59, 59, 999);
		return {
			type: AlexaDateTypes.month,
			from: from,
			to: to
		};
	}

	// “next winter”: 2017-WI
	for (const key in season) {
		if (season.hasOwnProperty(key) && key == dtp[1]) {
			const item = season[key];
			var from = new Date(year, item.from[1], item.from[2], 0, 0, 0, 0);
			var toDate = new Date(year, item.to[1] - 1, item.to[2]);
			var to = new Date(year + item.to[0], item.to[1] - 1, getLastDayOfMonth(toDate, item.to[1] - 1), 23, 59, 59, 999);
			return {
				type: AlexaDateTypes.season,
				from: from,
				to: to
			};
		}
	}

	// “this week”: 2015-W48
	// “next week”: 2015-W49
	var week = parseInt(dtp[1].replace('W', ''));
	var from = getDateOfISOWeek(week, year);
	var to = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 23, 59, 59, 999);
	to.setDate(to.getDate() + 6);
	return {
		type: AlexaDateTypes.week,
		from: from,
		to: to
	};

}

const parseAmazonDate3 = function (dtp) {
	var year = parseInt(dtp[0]);

	// “today”: 2015-11-24
	// “now”: 2015-11-24
	// “tomorrow”: 2015-11-25
	// “november twenty-fifth”: 2015-11-25
	// “next monday”: 2015-11-30
	// “right now”: 2015-11-24
	if (Number.isInteger(parseInt(dtp[1]))) {
		return getRegularDate(dtp.join('-'), AlexaDateTypes.day);
	}

	// “this weekend”: 2015-W48-WE
	var week = parseInt(dtp[1].replace('W', ''));
	var from = getDateOfISOWeek(week, year);
	var from = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 5, 0, 0, 0, 0);
	var to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1, 23, 59, 59, 999);
	return {
		type: AlexaDateTypes.weekend,
		from: from,
		to: to
	};

}


module.exports.parseAmazonDate1 = parseAmazonDate1;
module.exports.parseAmazonDate2 = parseAmazonDate2;
module.exports.parseAmazonDate3 = parseAmazonDate3;
module.exports.AlexaDateTypes = AlexaDateTypes;
