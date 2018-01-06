// https://medium.com/@niklongstone/alexa-amazon-date-and-js-5c8e819913b2
// https://developer.amazon.com/de/docs/custom-skills/slot-type-reference.html#date

var AlexaDate = function AlexaDate() {

  this.GetTimeFromDate = function(value){
    value = value.toString();
    var hh = value.substr(0, 2);
    var mm = value.substr(3, 2);
    return hh+':'+mm; 
  }
  
  this.ToReadableDate= function(date){
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('de-DE');//, options);
  }
  
  this.ToDate = function(value){
    if(!value.substr)
      return value;
    let d = value.substr(0, 2);
    let m = value.substr(3, 2);
    let y = value.substr(6, 4);
    return new Date(y,Number(m)-1,d,0,0,0);
  }
  
  this.Now = function(){
    return new Date();
  }
  
  this.GetCurrentYear = function(){
    return new Date().getFullYear().toString();
  }
  
  //night: NI, morning: MO, afternoon: AF, evening: EV
  this.GetTimeOfDay = function(value){
    switch (value) {
      case 'NI':
        return "night";
      case 'MO':
        return "morning";
      case 'AF':
        return "afternoon";
      case 'EV':
        return "evening";
      default:
        return null;
    }
  }
}
/*

getDate() 	Get the day as a number (1-31)
getDay() 	Get the weekday as a number (0-6)
getFullYear() 	Get the four digit year (yyyy)
getHours() 	Get the hour (0-23)
getMilliseconds() 	Get the milliseconds (0-999)
getMinutes() 	Get the minutes (0-59)
getMonth() 	Get the month (0-11)
getSeconds() 	Get the seconds (0-59)
getTime() 	Get the time (milliseconds since January 1, 1970)
*/

module.exports = new AlexaDate();
/*
module.exports = {  
    AlexaDate: AlexaDate
}
*/