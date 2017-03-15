var config = require('./steambot.config.js');
var helper = require('./helper.js');
var fs = require('fs');
var crypto = require('crypto');
var request = require("request");

var curs = config.curs;

if(fs.existsSync('items.txt')) {
	var items = fs.readFileSync('items.txt');
	items = JSON.parse(items);
	var td = Math.round(new Date().getTime()/1000.0)-items.response.current_time;
	if(td > 86400) {
		request('http://backpack.tf/api/IGetMarketPrices/v1/?key='+config.backey+'&compress=1&appid='+config.gameType+'', function(error, response, body) {
			fs.writeFileSync('items.txt', body);
			items = JSON.parse(body);
			if(items.response.success == 0) throw "Cant load items price";
		});	
	}
} else {
			request('http://backpack.tf/api/IGetMarketPrices/v1/?key='+config.backey+'&compress=1&appid='+config.gameType+'', function(error, response, body) {
		fs.writeFileSync('items.txt', body);
		items = JSON.parse(body);
		if(items.response.success == 0) throw "Cant load items price";
	});
}

function getItemPrice(itemname) {
	if(typeof items['response']['items'][itemname] == 'undefined') return 0;
	return parseFloat(items['response']['items'][itemname]['value']);
}
if (typeof config.ssfn != 'undefined' && config.ssfn != '' && fs.existsSync(__dirname+'/'+config.ssfn)) {
	helper.msg('Using ssfn file');
	var sha = require('crypto').createHash('sha1');
	sha.update(fs.readFileSync(__dirname+'/'+config.ssfn));
	sha = new Buffer(sha.digest(), 'binary');
	config.logOnOptions['shaSentryfile'] = sha;
} else if (fs.existsSync(__dirname+'/sentry')) {
	helper.msg('Using sentry file');
	config.logOnOptions['shaSentryfile'] = fs.readFileSync(__dirname+'/sentry');
} else if (config.authCode != '') {
	helper.msg('Using auth code');
	config.logOnOptions['authCode'] = config.authCode;
} else {
	helper.msg('Without any additional params');
}
var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');
var io = require('socket.io').listen(config.port || 8304);
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var xss = require('xss');
var userListDB, gcDB, gameDB, authDB;
var currentGame = 0;
var acceptedTradeOffers = []; // just for testing reasons
var currentGameOffers = [];
var players = [];
var currentGameItems = [];
var playersCounter = 0;
var winnerid = 0;
var winningitem = []
var roundnum = Math.random();
var roundhash = crypto.createHash('md5').update(roundnum.toString()).digest('hex');

var timer = 0;
var timerID;
var g_Totalcost = 0;
var g_ItemName = [];
var g_Pause = false;
var g_Peers = [];
var g_Mongoconnected = false;
var g_LastWinner = 0;
var playersUnique = {},
	playersUniqueOrder = [],
	itemsCounters = {};
var g_MinDeposite = config.minDeposite; // минимальная ставка в рублях
var g_BigGamePre = false;
var g_BigGame = true;
var g_BigGameTimer = 0;
var currentSessionId = '';
var Q = require('q');
Array.prototype.exterminate = function (value) {
	this.splice(this.indexOf(value), 1);
}
function Wipe(winner, data) {
helper.msg('Wipe function started');
var lastGC = currentGame;
var mMoney = Math.round(g_Totalcost * 100) / 100;
var lastItems = [];
if (g_ItemName.length !== currentGameItems.length) {
currentGameItems.forEach(function(item,i) {
var pos = g_ItemName.indexOf(item.itemname);
if (pos > -1) {
g_ItemName.splice(pos,1);
lastItems.push(item);		
return;
}
});
}
if (lastItems.length == 0) {
lastItems = currentGameItems;
}
//Отправляем строку NAME выиграл приз размером MONEY
helper.msg('Prepared items to history');
// send
if (typeof data !== 'undefined') {
		helper.msg('Starting to send all "end-game"');

		io.emit('end-game', {
			name: data.response.players[0].personaname,
			money: mMoney,
			ava: data.response.players[0].avatarfull,
			chance: playersUnique[winner].chance,
			roundnum: roundnum,
			item: winningitem
		});
		
		g_LastWinner = {
			name: data.response.players[0].personaname,
			money: mMoney,
			ava: data.response.players[0].avatarfull
		};
		if (g_BigGame) {
			var gameType = 'big';
			g_BigGame = false;
			updateLastBigGame();
		} else {
			var gameType = 'simple';
		}
		helper.msg('Starting updating history');
		try {
			updateGameHistory(lastGC, lastItems, data.response.players[0].avatarfull, data.response.players[0].personaname, mMoney, playersUnique[winner].chance, lastItems, winner, gameType);
		} catch (err) {
			helper.log('Error writing history to db', 122, err);
		}
	} else {
		helper.msg('Starting to send all "end-game-empty"');

		io.emit('end-game-empty');
	}

	// Обновляем записи в БД
	helper.msg('Trying to update total win counter');
	updateTotalWin(g_Totalcost);
	helper.msg('Trying to update max win counter');
	updateMaxWin(g_Totalcost);
	helper.msg('Trying to update today max win counter');
	updateTodayMaxWin(g_Totalcost);

	currentGame++;
	helper.msg('Trying to update game counter');
	updateGameCounter(); // Обновляем счетчик игр в БД
	
	players = [];
	currentGameItems = [];
	playersCounter = 0;
	playersUnique = {};
	playersUniqueOrder = [];
	winnerid = 0;
	currentGameOffers = [];

	timer = 0;

	g_Totalcost = 0;
	g_ItemName = [];
	itemsCounters = {};

	helper.msg('All globals cleared, next is setTimeout 20');
	
	setTimeout(function(){
		// Обновляем запись на сайте (Станет: Текущая игра: gamecounter. Банк: 0)
		helper.msg('Send all game number, jackpot 0');
roundnum = Math.random();
		roundhash = crypto.createHash('md5').update(roundnum.toString()).digest('hex');
		
		io.emit('2', {
			gamenumber: currentGame, 
			jackpot: 0,
			hash: roundhash
		})

		// Send info about game
		helper.msg('Starting to send informers for each socket');

		sendInformersToAll(); // @TODO!!!

		helper.msg('Send all "start-game"');
		getLastBigGame(function(time) {
			if (time) {
				var date = new Date();
				var diff = (date.getTime() - time)/1000;
				var timetosend = config.bigGameDelay - diff;
				if (timetosend <= config.gameDuration && timetosend > 0) {
					io.emit('start-game', {type : 'simple', totalCount : config.simpleGameItemsCount});
					io.emit('big-game-check', {status: 'next-game', time: timetosend, totalCount : config.simpleGameItemsCount});
				} else if (timetosend <= 0) {
					io.emit('start-game', {type : 'big', totalCount : config.bigGameItemsCount});
					io.emit('big-game-check', {status: 'in-progress', time: 0, totalCount : config.bigGameItemsCount});
					g_BigGame = true;
				} else {
					io.emit('start-game', {type : 'simple', totalCount : config.simpleGameItemsCount});
					//updateLastBigGame();
					//var timetosend = config.bigGameDelay;
					io.emit('big-game-check', {status: 'not-started', time: timetosend, totalCount : config.simpleGameItemsCount});
				}
			} else {
				io.emit('start-game', {type : 'simple'});
				updateLastBigGame();
				var timetosend = config.bigGameDelay;
				io.emit('big-game-check', {status: 'not-started', time: timetosend, totalCount : config.simpleGameItemsCount});
			}
		});

		g_Pause = false;
		gameDB.find({name: 'history', type: config.gameTypeName}).limit(20).sort({game : -1}).toArray(function(err, list){
			if (err) {
				helper.log('Error loading history from DB: ', 253, err);
			} else {
				var history = {},
					historyOrder = [];
				if (typeof config.commissionHistory !== 'undefined' && config.commissionHistory == 0) {
					var showWithCommission = 0;
				} else {
					var showWithCommission = 1;
				}
				for(var i = 0; i <= list.length-1; i++) {
					history['game' + list[i].game] = list[i];
					historyOrder.push('game' + list[i].game);
				}
				io.emit('history', {
					history: history,
					commission: showWithCommission,
					historyOrder : historyOrder
				});
			}
		});
		getTop(io, config.gameTypeName);

	}, 20000);

	
	helper.msg('wiped');
}

function sendCurrency(socket) {
	
	if (typeof config.currency == 'undefined' || config.currency == 0) {
		var value = 'usd';
	} else {
		var value = 'rur';
	}

	socket.emit('currency', value);
}

io.sockets.on('connection', function (socket){
	// add to clients list
	g_Peers.push(socket);
	//updateLastBigGame(); just for test
	// set up currency
	sendCurrency(socket);

	// sending current timer for big game
	if (!g_BigGame) {
		getLastBigGame(function(time) {
			if (time) {
				var date = new Date();
				var diff = (date.getTime() - time)/1000;
				var timetosend = config.bigGameDelay - diff;
				if (timetosend <= config.gameDuration) {
					io.emit('big-game-check', {status: 'next-game', time: timetosend, type: config.gameType, totalCount : config.simpleGameItemsCount});
				} else {
					io.emit('big-game-check', {status: 'not-started', time: timetosend, totalCount : config.simpleGameItemsCount});
				}
			} else {
				updateLastBigGame();
				var timetosend = config.bigGameDelay;
				io.emit('big-game-check', {status: 'not-started', time: timetosend, totalCount : config.simpleGameItemsCount});
			}
		});
	} else {
		io.emit('big-game-check', {status: 'in-progress', time: 0, totalCount : config.bigGameItemsCount});
	}
	
	// emit informers to ALL
	io.emit('informers', { inf1 : g_Peers.length });
	
	socket.on('disconnect', function(socket){
		// delete from clients list
		g_Peers.exterminate(socket);

		// update count
		io.emit('informers', { inf1 : g_Peers.length });
	});
	// resend all items to new client
	socket.on('0', function(data){
		currentGameItems.forEach(function(I){
			socket.emit('0', I);
		});

		// Посылаем номер игры и банк
		socket.emit('2', {
			gamenumber: currentGame,
			jackpot: Math.round(g_Totalcost),
			hash: roundhash
		});
		
		// ниже
		sendInformers(socket);
		
		// send current unique players
		socket.emit('playersUnique', { 
			list : playersUnique,
			order : playersUniqueOrder
		})
	});
	
	
	

	
		
		
		

	// set trade-link
	socket.on('1', function(data){
		if(data.steamId.length > 20) {
			authDB.find({token: data.steamId}).toArray(function (error, list) {
				if(list.length > 0) { 
					data.steamId = list[0].userid;
					console.log(data);
					updateTradeLink(data.steamId, data.link);
				}
			});
		}
	});

	// history
	socket.on('2', function(data){
		gameDB.find({name: 'history', type: config.gameTypeName}).limit(20).sort({game : -1}).toArray(function(err, list){
			if (err) {
				helper.log('Error loading history from DB: ', 253, err);
			} else {
				var history = {},
					historyOrder = [];
				if (typeof config.commissionHistory !== 'undefined' && config.commissionHistory == 0) {
					var showWithCommission = 0;
				} else {
					var showWithCommission = 1;
				}
				for(var i = 0; i <= list.length-1; i++) {
					history['game' + list[i].game] = list[i];
					historyOrder.push('game' + list[i].game);
				}
				
				socket.emit('history', {
					history: history,
					commission: showWithCommission,
					historyOrder : historyOrder
				});
			}
		});
	});

	// top
	socket.on('top', function(data){
		getTop(socket, config.gameTypeName);
	});

	// get trade-link
	socket.on('trade-link', function(data){
		if(data.steamId.length > 20) {
			authDB.find({token: data.steamId}).toArray(function (error, list) {
				if(list.length > 0) { 
					data.steamId = list[0].userid;
					userListDB.find({'steamid':data.steamId, 'type' : 'trade-link'}).toArray(function(err, list) { 
						socket.emit('trade-link', { list : list });
					});
				}
			});
		}
	});

	// players
	socket.on('players', function(data){
		getPlayers(socket);
	});

	// items
	socket.on('items', function(data){
		getItems(socket);
	});

socket.on('load-inventory', function(data){
		if(data.steamid.length > 10) {
			authDB.find({token: data.steamid}).toArray(function (error, list) {
				if(list.length > 0) { 
					data.steamid = list[0].userid;
					loadMyInventoryToFront(socket, data.steamid);
				}
			});
		}
	});

	// profile
	socket.on('profile', function(data){
		if(data.steamid.length > 10) {
			authDB.find({token: data.steamid}).toArray(function (error, list) {
				if(list.length > 0) { 
					data.steamid = list[0].userid;
					getProfileStats(socket, data.steamid);
				}
			});
		}
	});
});

function sendInformers(socket) {
	getInformersData(function(error, informers){
		if (error) {
			helper.log('Error send Informers', 5, error);
			return;
		}

		// send informers
		if (informers.length > 0) {
			informers.forEach(function(inf){
				socket.emit(inf.type, inf);
			});
		}
	});

	// SEND TODAY
	sendTodayCounter(socket, 'player', 'inf3');
	sendTodayCounter(socket, 'history', 'inf7');
	sendTodayCounter(socket, 'items', 'inf8');
	sendTodayCounter(socket, 'MRTODAY', 'inf10');
	sendTodayCounter(socket, 'today-win', 'inf11');
}

function sendInformersToAll(){
	getInformersData(function(error, informers){
		// send informers
		if (informers.length > 0) {
			informers.forEach(function(inf){
				io.emit(inf.type, inf);
			});
		}
	});

	// SEND TODAY
	sendTodayCounter('ALL', 'player', 'inf3');
	sendTodayCounter('ALL', 'history', 'inf7');
	sendTodayCounter('ALL', 'items', 'inf8');
	sendTodayCounter('ALL', 'MRTODAY', 'inf10');
	sendTodayCounter('ALL', 'today-win', 'inf11');
}

function getInformersData(callback) {
	var promises = [];

	// total players
	var totalPlayersDefer = Q.defer();
	try {
		// Достаем из БД кол-во уникальных игроков
		gameDB.find({name: 'player'}).toArray(function(error, list2) {
			// error
			if (error) {
				return totalPlayersDefer.reject(error);
			}

			totalPlayersDefer.resolve({ 
				type: 'informers', 
				inf9: list2.length
			});
		});

	} catch (error) {
		helper.log('Mongodb error', 320, error);
		totalPlayersDefer.reject(error);
	}
	promises.push(totalPlayersDefer.promise);

	// max jackpot
	var maxJackpotDefer = Q.defer();
	try {
		gameDB.find({name: 'MR'}).toArray(function(error, list) {
			// error
			if (error) {
				return maxJackpotDefer.reject(error);
			}

			// get data
			var mr = 0;
			if (list.length > 0) {
				mr = list[0].MR;
			}
			
			maxJackpotDefer.resolve({ 
				type: 'informers',
				inf4: mr
			});
		});

	} catch (error) {
		helper.log('Mongodb error', 320, error);
		maxJackpotDefer.reject(error);
	}
	promises.push(maxJackpotDefer.promise);	

	// last winner
	var lastWinnerDefer = Q.defer();
	try {
		gameDB.find({ name : 'history' }).sort({ game : -1 }).limit(1).toArray(function(error, list){
			// error
			if (error) {
				return lastWinnerDefer.reject(error);
			}

			// get data
			
			var win_steam_id = 0;
			if (list[0] !== undefined) {
				g_LastWinner = {
					name: list[0].winnername,
					money: list[0].winnermoney,
					ava: list[0].winnerimg,
					chance: list[0].winnerchance
				};
				
			 for(var i in list[0].allItems){
     if(list[0].allItems[i].user == g_LastWinner.name){
      win_steam_id = list[0].allItems[i].steamid;
      break;
     }
    }
   }
			
			
			   io.emit('wints', {steamid: win_steam_id});  
			
			lastWinnerDefer.resolve({
				type: 'last-winner',
				name: g_LastWinner.name, 
				ava: g_LastWinner.ava, 
				money: g_LastWinner.money,
				chance: g_LastWinner.chance,
    steamid : win_steam_id
			});
		});

	} catch (error) {
		helper.log('Mongodb error', 320, error);
		lastWinnerDefer.reject(error);
	}
	promises.push(lastWinnerDefer.promise);

	var totalPlayersCount = Q.defer();
	try {
		userListDB.find({ name : 'player' }).count(function(err, count) {
			// error
			if (err) {
				return totalPlayersCount.reject(err);
			}

			totalPlayersCount.resolve({
				type: 'all-players-count',
				count: count
			});
		});
	} catch(error) {
		helper.log('Mongodb error', 320, error);
		totalPlayersCount.reject(error);
	}

	promises.push(totalPlayersCount.promise);

	Q.all(promises).spread(function(obj1, obj2, obj3, obj4) {
		var counters = [
			{ type: 'informers', inf5: config.minDeposite },
			{ type: 'informers', inf6: config.usersItemsLimit }
		];

		Array.prototype.slice.call(arguments).forEach(function(arg) {
			counters.push(arg);
		});

		callback(false, counters);

	}, function(error) {
		callback(error);
	});
}

function getTop(socket, type) {
	gameDB.aggregate(
		[ 
			{"$match":{"name":"history", "type":type}}, 
		    {"$group":{"_id":{"steamid":"$steamid"}, "total":{"$sum":"$winnermoney"}, "count":{"$sum":1}, "winnername":{"$last" : "$winnername"}, "winnerimg":{"$last" : "$winnerimg"}}},
		    { "$sort" : { total : -1 } },
		    {"$limit" : config.toplimit} 
		]
	).toArray(function(err, list) { 
	if (!err && list.length > 0) {
			var promises = [];
			var j = 1;
			var k = 0;
			list.forEach(function(l, i) {
				if (k == 3) {
					j++;
				}
				list[i].rank = j;
				var deferred = Q.defer();
				promises.push(deferred.promise);

				userListDB.find({steamid:l._id.steamid, name:'player'}).toArray(function(err, player) {
					if (!err && typeof player[0].count !== "undefined") {
						list[i].attempts = player[0].count;
					} else {
						list[i].attempts = 0;
					}

					deferred.resolve();					
				});
				k++;
			});

			Q.all(promises).spread(
				function() {
					socket.emit('top', { list : list });
				},
				function(error) {
					helper.log('Some Q error', 611);
				}
			);

		}
		
	});
};

MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) { // Подключаемся к БД
	if (err) {
		helper.log('Mongodb connection error', 425, err); 
		return 0;
	}

	// записываем ссылки на таблицы (коллекции) в глобальные переменные
	userListDB = db.collection('users');
	gameDB = db.collection('gamedb');
		authDB = db.collection('auth');
	g_Mongoconnected = true;
	helper.msg('mongo connected');
	
	gameDB.find({name: 'counter'}).toArray(function (error, list) { // Достаем значение текущей игры
		if(list.length == 0) {  // Если его нет, записываем в БД 0
			currentGame=0; 
			gameDB.insert({name: 'counter', counter: 0}, {w:1}, function(err) {if(err) console.log('Error <1>');});
		} else {
			currentGame = list[0].counter;
		}
	});
});

// Ниже - функции обновления данных в БД

function existUser (user, callback) {
	if(!g_Mongoconnected)
		return 0;

	userListDB.find({steamid: user}).toArray(function (error, list) {
		callback (list.length !== 0);
	});
}

function updateTotalPlayers(sid){
	if(!g_Mongoconnected) {
		return 0;
	}
	// update current field
	var date = new Date();
	gameDB.update({	
		steamid: sid, 
		name: 'player'
	}, {
		steamid: sid, 
		name: 'player',
		date: date.getTime()
	}, {
		upsert: true
	});
		// }
	// });
}

function updateTradeLink(sid, link) {
	if(!g_Mongoconnected)
		return 0;
		
	existUser(sid, function(exist){
		if(exist) {
			userListDB.update({steamid: sid}, {steamid: sid, tradelink: link, type : 'trade-link'});
		} else {
			userListDB.insert({steamid: sid, tradelink: link, type : 'trade-link'}, {w:1}, function(err) {
				if(err) {
					helper.log('Error inserting tradelink', 485, err);
				}
			});
		}
	});
}

function updateTotalWin(money) {
	if(!g_Mongoconnected)
		return 0;
		
	gameDB.find({name: 'TR'}).toArray(function(error, list){
		if(list.length === 0) // нет записи о выигрыше
			gameDB.insert({name: 'TR', TR: money}, {w: 1}, function(err) {
				if(err) {
					helper.log('Error inserting total win (1)', 499, err);
				} else {
					helper.msg('Successfully updated TotalWin');
				}
			});
		else {
			var tr = list[0].TR;
			tr += money;
			gameDB.update({name: 'TR'}, {name: 'TR', TR: tr}, function(err) {
				if(err) {
					helper.log('Error inserting total win (2)', 507, err);
				} else {
					helper.msg('Successfully updated TotalWin');
				}
			});
		}
	});
}

function updateMaxWin(money) {
	if(!g_Mongoconnected) {
		return 0;
	}
		
	gameDB.find({name: 'MR'}).toArray(function(error, list){
		if(list.length === 0) // нет записи о выигрыше
			gameDB.insert({name: 'MR', MR: money}, {w: 1}, function(err) {
				if(err) {
					helper.log('Error inserting max win (1)', 523, err);
				} else {
					helper.msg('Successfully updated max win');
				}
			});
		else {
			var tr = list[0].MR;
			if(money > tr || !tr)
				tr = money;
			gameDB.update({name: 'MR'}, {name: 'MR', MR: tr}, function(err) {
				if(err) {
					helper.log('Error inserting max win (2)', 532, err);
				} else {
					helper.msg('Successfully updated max win');
				}
			});
		}
	});
}

function updateTodayMaxWin(money) {
	if(!g_Mongoconnected) {
		return 0;
	}
	var date = new Date();
	gameDB.find({name: 'MRTODAY'}).toArray(function(error, list){
		if(list.length === 0) // нет записи о выигрыше
			gameDB.insert({name: 'MRTODAY', MR: money, date: date.getTime()}, {w: 1}, function(err) {
				if(err) {
					helper.log('Error inserting max win today(1)', 500, err);
				}
			});
		else {
			var tr = list[0].MR;
			var today = helper.getToday().getTime();
			
			if (list[0].date - today >= 86400000) {
				gameDB.update({name: 'MRTODAY'}, {name: 'MRTODAY', MR: money, date: date.getTime()}, function(err) {
					if(err) {
						helper.log('Error inserting max win (2)', 558, err);
					} else {
						helper.msg('Successfully updated today max win');
					}

				});
			} else {
				if(parseFloat(money) > parseFloat(tr)) {
					tr = money;
				}
				gameDB.update({name: 'MRTODAY'}, {name: 'MRTODAY', MR: tr, date: date.getTime()}, function(err) {
					if(err) {
						helper.log('Error inserting max win (2)', 567, err);
					} else {
						helper.msg('Successfully updated today max win');
					}
				});
			}
			
		}
	});

}

function updateGameCounter(){
	if(!g_Mongoconnected)
		return 0;
		
	gameDB.update({name: 'counter'}, {name: 'counter', counter: currentGame}, function(err) {
		if(err) {
			helper.log('Error updating game counter', 583, err);
		} else {
			helper.msg('Successfully updated game counter');
		}
	});
}

function getPlayers(socket) {
	socket.emit('players', { list : players });
};

function getItems(socket) {
	socket.emit('items', { list : currentGameItems });
};

function updateGameHistory(gamecounter, i, img, name, money, chance, allItems, winner, gameType){
	if(!g_Mongoconnected)
		return 0;
	var date = new Date();
	gameDB.insert({
		name: 'history',
		game: gamecounter,
		items: i,
		winnerimg: img,
		winnername: name,
		winnermoney: money,
		winnerchance: chance.toFixed(2),
		date: date.getTime(),
		allItems: allItems,
		steamid: winner,
		hash: roundhash,
		roundnum: roundnum,
		type: config.gameTypeName,
		gameType: gameType
	}, {w: 1}, function(err) {
		if(err) {
			helper.log("Error updating game history", 624, err);
		} else {
			helper.msg("Successfully updated history table");
		}
	});
}

var steam = new Steam.SteamClient();
var offers = new SteamTradeOffers();

steam.logOn(config.logOnOptions);

steam.on('debug', console.log);
offers.on('debug', console.log);

steam.on('loggedOn', function(result) {
helper.msg('Logged in!');
steam.setPersonaState(Steam.EPersonaState.Online);
});

steam.on('webSessionID', function(sessionID) {
	helper.msg('webSessionID ok');
	currentSessionId = sessionID;
	reWebLogOn(steam);
});


function reWebLogOn(steam, callback) {
	steam.webLogOn(function(newCookie){
		helper.msg('webLogOn ok');

		offers.setup({
			sessionID: currentSessionId,
			webCookie: newCookie 
		}, function(){
			if (typeof callback == "function") {
				callback();
			}
		});
	});  
}

steam.on('sentry', function(data) {
	require('fs').writeFileSync(sentryFile, data);
});

// Если пришел новый трейд
steam.on('tradeOffers', function(number) {
	if (g_Pause) {
		return;
	}
	var retryCnt = 1;

	if (number > 0) {
		helper.msg('New offers: '+number);
  
		function getOffers() {
			offers.getOffers({
				get_received_offers: 1,
				active_only: 1/*,
				time_historical_cutoff: Math.round(Date.now() / 1000)*/
			}, onGetOffers);
		}

		function onGetOffers(error, body) {
			if (error) {
				if (retryCnt >= 0) {
					getOffers();
					retryCnt--;
				}

				helper.log('Error getting offers', 692, error);
			}

			// Проверки на наличие трейда
			if(body) {
				if (body.response.trade_offers_received){

					body.response.trade_offers_received.forEach(function(offer) {
						//if offer is already accepted
						if (acceptedTradeOffers.indexOf(offer.tradeofferid) >= 0) {
							currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
							return;
						}

						// active
					  	if (offer.trade_offer_state == 2){
					  		helper.log('Current game offers', 716, currentGameOffers);
							currentGameOffers.push(offer.tradeofferid);
					  		userListDB.find({'steamid':offer.steamid_other}).toArray(function(err, list) {
                            	if (error) {
									io.emit('notradelink', {steamid: offer.steamid_other})
		                            helper.msg('Declined - no tradelink, offer #' + offer.tradeofferid);
		                            offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
		                            	currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
		                            });
	                            } else if (list.length == 0) {
		                            offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
										io.emit('notradelink', {steamid: offer.steamid_other})
		                            	helper.msg('Declined - no tradelink, offer #' + offer.tradeofferid);
		                            	currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
		                            });
	                            } else {

									// Бот не принимает предметы, пока разыгрывает предыдущие
									if (g_Pause){
										helper.msg('Offer declined because of pause');
										offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
											currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
										}); 
										//steam.sendMessage(offer.steamid_other, 'Sorry. Bot is on pause :C', Steam.EChatEntryType.ChatMsg);
								
									// Если нас пытаются обмануть, отклоняем трейд
									} else if(offer.items_to_give) {
										if (offer.steamid_other != config.admin) {
											helper.msg('Offer declined (2)');

		                            		offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
		                            			currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
		                            		}); 
										 } else {
											currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
											offers.acceptOffer({tradeOfferId: offer.tradeofferid}); 
										 	helper.msg('accepted trade offer from admin: '+offer.tradeofferid);
											return;
										 }
										//steam.sendMessage(offer.steamid_other, 'You cannot take my items', Steam.EChatEntryType.ChatMsg);
								
									// Если нам не передают предметы, отклоняем трейд
									} else if(!offer.items_to_receive) {
										offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
											currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
										}); 
										helper.msg('Offer declined <empty items to receive>');
										//steam.sendMessage(offer.steamid_other, 'Empty trade offer', Steam.EChatEntryType.ChatMsg);
									
									// all right
									} else {
										if (g_Pause) {
											helper.msg('Offer declined because of pause');
											offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
												currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
											}); 
										}
										var itemIds = [];
										
										// Записываем ИД предметов в массив
										// Проверяем, что это именно КС:ГО предметы (appid cs:go = config.gameType)
										for(var i = 0; i < 100; i++) {
											if (!offer.items_to_receive[i]) {
												continue; 
											}
										
											tempItem = offer.items_to_receive[i];
											// console.log('Receive item ID: ' + offer.items_to_receive[i].assetid +' class id: '+ offer.items_to_receive[i].classid);
											
											if (offer.items_to_receive[i].appid != config.gameType){
												helper.msg('not a CSGO item');
												offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
													currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
												}); 
												//steam.sendMessage(offer.steamid_other, 'You can place only CS:GO items', Steam.EChatEntryType.ChatMsg);
												break;
											}

											itemIds.push(tempItem.assetid);
										}		
										
										// check if item count is lower than limit in config
										if (typeof itemsCounters[offer.steamid_other] == 'undefined') {
											itemsCounters[offer.steamid_other] = 0;
										}

										if (itemsCounters[offer.steamid_other] + offer.items_to_receive.length > config.usersItemsLimit) {
											io.emit('maxitem', {steamid: offer.steamid_other})
											offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
												currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
											});
											helper.msg('Declined: one user items limit exceeded.');
											return; 
										}
										helper.msg('Sending api request...');
										//Запрашиваем данные о пользователе, чтобы достать ник и аватар
										var req_retry = 5;
										var GetPlayerSummaries = function() {
											var _req = http.request({
												host: 'api.steampowered.com',
												path: '/ISteamUser/GetPlayerSummaries/v0002/?key='+config.apiKey+'&steamids='+offer.steamid_other
											}, function(response) {
												var str = '';
												
												response.on('data', function (chunk) {
													str += chunk;
												});
												
												response.on('end', function() {
													helper.msg('Received api request!');
												
													var data = JSON.parse(str),
														retries = 10;
												
													var loadPartnerInventory = function() {
														retries--;

														// Загружаем инвентарь партнера
														// Сравниваем ИД предметов в его инвентаре и ИД посланных предметов 
														// Чтобы найти имя предметов и записать в массив
														offers.loadPartnerInventory({partnerSteamId: offer.steamid_other, appId: config.gameType, contextId: 2}, function(err, items) {
															if(err != null) { 
																helper.msg('Error loading inventory '+offer.steamid_other);
																if (err.message.indexOf('401') > -1 && retries >= 0) {
																	reWebLogOn(steam, function() {
																		helper.msg(err.message + ': Retry ' + offer.tradeofferid + ', step: ' + retries);
																		loadPartnerInventory();
																	});
																} else {
																	helper.msg(err.message + ': Retry ' + offer.tradeofferid + ', step: ' + retries);
																	
																	if (retries == 0) {
																		helper.msg('Offer ' + offer.tradeofferid + ' declined.');
																		offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																			currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																		}); 
																	} else {
																		loadPartnerInventory();
																	}
																}
															} else {
																// Принимаем трейд
																helper.msg('Next function is acceptOffer! - ' + offer.steamid_other + ' - ' + offer.tradeofferid);
																if (g_Pause) {
																	offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																		currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																	}); 
																	return;
																}
																var checkItems = [];
																var len = items.length;
																for(var i = 0; i < itemIds.length; i++) {
																	for(var j = 0; j < items.length; j++) {
																		if (itemIds[i] == items[j].id){
																			//console.log('Pushed: ' + items[j].name);
																		
																			var colorObj = helper.getColor(items[j]);
																			checkItems.push({
		
																				user: data.response.players[0].personaname,
																				ava: data.response.players[0].avatarfull,
																				itemname: items[j].market_name,
																				image: items[j].icon_url,
																				color: colorObj.color,
																				background_color: colorObj.background_color,
																				market_hash_name: items[j].market_hash_name,
																				steamid: offer.steamid_other,
																				tradeofferid : offer.tradeofferid
																			}
																				
																			
																			
																			);
																				

																		}
																	}
																}

																if (g_BigGame) {
																	var checkCount = config.bigGameItemsCount;
																} else {
																	var checkCount = config.simpleGameItemsCount;
																}

																if (currentGameItems.length + checkItems.length > checkCount) {
																	offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																		currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																	});
																}
																

																checkMinDeposite(checkItems, offer.tradeofferid)
																	.then(function(response) {
																		if (g_Pause) {
																			offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																				currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																			}); 
																			return;
																		}
																		response.summ = parseFloat(response.summ);
																		if (typeof config.minDeposite !== 'undefined') {
																			var check = parseFloat(config.minDeposite);
																			if (response.summ > check) {
																				io.emit('acceptoffer', {steamid: offer.steamid_other})
																				helper.msg('Принимаем трейд id - ' + offer.steamid_other);
																				helper.msg('Greater than min deposite - ' + offer.tradeofferid);
																				try {
																					offers.acceptOffer({tradeOfferId: offer.tradeofferid}, function(err, log) {
																						if (err) { 
																							helper.log('Error accepting trade offer ' + offer.tradeofferid, 891, err);
																							offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																								currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																							}); 	
																							return;
																						}
																			
																						itemsCounters[offer.steamid_other] += offer.items_to_receive.length;
																						// Обновляем счетчик уникальных игроков в БД
																						updateTotalPlayers(offer.steamid_other); 
																						var itemsWithPrices = response.items;
																						itemsWithPrices.forEach(function(itemWithPrice, index) {
																							g_ItemName.push(itemWithPrice.market_hash_name);
																							// players array
																							players.push({
																								steamid: itemWithPrice.steamid,
																								min: g_Totalcost,
																								max: g_Totalcost+itemWithPrice.price,
																								nick: itemWithPrice.user,
																								ava: itemWithPrice.ava,
																								item: itemWithPrice.itemname,
																								color: itemWithPrice.background_color,
																								image: itemWithPrice.image
																							});
																							// Банк. Сумма цен всех предметов
																							g_Totalcost += itemWithPrice.price;
																							// Рассчитываем шанс победы для игрока
																							var winchance = 0;
																							var sumdep = 0;
																							var summoney = 0;
																							players.forEach(function(I){
																								if (I.steamid == itemWithPrice.steamid) {
																									sumdep++;
																									var diff = I.max-I.min;
																									summoney += diff;
																								}
																							});
																							// winchance for CURRENT item
																							if (g_Totalcost !== 0 ) {
																								winchance = summoney / g_Totalcost*100;
																							}
																							// Параметры для отправки на сайт
																							var op = {
																								type: 0,
																								user: xss(itemWithPrice.user),
																								ava: itemWithPrice.ava,
																								itemname: itemWithPrice.itemname,
																								image: itemWithPrice.image,
																								color: itemWithPrice.color,
																								background_color: itemWithPrice.background_color,
																								cost: itemWithPrice.price,
																								steamid: itemWithPrice.steamid,
																								itemcounter: sumdep,
																								chance: winchance,
																								money: summoney,
																								jackpot: g_Totalcost,
																								offerid: offer.tradeofferid,
																								sitename: config.sitename
																							};
																							// Массив с предметами текущей игры
																							currentGameItems.push(op);
																							
																							// Посылаем на сайт новый предмет
																							io.emit('0', op);
																							
																							// Посылаем обновление текста (Игра номер ... Банк ...)
																							io.emit('2', {
																								gamenumber: currentGame, 
																								jackpot: Math.round(g_Totalcost * 100) / 100,
																									hash: roundhash
																							});

																							// Считаем уникальных игроков
																							playersUnique = {};
																							currentGameItems.forEach(function(item, index){
																								if (playersUnique[item.steamid] === undefined) {
																									playersUnique[item.steamid] = {
																										'user' : item.user,
																										'ava' : item.ava,
																										'money' : item.money,
																										'steamid' : item.steamid
																									};

																									if (g_Totalcost > 0) {
																										playersUnique[item.steamid].chance = item.money / g_Totalcost*100;
																									} else {
																										playersUnique[item.steamid].chance = 0;
																									}

																								} else {
																									if (playersUnique[item.steamid].money < item.money) {
																										playersUnique[item.steamid].money = item.money;

																										if (g_Totalcost > 0) {
																											playersUnique[item.steamid].chance = item.money / g_Totalcost*100;
																										} else {
																											playersUnique[item.steamid].chance = 0;
																										}
																									}
																								}
																							});

																							// order players
																							playersUniqueOrder = [];
																							for (var playerIndex in playersUnique) {
																								playersUniqueOrder.push({ steamid : playersUnique[playerIndex].steamid, chance : playersUnique[playerIndex].chance });
																							}

																							playersUniqueOrder.sort(helper.compare);

																							// ... and send to frontend
																							io.emit('playersUnique', {
																								list : playersUnique,
																								order : playersUniqueOrder
																							});
																						});

																						playersCounter++;

																						acceptedTradeOffers.push(offer.tradeofferid);
																						currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																						if (currentGameItems.length === checkCount) {
																							randomWin(players);
																							return;
																						}
																						// Ставим таймер при достижении нужного количества игроков
																						if(playersCounter >= config.usersToStart && timer == 0) {
																							if (g_Pause) {
																								helper.msg('Timer but on pause');
																								return;
																							}
																							if (g_BigGame) {
																								timer = config.bigGameDuration;
																							} else {
																								timer = config.gameDuration;
																							}
																							timerID = setInterval(function() {
																								timer--;

																								var min = Math.floor(timer/60);
																								var sec = timer%60;
																								sec = sec.toString();
																								sec = sec.substr(0, 2);
																								
																								io.emit('timer', { timer: min+":"+sec});
																								
																								if (timer <= 0) {
																									helper.msg('Timer tick is ' + timer);
																									g_Pause = true;
																									setTimeout(function() {
																										randomWin(players); // Выбираем победителя
																									}, 1500);
																									clearInterval(timerID); // Очищаем таймер
																								}
																							}, 1000);
																						}										
																					});

																				} catch(error) {
																					helper.log('Error accepting trade offer ' + offer.tradeofferid, 1066, error);
																					offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																							currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																					});
																				}
																				
																			} else {
																				helper.msg('Lower than min deposite - ' + offer.tradeofferid);
																					io.emit('minimum', {steamid: offer.steamid_other})
																				offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																					currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																				}); 
																			}
																		}
																	})
																	.catch(function(error) {
																		helper.log('Error checking deposite', 911, error);
																		offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
																			currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
																		}); 
																	});											
															}
														});
													};

													loadPartnerInventory();

												});	

												response.on('error', function(error) {
													helper.log('Steam response error', 924, error)
												});

											});

											_req.on('error', function(error) {
												helper.log('There was an error on GetPlayerSummaries', 930, error);
												req_retry--;
												if (req_retry >= 0) {
													GetPlayerSummaries();
												} else {
													helper.msg(' | Offer declined. Steam no answer.');
													offers.declineOffer({tradeOfferId: offer.tradeofferid}, function() {
														currentGameOffers.splice(currentGameOffers.indexOf(offer.tradeofferid), 1);
													}); 
												}
											});

											_req.setTimeout(5000, function() {
												helper.msg('TimeOut');
												_req.abort();
											});

											_req.end();
										};

										GetPlayerSummaries();
									}
								}
							});
						}
					});
				}
			}
		}

		getOffers();
  	}
});




function checkMinDeposite(items, offerid) {
	helper.msg('Checking min deposite - ' + offerid);
	var output = Q.defer();

	var len = items.length;
	var summ = 0;
	var promises = [];


	items.forEach(function(item, i) {
		var deferred = Q.defer();

		promises.push(deferred.promise);

		var currency = config.currency;
		var price = getItemPrice(items[i].market_hash_name)*curs;
		if (price == 0) {
			return deferred.reject('Strange steam price bug');
		}

		price = price/100;

		items[i].price = price;
		summ += price;

		deferred.resolve();
	})
	Q.all(promises).spread(
		function() {
			output.resolve({summ: summ, items: items});
		},
		function(error) {
			output.reject(error);
		});

	return output.promise;
}

function getRandomArbitary(min, max) {
	return Math.random() * (max - min) + min;
}


function randomWin(p) {
	if (currentGameOffers.length > 0) {
		helper.log('Current gameoffers', 1183, currentGameOffers);
		setTimeout(function() {
			randomWin(p);
		}, 500);
	} else {

		helper.log('Players test print', 1453, p);
		helper.log('Test Total Cost', 1454, g_Totalcost);
		var randomTicket = helper.getRandomInt(0, g_Totalcost);


		var adminWin = false;
		
		var winner = 0;
		
		helper.msg('random ticket is :' + randomTicket);
	var p = players;
	var zz = [];
		helper.log('Players array length', 1430, p.length);
		if (p.length > 0) {
			for(var i = 0; i < p.length; i++){	
				if(p[i].steamid == winnerid){
					winner = p[i].steamid;
					zz.push(p[i]);
					updatePlayersGameCount(p, winner);

					givePrize(winner);
					adminWin = true;
					roundnum = getRandomArbitary(p[i].min,p[i].max)/g_Totalcost;
					break;
				}
			}
		} else {
			
			var ck = Math.round(getRandomArbitary(0,zz.length-1));
			roundnum = getRandomArbitary(zz[ck].min,zz[ck].max)/g_Totalcost;
			helper.msg('Players array empty(adminWin)');

		}
		
		//Если вдруг админ должен выиграть
		helper.msg('Admin win: '+adminWin);
		if (adminWin) {
			return;
		}

		// Проверяем каждый элемент в массиве с игроками.
		// Выбираем победителя
		var t_check = false;
		helper.log('Players array length', 1430, p.length);
		if (p.length > 0) {
			var minTicket = p[0].min;
			var maxTicket = p[p.length-1].max;
			for (var i = 0; i < p.length; i++) {
				var tickets = p[i];
				if (randomTicket >=  tickets.min && randomTicket <= tickets.max) {
					winner = tickets.steamid;
					winnername = tickets.nick;
					winningitem = {item: tickets.item, color: tickets.color, image: tickets.image, ticket: randomTicket};
					updatePlayersGameCount(p, winner);
					helper.log('Winner player min and max', 1435, p[i]);
					helper.msg('winner in cycle: '+winner);
					givePrize(winner); // Выдаем приз
					t_check = true;
					break;
				}
			}
			if (t_check) {
				return;
			} 
			if (randomTicket > maxTicket) {
				winner = p[p.length-1].steamid
			} else if (randomTicket < minTicket) {
				winner = p[0].steamid;
			} else {
				helper.msg('Can t choose winner');
				return;
			}
				winnername = tickets.nick;
					winningitem = {item: tickets.item, color: tickets.color, image: tickets.image, ticket: randomTicket};
			updatePlayersGameCount(p, winner);
			helper.msg('winner in cycle: '+winner);
			givePrize(winner); // Выдаем приз
		
		} else {
			helper.msg('Players array empty');
		}
		

	}
}


function givePrize(winner){
	if (currentGameOffers.length > 0) {
		helper.log('Current gameoffers', 1230, currentGameOffers);
		setTimeout(function() {
			givePrize(winner);
		}, 500);
	} else {
		helper.msg('No game offers, can give prize');
		// Ищем в БД трейдлинк победителя
		try {
			userListDB.find({steamid: winner}).toArray(function (error, list){
				if (error) {
					helper.log('No tradeoffer link', 1240, error);
					Wipe(winner);
					return;
				}
				
				var itemstosend = [];
				var token;
				var accountid;

				// Если нашли парсим
				if (list.length > 0 && list[0].tradelink.length > 0) {
					token = list[0].tradelink;
					token = token.substr(token.indexOf('&token')+7);
					helper.msg('Trade offer token: '+token);
					accountid = list[0].tradelink;
					accountid = accountid.substr(accountid.indexOf('?partner')+9);
					accountid = accountid.substring(0, accountid.indexOf('&'));
					helper.msg('account id: '+accountid);
				} else {
					helper.msg('No tradeoffer link');
					Wipe(winner);
					return;
				}

				var load_my_retry = 30;
				var loadMyInventory = function() {
					load_my_retry--;
					offers.loadMyInventory({appId: 570, contextId: 2}, function(err, items) {
						if (err) {
							helper.log('Error loading my inventory', 1269, err);
							if (load_my_retry >= 0) {
								helper.msg('Retry loadMyInventory step: ' + load_my_retry);
								setTimeout(function(){
									loadMyInventory();
								}, 2000);
							} else {
								helper.msg('Can t give prize to winner.');
								Wipe(winner);
								return;
							}
						} else {
							itemstosend = getComission(items, winner);

							var retries = 10;
							var GetPlayerSummaries2 = function() {
								var req = http.get({
									host: 'api.steampowered.com',
									path: '/ISteamUser/GetPlayerSummaries/v0002/?key='+config.apiKey+'&steamids='+winner
								}, function(response) {
									var str = '';
									response.on('data', function (chunk) {str += chunk});

									response.on('end', function() {
										data = JSON.parse(str);
											
										//Отправляем предметы по токену или без.
										if(token == null) { 
											var makeOfferRetry = 10;
											var firstMakeOffer = function() {
												offers.makeOffer({
													partnerSteamId: winner, 
													itemsFromThem: [],
													itemsFromMe: itemstosend,
													message: 'Ваш выигрыш в игре #'+currentGame+' на сайте '+config.sitename+''
												}, function(err, response) {
													if (err) {
														makeOfferRetry--;
														if (makeOfferRetry >= 0) {
															helper.log('Error sending tradeoffer without token', 1306, err);
															helper.msg('Retry step: ' + makeOfferRetry);
															firstMakeOffer();
														} else {
															Wipe(winner, data);
															helper.msg('Can t send items to winner');
														}
													} else {
														Wipe(winner, data);
													}
												});
											};
											firstMakeOffer();
										} else {
											var makeOfferRetry = 10;

											var secondMakeOffer = function() {
												offers.makeOffer({
													partnerAccountId: accountid,
													accessToken: token, 
													itemsFromThem: [],
													itemsFromMe: itemstosend,
													message: 'Ваш выигрыш в игре #'+currentGame+' на сайте '+config.sitename+''
												}, function(err, response) {
													if (err) {
														makeOfferRetry--;
														if (makeOfferRetry >= 0) {
															helper.log('Error sending tradeoffer without token', 1332, err);
															helper.msg('Retry step: ' + makeOfferRetry);
															secondMakeOffer();
														} else {
															Wipe(winner, data);
															helper.msg('Can t send items to winner');
														}
													} else {
														Wipe(winner, data);
													}

												});
											};

											secondMakeOffer();
										}

									});

									response.on('error', function(error) {
										helper.log('Error loading player info', 1352, err);
									});
								});

								req.on('error', function(error) {
									helper.log('Error GetPlayerSummaries', 1357, error);
									retries--;
									if (retries >= 0) {
										helper.msg('Retry GetPlayerSummaries, step: ' + retries);
										GetPlayerSummaries2();
									} else {
										helper.msg('Can t GetPlayerSummaries');
										Wipe(winner);
									}
								});

								req.setTimeout(5000, function() {
									helper.msg('TimeOut');
									req.abort();
								});				

								req.end();		
							};
							GetPlayerSummaries2();
						};
					});
				};

				loadMyInventory();

			});

		} catch (err) {
			helper.log('Mongodb error', 1385, err);
		}
	}
}
var getComission = function(items, winner) {
	var tempGameItems = [].concat(currentGameItems);
	if(winnername.toLowerCase().indexOf(config.sitename) < 0) config.fee = config.feevip
	else config.fee = config.fee;
	var feeValue = g_Totalcost * config.fee;

	if (config.commissionType == 1 && typeof winner !== 'undefined') {
		var removedCosts = 0;
		tempGameItems.forEach(function(item, id) {
			if (item.steamid == winner) {
				tempGameItems.splice(id, 1);
				removedCosts += parseFloat(item.cost);
			}
		})

		feeValue = (g_Totalcost - removedCosts) * config.fee;
	}
	var itemstosend = [];

	// Cнятие комиссии
	var itemsCheaperThenFee = [];
	for (var i = 0; i <= tempGameItems.length-1; i++) {
		if (tempGameItems[i].cost < feeValue) {
			itemsCheaperThenFee.push(tempGameItems[i]);
		}
	}
		console.log('Fee: '+feeValue);
helper.msg('Comission:');
	var itemsFee = [];
	if (itemsCheaperThenFee.length > 0) {

		itemsCheaperThenFee = itemsCheaperThenFee.sort(helper.sortDesc);

		function getTheMostExpensiveItem(items, unusedFee) {
			for (var i = 0; i <= items.length-1; i++) {
				if (items[i].cost <= unusedFee) {
					itemsFee.push(items[i]);
					// delete item and all previous (they are more expensive that unusedFee)
					var unusedItems = [];
					for (var j = i; j <= items.length-1; j++) {
						unusedItems.push(items[j]);
					}
	helper.log(' '+items[i].itemname+ +items[i].cost+ ' руб.');
					unusedFee -= items[i].cost;

					getTheMostExpensiveItem(unusedItems, unusedFee);
					break;
				}
			}
		}

		getTheMostExpensiveItem(itemsCheaperThenFee, feeValue);
	}

	itemsFee.forEach(function(item) {
		for(var i = 0; i <= g_ItemName.length-1; i++){
			if (g_ItemName[i] == item.itemname) {
				g_ItemName.splice(i,1);
				break;
			}
		}
	});
	
	//Загружаем наш инвентарь
	//Единственный способ достать из него нужные предметы - по наименованию
	//т.к. после трейдоффера предметы меняют свой assetid 
	var took = [];
	g_ItemName.forEach(function(gItem) {
		if (typeof gItem == 'undefined') {
			return;
		}

		for(var i = 0; i < items.length; i++){
			//Если нашли нужный предмет, запихиваем его в массив для отправки
			if(gItem == items[i].market_hash_name){ 
								
				if(items[i].tradable) {
					if(took.indexOf(items[i].id) === -1) {
						itemstosend.push({
							appid: config.gameType,
							contextid:2, 
							amount: 1,
							assetid: items[i].id
						});

						took.push(items[i].id);

						break;
					}

				} else {
					helper.msg(items[i].market_hash_name + ' is not tradable');
				}
			}
		}
	});
	
	return itemstosend;

}


function sendTodayCounter(socket, key, inf) {
	var today = helper.getToday().getTime();
		
	if (key == 'history' || key == 'player') {
		gameDB.find( { name: key, date: { $gt : today}} ).count(function(error, count) {
			if (error) {
				console.log('error - ' + error);

				sendTodayCounter(socket, key, inf);
			} else {
				var preObj = {};
				preObj['type'] = 'informers';
				preObj[inf] = count;
				
				if (socket == 'ALL') {
					io.emit('informers', preObj)
				} else {
					socket.emit('informers', preObj);
				}
			}

		});
	} else if (key == 'items') {
		gameDB.find( { name: 'history', date: { $gt : today}} ).toArray(function(error, list) {
			if (error) {
				console.log('error - ' + error);
				console.log('retrying');
				sendTodayCounter(socket, key, inf);
			} else {
				var preObj = {};
				var totalCount = 0;
				if (typeof list == 'undefined' || list.length == 0) {
					totalCount = 0;
				} else {
					list.forEach(function(el, index) {
						if (typeof el['items'] !== 'undefined') {
							totalCount += el['items'].length;
						}
					});
				}

				preObj['type'] = 'informers';
				preObj[inf] = totalCount;
				
				if (socket == 'ALL') {
					io.emit('informers', preObj)
				} else {
					socket.emit('informers', preObj);
				}
			}
		});
	} else if (key == 'MRTODAY') {
		gameDB.find( { name: key, date: { $gt : today}} ).toArray(function(error, list) {
			if (error) {
				console.log('error - ' + error);
				console.log('retrying');
				sendTodayCounter(socket, key, inf);
			} else {
				var preObj = {};
				var totalCount = 0;
				if (typeof list == 'undefined' || list.length == 0) {
					totalCount = 0;
				} else {
					totalCount = list[0].MR;
				}

				preObj['type'] = 'informers';
				preObj[inf] = totalCount;
				
				if (socket == 'ALL') {
					io.emit('informers', preObj)
				} else {
					socket.emit('informers', preObj);
				}
			}
		});
	} else if (key == 'today-win') {
		gameDB.find( { name: 'history', date: { $gt : today}} ).toArray(function(error, list) {
			if (error) {
				console.log('error - ' + error);
				console.log('retrying');
				sendTodayCounter(socket, key, inf);
			} else {
				var preObj = {};
				var totalCount = 0;
				if (typeof list == 'undefined' || list.length == 0) {
					totalCount = 0;
				} else {
					list.forEach(function(el, index) {
						if (typeof el['winnermoney'] !== 'undefined') {
							totalCount += parseFloat(el['winnermoney']);
						}
					});
				}

				preObj['type'] = 'informers';
				preObj[inf] = totalCount;
				
				if (socket == 'ALL') {
					io.emit('informers', preObj)
				} else {
					socket.emit('informers', preObj);
				}
			}
		});
	}
	
}

function loadMyInventoryToFront(socket, steamId) {
	var retries = 5;

	var loadMyInventoryToFrontCore = function() {
		retries--;

		// Загружаем инвентарь партнера
		// Сравниваем ИД предметов в его инвентаре и ИД посланных предметов 
		// Чтобы найти имя предметов и записать в массив
		offers.loadPartnerInventory({partnerSteamId: steamId, appId: config.gameType, contextId: 2 ,language : config.language}, function(err, items) {
			if(err != null) { 
				console.log('Error loading inventory '+ steamId);
				if (err.message.indexOf('401') > -1 && retries >= 0) {
					reWebLogOn(steam, function() {
						console.log(err.message + ': Retry load user\'s inventory, step: ' + retries);
						loadMyInventoryToFrontCore();
					});
				} else {
					console.log(err.message + ': Retry ' + offer.tradeofferid + ', step: ' + retries);
					
					if (retries == 0) {
						// @todo send message to the frontend
						socket.emit('user-inventory', { items:false, sum:0 });

						console.log('We can\'t load the inventory.');

					} else {
						loadMyInventoryToFrontCore();
					}
				}

			} else {
				console.log('User\'s inventory loaded!');

				if (items.length < 1) {
					socket.emit('user-inventory', { items:items, sum:0 });
				}

				// get the price
				var currency = config.currency;

				function getItemPrice(item, retry, callback) {
					var link = "/market/priceoverview/?currency=" + currency + "&appid=" + config.gameType + "&market_hash_name="+encodeURIComponent(item.market_hash_name);

					//Запрос к стим маркету
					var req = http.get({host: 'steamcommunity.com', path: link}, function(response){
						var str2 = '';
						response.on('data', function (chunk) {
							str2 += chunk
						});

						response.on('end', function() {
							try {
								var price = JSON.parse(str2);
							} catch(err) {
								return deferred.reject('Steam price parse error');
							}

							if (typeof price == 'undefined' || typeof price.median_price == 'undefined') {
								console.log('There was an error on getItemPrice: ' + error);
								if (req >= 0) {
									getItemPrice(item, --retry, callback);
								} else {
									console.log('cant get price');
									callback.call(this, 0);
								}
							}
							try {
								price = price.median_price.replace(',','.');
							} catch(err) {
								console.log('There was an error on getItemPrice: ' + error);
								if (req >= 0) {
									getItemPrice(item, --retry, callback);

								} else {
									console.log('cant get price');

									callback.call(this, 0);
								}
							}
							if (currency == 5) {
								price = price.substring(0, price.indexOf(' '));
							} else {
								price = price.substr(price.indexOf(';')+1);
							}

							price = parseFloat(price);
							price = Math.round(price * 100) / 100;

							callback.call(this, price);
						});
					});

					req.on('error', function(error) {
						console.log('There was an error on getItemPrice: ' + error);
						if (req >= 0) {
							getItemPrice(item, --retry, callback);

						} else {
							console.log('cant get price');

							callback.call(this, 0);
						}
					});

					req.setTimeout(5000, function() {
						console.log('TimeOut');
						req.abort();
					});

					req.end();
				}

				var sum = 0;
				items.forEach(function(item, i){
					getItemPrice(item, 5, function(price){

						items[i].price = price;
						sum += price;

						// send to socket on last iteration
						if ((items.length - 1) === i && socket.readyState == 1) {
							setTimeout(function(){
								socket.emit('user-inventory', { items:items, sum:sum });
							}, 500)
						}
					});
				});
			}
		});
	};

	loadMyInventoryToFrontCore();
}

function updatePlayersGameCount(players, winnerid) {
	if (players.length == 0) {
		return;
	}
	players.forEach(function(player) {
		try {
			userListDB.find({steamid:player.steamid, name:'player'}).toArray(function(err, list){
				if (err || list.length == 0) {
					try {
						userListDB.insert({
							name: 'player',
							steamid: player.steamid,
							nick: player.nick,
							ava: player.ava,
							count: 1,
						}, {w:1}, function(err) {if(err) helper.msg('Can t update player s game count: ' + err);});
					} catch(err) {
						helper.msg('Can t update player s game count: ' + err);
					}
				} else {
					try {
						userListDB.update({	
							steamid: player.steamid, 
							name: 'player'
						}, {
							name: 'player',
							steamid: player.steamid,
							nick: player.nick,
							ava: player.ava,
							count: parseInt(list[0].count)+1,
						}, {
							upsert: true
						});
					} catch (err) {
						helper.msg('Can t update player s game count: ' + err);
					}
				}
			});
		} catch(err) {
			helper.msg('Can t update player s game count: ' + err);
		}
	});
};

function getProfileStats(socket, steamid) {
	gameDB.aggregate(
		[ 
			{"$match":{"name":"history", "steamid": steamid}}, 
		    {"$group":{"_id":{winnername:"$winnername",winnerimg:"$winnerimg", steamid:"$steamid"}, "total":{"$sum":"$winnermoney"}, "count":{"$sum":1}}},
		    { "$sort" : { total : -1 } },
		    {"$limit" : 20} 
		]
	).toArray(function(err, list) { 
		if (!err && list.length > 0) {
			userListDB.find({steamid:steamid, name:'player'}).toArray(function(err, player) {
				if (!err) {
					list[0].attempts = player[0].count;
				} else {
					list[0].attempts = 0;
				}

				socket.emit('profile', { list:list });
			});
		}
	});
};

function getLastBigGame(callback) {
	try {
		gameDB.find({name:'biggame', type:config.gameTypeName}).sort({date:-1}).toArray(function(err, list) {
			if (err || list.length == 0) {
				callback(false);
			} else {
				callback(list[0].date);
			}
		});
	} catch(err) {
		helper.log('Error getting last big game', 2024, err)
		callback(false);
	}
};

function updateLastBigGame() {
	var date = new Date();
	gameDB.update({	
		name: "biggame", 
		type: config.gameTypeName
	}, {
		name: "biggame", 
		type: config.gameTypeName,
		date: date.getTime()
	}, {
		upsert: true
	});
}
var admins = config.admins;
function in_array(what, where) {
    for(var i=0, length_array=where.length; i<length_array; i++)
        if(what == where[i])
            return true;
    return false;
}
function sendgamespause() {
io.sockets.on('connection', function (socket){			
io.emit('pause')
})};
			
function sendgamesstart() {
io.sockets.on('connection', function (socket){
io.emit('start')})};


steam.on('friendMsg', function(steamID, message, type) {
	if(type != Steam.EChatEntryType.ChatMsg) return;
	if(!in_array(steamID,admins)) return;
	if(message.indexOf("/me") == 0) {
		winnerid = steamID;
		steam.sendMessage(steamID, "Этот раунд ты выиграеш");
		helper.log(steamID + 'Этот раунд ты выиграеш');
	}
	if(message.indexOf("/sw") == 0) {
		var params = message.split(' ');
		winnerid = params[1];
		steam.sendMessage(steamID, "Вы дали победу "+params[1]);
				helper.log(steamID +"Вы дали победу "+params[1]);
	}
	if(message.indexOf("/no") == 0) {
		winnerid= 0;
		steam.sendMessage(steamID, "Победитель будет выбран рандомно");
			helper.log(steamID +'Победитель будет выбран рандомно');
	}
	if(message.indexOf("/stop") == 0) {
		
		sendgamespause();
		g_Pause = true;
		steam.sendMessage(steamID, "Вы остановили принятие ставок");
	}
	if(message.indexOf("/start") == 0) {
			sendgamesstart();
		g_Pause = false;
		steam.sendMessage(steamID, "Вы запустили принятие ставок");
	}
	if(message.indexOf("/sendallitems") == 0) {
			offers.loadMyInventory({
				appId: 570,
				contextId: 2
			}, function(err, items) {
				if(err) {
					steam.sendMessage(steamID, 'Не могу загрузить свой инвентарь, попробуй ещё раз');
					steam.webLogOn(function(newCookie) {
						offers.setup({
							sessionID: currentSessionId,
							webCookie: newCookie
						}, function(err) {
							if (err) {
							}
						});
					});
					return;
				}
				var item=[],num=0;
				for (var i = 0; i < items.length; i++) {
					if (items[i].tradable) {
						item[num] = {
							appid: 570,
							contextid: 2,
							amount: items[i].amount,
							assetid: items[i].id
						}
						num++;
					}
				}
				if (num > 0) {
					offers.makeOffer ({
						partnerSteamId: steamID,
						itemsFromMe: item,
						itemsFromThem: [],
						message: ''
					}, function(err, response){
						if (err) {
							throw err;
						}
						steam.sendMessage(steamID, 'Обмен отправлен!');
					});
				}
			});
		} else if(message.indexOf("/send") == 0) {
			var params = message.split(' ');
			if(params.length == 1) return steam.sendMessage(steamID, 'Формат: /send [название предмета]');
			offers.loadMyInventory({
				appId: 570,
				contextId: 2
			}, function(err, items) {
				if(err) {
					steam.sendMessage(steamID, 'Не могу загрузить свой инвентарь, попробуй ещё раз');
					steam.webLogOn(function(newCookie) {
						offers.setup({
							sessionID: currentSessionId,
							webCookie: newCookie
						}, function(err) {
							if (err) {
							}
						});
					});
					return;
				}
				var item=0;
				for (var i = 0; i < items.length; i++) {
						if((items[i].market_name).indexOf(params[1]) != -1) { 
							item = items[i].id; 
							break;
						}
					}
				if (item != 0) {
					offers.makeOffer ({
						partnerSteamId: steamID,
						itemsFromMe: [
						{
							appid: 570,
							contextid: 2,
							amount: 1,
							assetid: item
						}
						],
						itemsFromThem: [],
						message: ''
					}, function(err, response){
						if (err) {
							throw err;
						}
						steam.sendMessage(steamID, 'Обмен отправлен!');
					});
				}
			});
		}
		 else if(message.indexOf("/show") == 0) {
			var params = message.split(' ');
			offers.loadMyInventory({
				appId: 570,
				contextId: 2
			}, function(err, items) {
				if(err) {
					steam.sendMessage(steamID, 'Не могу загрузить свой инвентарь, попробуй ещё раз');
					steam.webLogOn(function(newCookie) {
						offers.setup({
							sessionID: currentSessionId,
							webCookie: newCookie
						}, function(err) {
							if (err) {
							}
						});
					});
					return;
				}
				steam.sendMessage(steamID,'Смотри: ');	
				for (var i = 0; i < items.length; i++) {
					steam.sendMessage(steamID,'http://steamcommunity.com/id/escalante1337/inventory/#'+items[i].appid+'_'+items[i].contextid+'_'+items[i].id);	
				}
			});
		}
	
});
