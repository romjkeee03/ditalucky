var getColor = function(item) {

	if (typeof item == 'undefined') {
		return {
			background_color: 'rgb(191,191,191)',
			color: '#000'
		};
	} else if (typeof item.name == 'undefined') {
		return {
			background_color: 'rgb(191,191,191)',
			color: '#000'
		};
	} else if (item.name.indexOf('StatTrak™') > -1) {
		return {
			background_color: 'rgb(207, 106, 50)',
			color: '#ffffff'
		};
	} else if (item.name.indexOf('★ StatTrak™') > -1) {
		return {
			background_color: 'rgb(246, 228, 70)',
			color: '#ffffff'
		};
	} else if (item.name.indexOf('★') > -1) {
		return {
			background_color: 'rgb(246, 228, 70)',
			color: '#000000'
		};
	} else if (typeof item.type == 'undefined') {
		return {
			background_color: 'rgb(255,255,255)',
			color: '#000000'
		};
	} else if (item.type.indexOf('Consumer') > -1) {
		return {
			background_color: 'rgb(255,255,255)',
			color: '#000000'
		};
	} else if (item.type.indexOf('Industrial') > -1) {
		return {
			background_color: 'rgb(100,150,225)',
			color: '#ffffff'
		};
	}  else if (item.type.indexOf('Mil-Spec') > -1) {
		return {
			background_color: 'rgb(58,91,255)',
			color: '#ffffff'
		};
	} else if (item.type.indexOf('Restricted') > -1) {
		return {
			background_color: 'rgb(135, 73, 255)',
			color: '#ffffff'
		};
	}  else if (item.type.indexOf('Classified') > -1) {
		return {
			background_color: 'rgb(212, 45, 186)',
			color: '#ffffff'
		};
	}  else if (item.type.indexOf('Covert') > -1) {
		return {
			background_color: 'rgb(227, 65, 50)',
			color: '#ffffff'
		};
	} else if (item.type.indexOf('Contraband') > -1) {
		return {
			background_color: 'rgb(136,106,8)',
			color: '#ffffff'
		};
	}
	return {
		background_color: 'rgb(191,191,191)',
		color: '#ffffff'
	};
};

var sortDesc = function(a, b){
	if (a.cost > b.cost) return -1;
	if (a.cost < b.cost) return 1;
	return 0;
};

var getRandomInt = function(min, max) { 
	return (Math.random() * max).toFixed(2)*1;
};

var compare = function(a,b) {
	if (a.chance < b.chance) {
		return 1;
	}

	if (a.chance > b.chance) {
		return -1;
	}

	return 0;
};

var getToday = function() {
	var now = new Date();
	
	// создать объект из cегодняшней даты, без часов-минут-секунд
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	return today;
};

var logTime = function() {
	var date = new Date();

	var formatted = '[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + ']';

	return formatted;
};

var log = function(msg, row, content) {
	var preparedMsg = logTime() + ' Message: "' + msg + '" at row:' + row + ', Content: ';
	console.log(preparedMsg, content);
};

var msg = function(msg) {
	var preparedMsg = logTime() + ' Message: "' + msg + '"';
	console.log(preparedMsg);
};

var helper = {
	getColor 	 : getColor,
	getRandomInt : getRandomInt,
	compare 	 : compare,
	sortDesc     : sortDesc,
	getToday	 : getToday,
	logTime		 : logTime,
	log 		 : log,
	msg 		 : msg
};

module.exports = helper;