(function($) {
$(document).ready(function() {
function _$(a) {return document.getElementById(a);}
function ce(a) {return document.createElement(a);}
function ca(a) {return document.createAttribute(a);}


var progress = _$('pb');
var items = 0;
var mymoney = 0;
var totalcost = 0;
var lasttickets = 0;
var lastticket = 0;
var currency = null;
var lsecure = Math.random().toString(36).substring(2);
$('#items-count-temp').tipsy({gravity: 's'}); 

var curs = 68;
		
console.log('Курс доллара - ' + curs);

var socketIO = io(':2095' || ':8304',{'max reconnection attempts':Infinity});	


socketIO.once('connect', function(){
		socketIO.emit('0');
		socketIO.emit('auth',{steamid:getToken()});
		if ($('.topss').length > 0) {
			buildTopTable();
		}

		if ($('#history-page').length > 0) {
			socketIO.emit('2');
		}

		if ($('.settings-url').length > 0) {
			socketIO.emit('trade-link',  { steamId : getToken() });
		}

		if ($('.myinvenory').length > 0) {
			if($('#steam_user_page_id').size() == 1 && $('#steam_user_page_id').text() != ''){
				build_user_inventory($('#steam_user_page_id').text());
			}else{
				build_user_inventory(window.steam_user.steamid);
			}
			
			//socketIO.emit('load-inventory', {steamid: getSteamID() });
		}
		

		//цена
  		socketIO.on('currency', function(data){
  		if(getLang() == "ru"){	currency = (data == 'rur') ? 'руб.' : '$';
 } else { currency = (data == 'rur') ? '$' : '?';
		}
			
  		});
		
		
		socketIO.on('wints', function(data){
			      if (data.steamid == getSteamID()) {
$('#wints').removeClass('hiddenes');}
});
		
		

   
		
		
		
		socketIO.on('acceptoffer', function(data){
			         if (data.steamid == getSteamID()) {
$('.acceptoffer').removeClass('hiddenes');
setTimeout(function() {
$('.acceptoffer').addClass('hiddenes');
}, 7000);         }
});
		
socketIO.on('minimum', function(data){
	       if (data.steamid == getSteamID()) {
$('.errortrade').removeClass('hiddenes');
setTimeout(function() {
$('.errortrade').addClass('hiddenes');
}, 8000);}
});
socketIO.on('maxitem', function(data){
	       if (data.steamid == getSteamID()) {
$('.maxitem').removeClass('hiddenes');
setTimeout(function() {
$('.maxitem').addClass('hiddenes');
}, 8000);}
});
	
	
	socketIO.on('notradelink', function(data){
       if (data.steamid == getSteamID()) {
$('.notradelink').removeClass('hiddenes');
setTimeout(function() {
  $('.notradelink').addClass('hiddenes');
}, 8000);}

	});
	
	
	/*socketIO.on('pause', function(data){
		
		$('.game-start').addClass('hiddenes');
		$('.sum').addClass('hiddenes');
		$('.inform').addClass('hiddenes');
		
			$('.pauses').removeClass('hiddenes');
		
		
		});
		
		
		socketIO.on('start', function(data){
			$('.pauses').addClass('hiddenes');
			$('.game-start').removeClass('hiddenes');
	$('.sum').removeClass('hiddenes');
	$('.inform').removeClass('hiddenes');
		
		
		
		
		});
		*/
	


  		//информеры
  		socketIO.on('informers', function(data){
  		
		
		if(getLang() == "ru"){ 	 	if(data.inf1 && _$('inf1')) _$('inf1').innerHTML = getWordNormal(data.inf1,'пользователь','пользователя','пользователей'); } else {	if(data.inf1 && _$('inf1')) _$('inf1').innerHTML = getWordNormal(data.inf1,'user','user','users');  }
			if(data.inf2 && _$('inf2')) _$('inf2').innerHTML = data.inf2.toFixed() + ' ' + currency;
			if(data.inf3 && _$('inf3')) _$('inf3').innerHTML = data.inf3;

			if(data.inf4 && _$('inf4')) _$('inf4').innerHTML = data.inf4.toFixed() + ' ' + currency;
			if(data.inf4 && $('.jackpotNum').length) {
				var jackpotThousands = parseFloat(data.inf4) / 1000;
				jackpotThousands = jackpotThousands.toFixed();
				$('.jackpotNum').text(jackpotThousands + 'К');
			}

			if(typeof data.inf5 != 'undefined' && $('.inf5').length > 0) {
				var inf5 = data.inf5;
				
				if (data.inf5 == '0') {
					inf5 = 'отсутствует';
				} else {
					inf5 += currency;
				}
				
				$('.inf5').text(inf5);
			}

			if(data.inf6 && $('.inf6')) $('.inf6').text(data.inf6);
			if(data.inf7 && $('#inf7').length) $('#inf7').text(data.inf7);
			if(data.inf7 && $('#inf14').length) $('#inf14').text(data.inf7);
			if(data.inf8 && $('#inf8').length) $('#inf8').text(data.inf8);
			if(data.inf9 && $('#inf9').length) $('#inf9').text(data.inf9);
			if(getLang() == "ru"){  data.inf10 = data.inf10; }else{ data.inf10 = data.inf10/curs.toFixed(2);}
			if(data.inf10 && $('#inf10').length) $('#inf10').text(data.inf10.toFixed(0) + ' ' + currency);
			if(data.inf11 && $('#inf11').length) $('#inf11').text(data.inf11.toFixed(2) + ' ' + currency);
		});


  		//последний победитель
  		socketIO.on('last-winner', function(data){
			
				$('.last-winner').removeClass('hiddenes');
				
			if (_$('winner-name') && _$('winner-avatar') && _$('winner-money')) {
			var gold = "";
		(data.name.indexOf('EZYSKINS.RU')>-1)?gold='style="color:gold;"':"";
		var z = data.ava.replace('https','http');
				_$('winner-name').innerHTML = '<a target="_blank" '+gold+' original-title="Перейти в профиль" class="user_title_link" href="/profile.php?steam_id='+data.steamid+'">'+data.name+'</a>';
				_$('winner-avatar').innerHTML = ('<img src="' + z + '" width="110" height="110"  alt="1">');
				
				if(getLang() == "ru"){  data.money = data.money.toFixed(2);	}else{data.money = data.money/curs.toFixed(2); }
				
				_$('winner-money').innerHTML = data.money + currency;
				$('.user_title_link').tipsy({gravity: 's'}); 
			  _$('winner-chance').innerHTML = data.chance+'%';
			}
  		});

  		//история
  		socketIO.on('history', function(data){
			buildHistoryPage(data.history, data.historyOrder, data.commission);
  		});
		
		var timerV2=function(){var colSeconds=18;var sec=0;sec=colSeconds;var idInterval=setInterval(function(){var tempSec=sec+'';if(sec<=0){clearInterval(idInterval);}if(tempSec.length==1){tempSec='0'+tempSec;}$('.timer-v2').text(tempSec);sec--;},1000);}

  		//таймер
  		socketIO.on('timer', function(data){
  			if (data.timer == '0:0') {
				$('.gamepause').removeClass('hiddenes');
			}

			//таймер
			var minute = data.timer.substring(0, data.timer.indexOf(':'));
			var second = data.timer.substring(data.timer.indexOf(':')+1);
			if (minute.length == 1) {
				minute = '0'+minute;
			}
			if (second.length == 1) {
				second = '0'+second;
			}
			if ($('#timer').size() > 0) {
				$('#timer').text(minute + ':' + second);
			}
  		});

  		//ставки
  		socketIO.on('0', function(data){
  		//	console.log(data);
  			var cont = _$('game'); 
			if (cont == null) {
				return;
			}
			$('.bg-shorts').removeClass('hiddenes');
			$('.arrow-2').removeClass('hiddenes');
			$('.text-2').removeClass('hiddenes');
			
  			$('.players-percent').removeClass('hiddenes');
			$('#start-game-advert').hide();
			$('#in-game-advert').show();

			var icount = parseInt($('#items-count-temp').text());
		
			icount++;
			$('#items-count-temp').text(icount);
				var icount = parseInt($('#items-count-temps').text());
			icount++;
			$('#items-count-temps').text(icount);
			if (data.steamid == getSteamID()) {
			 	$('#chance-temp').text(data.chance.toFixed(2));
			 	$('#player-items-count').text(data.itemcounter);
			}


				var d = new Date();
				var $parent = $('#game');
				
				
				
				var ddk = lastticket+1;
				if(getLang() == "ru"){  var ntk = (lastticket+Math.ceil(data.cost*1.7)); }else{ var ntk = (lastticket+Math.ceil(data.cost*1.7)); }
				lastticket = ntk;
					var $block = $('#'+data.steamid);
		
		//	var b_count = Math.ceil(data.money*2);
				
			//	$block.find('#tb_count_steamsss').attr('data-count',b_count);
				//$block.find('#tb_count_steamsss').text(b_count);

			if($('#'+data.steamid).size() > 0){
				if(getLang() == "ru"){  data.money = data.money.toFixed(2); data.cost = data.cost.toFixed(2); 	}else{ data.money = parseFloat(data.money)/curs.toFixed(2); data.cost = parseFloat(data.cost/curs).toFixed(2); }
		
				var $block = $('#'+data.steamid);
				$block.find('#tb_count_steam').text(getWordNormal(data.itemcounter,'вещь','вещи','вещей'));
				$block.find('#total_item_price').text(data.money, ' ' +currency);
				
				
			
			/*style="border: 2px solid ' +data.background_color+ '"
				*/
				var item = '<div class="south" style=" border:1.5px solid '+data.background_color+'" id="'+data.steamid+'"><div class="info south" id="bilet" original-title="Билеты от <b>#'+ddk+'</b> до <b>#'+ntk+'</b>"></div>';
					item += '<img class="item" original-title="'+data.itemname+'" src="http://steamcommunity-a.akamaihd.net/economy/image/'+ data.image +'/64fx64f" alt="" title="" /><span>'+data.cost+''+currency+'</span>';
					item += '</div>';
				$block.find('#itemsss').append(item);
				$block.find('.percent').text(data.chance.toFixed(1)+'%');
			}else{
				
		
				if(getLang() == "ru"){  var b_count = Math.ceil(ddk+ntk-1); }else{ var b_count = Math.ceil(data.cost*1.7);}
				
				if(getLang() == "ru"){  data.money = data.money.toFixed(2); data.cost = data.cost.toFixed(2); 	}else{ data.money = data.money/curs.toFixed(2); data.cost = parseFloat(data.cost/curs).toFixed(2); }
		
								if(data.user.toLowerCase().indexOf(data.sitename) < 0) var vip  = 'VIP'
	else var vip  = '';
var gold = "";
		(data.user.indexOf('EZYSKINS.RU')>-1)?gold='style="color:gold;"':"";
if(getLang() == "ru"){  
 var block					= '<div class="short item_user_steam" id="'+data.steamid+'">';
					block += '<div class="avatar left"><a href="http://'+data.sitename+'/profile.php?steam_id='+data.steamid+'" target="_blank"><img src="'+data.ava+'" alt="" title="" /></a></div>';
						block += '<ul>\
					<li><a class="user_title_link" '+gold+' original-title="Перейти в профиль" href="http://ezyskins.ru/profile.php?steam_id='+data.steamid+'" target="_blank">'+data.user+'</a></li>\
					<li>Вложил <span id="tb_count_steam">'+getWordNormal(data.itemcounter,'вещь','вещи','вещей')+'</span></li>\
					<li>На сумму <span id="total_item_price">'+data.money+' </span> <span>'+currency+'</span></li>\
					</ul>';
				}else{ 
				
				
				var block = '<div class="short item_user_steam" id="'+data.steamid+'">';
					block += '<div class="avatar left"><a href="http://'+data.sitename+'/profile.php?steam_id='+data.steamid+'" target="_blank"><img src="'+data.ava+'" alt="" title="" /></a><div class="info south" original-title=""></div>	</div>';
						block += '<ul>\
					<li><a class="user_title_link" '+gold+' original-title="Go to profile" href="http://'+data.sitename+'/profile.php?steam_id='+data.steamid+'" target="_blank">'+data.user+'</a></li>\
					<li>Invested <span id="tb_count_steam">'+getWordNormal(data.itemcounter,'thing','things','things')+'</span></li>\
					<li>To the amount of <span id="total_item_price">'+data.money+' </span> <span>'+currency+'</span></li>\
				</ul>';
				
				};

				
					block += '<div class="items right" id="itemsss" >';
					block += '<div class="south" style=" border:1.5px solid '+data.background_color+'" id="'+data.steamid+'"><div class="info south" original-title="Билеты от <b>#'+ddk+'</b> до <b>#'+ntk+'</b></b"></div>';
					block += '<img class="item" original-title="'+data.itemname+'" src="http://steamcommunity-a.akamaihd.net/economy/image/'+ data.image +'/64fx64f" alt="" title="" /><span>'+data.cost+''+currency+'</span>';
					block += '</div>';

					block += '</div>';
			
			
				if($('.item_user_steam').size() > 0){
					
					$parent.find('.item_user_steam:first').before(block);
				}else{
					$parent.append(block);
				}
				
				//console.log('New ['+(d.getTime())+']',data);
			}
			$('.info').tipsy({gravity: 's'}); 
			$('.item').tipsy({gravity: 's'}); 
			$('.user_title_link').tipsy({gravity: 's'}); 
			
			
					if($('#'+data.steamid).size() == 1){
			if (sound == 'on') {
				$('#bet1-sound')[0].play();
			}}

			if($('#'+data.steamid).size() == 2){
			if (sound == 'on') {
				$('#bet2-sound')[0].play();
			}}

			if($('#'+data.steamid).size() > 2){
			if (sound == 'on') {
				$('#bet3-sound')[0].play();
			}}
			

			
			

			// update items count
			items++;
			if(items > 100) {
				items = 100;
			}

			progress.style.width = items+"%";
			//console.log(progress, items);
			var SteamID = getSteamID();
			if(getLang() == "ru"){



			totalcost += curs*data.jackpot.toFixed(2);  } else {  totalcost += data.jackpot.toFixed(2); }
		

		if(getLang() == "ru"){	$('title').text(data.jackpot.toFixed(2) + currency + ' - '+data.sitename+' - Проверь свою удачу!');
 } else { $('title').text(data.jackpot/curs.toFixed(2) + currency + ' - '+data.sitename+' - Проверь свою удачу!');
		}
		
		
		
		
		
  		});
		

		// type 2
		socketIO.on('2', function(data){
			
				totalcost += data.jackpot;
			
			
			
			if(getLang() == "ru"){ 




			$('#jackpot-temp').text(data.jackpot.toFixed(2) + ' ' + currency);  } else {



			$('#jackpot-temp').text(parseFloat(data.jackpot/curs).toFixed(2)+ ' ' + currency); }
			
			
			$('.game-num').text(data.gamenumber);
		$('#roundHash').text(data.hash);
			
		});

		// end-game
		socketIO.on('end-game', function(data){
		timerV2();
			$('#winner-end').text(' ??? ');
			$('#winner-ticket').text(' ??? ');
		
			$('#roundNum').text('0.0000000000');
			$('#winner-item').text(' ??? ');
$('#items-count-temps').text('0');
			$('#items-count-temp').text('0');
			$('.roulette').removeClass('hiddenes');
			$('.gameactive').addClass('hiddenes');
			$('.gameend').removeClass('hiddenes');
			$('.details-wrap').addClass('hiddenes');
			$('#chance-temp').text('0');
			$('#player-items-count').text('0');
$('.gamepause').addClass('hiddenes');

if(getLang() == "ru"){ 				$('.winner-cost-value').text(data.money);  } else { 	data.money = data.money/curs;		$('.winner-cost-value').text(data.money); }

			$('.winner-cost-valuta').text(' ' + currency);
$('.inform').addClass('hiddenes');
			// Tape 
			$users = $('.users-add').find('.block');
			var itemsTape = [];
			$.each($users, function(index, el) {
				var img_src = $(el).find('img').attr('src');
				var chance_field = $(el).find('.players-percent-text').text();
				var chance = parseFloat(chance_field.substr(0,chance_field.indexOf('%')));

				for (var i = 0; i <= chance; i++) {
					itemsTape.push(img_src);
				}
			});

			function shuffle(o){
			    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			    return o;
			}
			
			function soundroulet()
			{
					if (sound == 'on') 
					{
                    $('#click-sound-1')[0].play();
                    }
			}

			itemsTape = shuffle(itemsTape);

			itemsTape.splice(100, itemsTape.length-100);

			if (itemsTape.length < 100) {
				var differ = 100 - itemsTape.length;
				for (var i = 0; i < differ; i++) {
					
					soundroulet();
						soundroulets();
						soroulet();
					itemsTape.push(itemsTape[0]);
				}
			}
			
			 function soroulet()
			{
			if (sound == 'on') {
				$('#rulet')[0].play();
			}
			}
	
   
    function soundroulets()
			{if (sound == 'on') {
         $('#click-sound-' + this.i)[0].play();
          this.i++;
       if (this.i > 10) {
            this.i = 1;
         }
        }  }
  
		
	

itemsTape[93] = data.ava;


			$.each(itemsTape, function(i,v){
				$('.inbox').append('<img src="' + v + '" />');
			});
			
if (sound == 'on') {
				$('#rulette-sound')[0].play();
			}

			setTimeout(function(){
				$('.inbox').css('-moz-transform' ,'translate3d(-6902px, 0, 0)');
			$('.inbox').css('-ms-transform' ,'translate3d(-6902px, 0, 0)');
			$('.inbox').css('-o-transform' ,'translate3d(-6902px, 0, 0)');
			$('.inbox').css('-webkit-transform' ,'translate3d(-6902px, 0, 0)');
			$('.inbox').css('transform' ,'translate3d(-6902px, 0, 0)');
				
				setTimeout(function(){
				//	if (sound == 'on') {
				//$('#rulette-end')[0].play();
			//}
			
			$('#roundNum').text(data.roundnum);
					$('#winner-end').text(data.name);
					$('#winner-ticket').text(Math.round(data.item.ticket*1.7));
					$('#winner-item').text(data.item.item);
					$('.game_end').removeClass('hiddenes');
					$('#start-game-advert').show();
						lastticket = 0;
						lasttickets = 0;
					$('#in-game-advert').hide();
				}, 13500);

			}, 1000);
		});

		// end-game-empty
		socketIO.on('end-game-empty', function(data){
			$('#items-count-temps').text('0');
			$('#items-count-temp').text('0');
			$('#chance-temp').text('0');
			$('#player-items-count').text('0');
		});

		// start-game
		socketIO.on('start-game', function(data){
			$('.gamepause').addClass('hiddenes');
			$('.game_end').addClass('hiddenes');
			if (sound == 'on') {
                $('#start-game-sound')[0].play();
            }			

			//clear
			items = 0;
			money = 0;
			totalcost = 0;
			
			progress.setAttribute('style', 'width: 0%;');
$('.gameend').addClass('hiddenes');
$('.inform').removeClass('hiddenes');
$('.bg-shorts').addClass('hiddenes');
			$('#winner-end').text(' ??? ');
$('#items-count-temps').text('0');
			$('#items-count-temp').text('0');
			$('.gameactive').removeClass('hiddenes');
			$('.winner-cost-value').text('');
			$('.winner-cost-valuta').text(' ' + currency);
			$('.roulette').addClass('hiddenes');
			$('.details-wrap').removeClass('hiddenes');
			$('.inbox').empty();
			$('.inbox').css('-moz-transform' ,'translate3d(390px, 0, 0)');
			$('.inbox').css('-ms-transform' ,'translate3d(390px, 0, 0)');
			$('.inbox').css('-o-transform' ,'translate3d(390px, 0, 0)');
			$('.inbox').css('transform' ,'translate3d(390px, 0, 0)');
			$('.inbox').css('-webkit-transform' ,'translate3d(390px, 0, 0)');
			$('.roulette').addClass('hiddenes');
			$('#game').empty();
			$('.users-add').empty();
			$('.users-add').addClass('hidden');
			$('.arrow-2').addClass('hiddenes');
			$('.text-2').addClass('hiddenes');
			$('.players-percent').addClass('hiddenes');
			$('#progbarin').css('width', 0);
			$('#player-items-count').text(0);
			$('#chance-temp').text(0);
			$('#gamestart-end').removeClass('hiddenes');
			$('#gamestart-start').addClass('hiddenes');
			$('title').text('EzySkins - Проверь свою удачу!');
			$('#timer').text('00:00');
		});

	// trade-link
		socketIO.on('trade-link', function(data){
  			if (data.list.length == 0) {
				if ($('.settings-url').length == 0) {
					$('#trade_link').removeClass('hiddenes');
					
				}
			} else {
					$('#trade_link').addClass('hiddenes');
				if (
					
				
				$('.settings-url').length > 0) {
					$('input[rel="get-trade-link"]').val(data.list[0].tradelink);
					 if (data.list[0].lsecure != undefined) { lsecure = data.list[0].lsecure; }
				}
			}
  		});

  		// playersUnique
  		socketIO.on('playersUnique', function(data){
			var $cont = $(".users-add");
			$cont.empty();
var msg = data;
			
			$.each(data.order, function(i,itemOrder){
var row = '<div class="block"><div class="players-percent-text">' + data.list[itemOrder.steamid].chance.toFixed(2) + '%</div><img src="' + data.list[itemOrder.steamid].ava + '" alt="" title="" /></div>';
								

				if (getSteamID() === itemOrder.steamid) {
					$('#chance-temp').text(data.list[itemOrder.steamid].chance.toFixed(2));
					$('#player-items-count').text(data.list[itemOrder.steamid].itemcounter);
				}

				$cont.append(row);
			});

			if (data.order.length > 0) {
				$cont.parent().removeClass('hidden');
			}
		});
	});

	// function updateUsersList() {
	// 	ws.send(JSON.stringify({
	// 		type: 'items'
	// 	}));
	// }

	function getSteamID() {
		return $('#steamid').length > 0 ? $('#steamid').html() : 0;
	};

	
	function getLang() {
		return $('#lang').length > 0 ? $('#lang').html() : 0;
	};
	
	
	function getToken() {
		return $('#steamtoken').length > 0 ? $('#steamtoken').html() : 0;
	};

	//inventory
	socketIO.on('user-inventory', function(data) {
	
			var avatar = $('.avatar').find('img').attr('src'),
				nickname = $('.profile').find('.nickname').text(),
				$cont = $('.myveshy');
				$cont.html('');

			var inventory = '';
			if (data.items != false) {
				$.each(data.items, function(i,v){
					inventory += '<a href="#" title="' + v.name + '"><img src="http://steamcommunity-a.akamaihd.net/economy/image/'+ v.icon_url + '/96fx96f"><span class="price">' + v.price  + ' ' + currency + '</span></a>';
				});
			}

			var profile = '<div class="user-profile"><img src="' + avatar + '" class="avatar" /><span class="nickname">' + nickname + '</span><br/><span class="total">РЎС‚РѕРёРјРѕСЃС‚СЊ РёРЅРІРµРЅС‚Р°СЂСЏ: ' + data.sum.toFixed(2) + currency + '</span><span class="red-button show-inventory hidden">РџРѕРєР°Р·Р°С‚СЊ РёРЅРІРµРЅС‚Р°СЂСЊ</span><div class="user-inventory"><div class="inventory">' + inventory + '</div></div><div class="clearfix"></div></div>';

			$cont.prepend(profile);

			$(document).on('click', '.show-inventory', function(){
				$(this).addClass('hidden');
				$('.user-inventory .inventory').removeClass('hidden');
			});
			$(document).on('click', '.inventory a', function(e) {
				e.preventDefault();
				return;
			});

		});

	function getWidth(style){
		return style.substring(style.indexOf('width:')+7, style.indexOf('%'));
	}

	var buildTopTable = function() {
		
		var $parent = $('.topss');
		var i = 0;
		
		var imgrank = 1;
			var row1;

if(getLang() == "ru") row1	= '	<div class="list">\
				<div class="tb1">Место</div>\
				<div class="tb3">Ник в стиме</div>\
				<div class="tb4">Количество побед</div>\
				<div class="tb5">Выиграл (руб)</div>\
			</div>';
			else row1 = '<div class="list">\
				<div class="tb1">Place</div>\
				<div class="tb3">Nick in steam</div>\
				<div class="tb4">Number of wins</div>\
				<div class="tb5">Won ($)</div>\
				</div>';
				
					$parent.append(row1);
					$('.loading').addClass('hiddenes')
		$.ajax({
			type : "GET",
			url  : "/application/appClass.php?action=top",
			dataType : "json",
			cache  : false,
			success : function(message){
				
				$('#count-top').text(message.count);
				$.each(message.list, function(index, el) {
					i++;
					if (i > 3) {
						imgrank++;
						i = 0;
					}
					var steamid = 0;
					for(var j in el.items){

						if(el.items[j].user == el.winnername) steamid = el.items[j].steamid;
					}
				var gold = "";
		(el.winnername.indexOf('EZYSKINS.RU')>-1)?gold='style="color:gold;"':"";
					
							if(getLang() == "ru"){  el.winnermoney = el.winnermoney; }else{ el.winnermoney = el.winnermoney/curs;}
					var row = '<div class="list">\
				<div class="tb1"><span>' + (index+1) + '</span></div>\
				<div class="tb3"><a '+gold+' class="user_title_link" original-title="Перейти в профиль" href="/profile.php?steam_id='+steamid+'" target="_blank">' + el.winnername + '</a></div>\
				<div class="tb4">' + el.count + '</div>\
				<div class="tb5">' + el.winnermoney.toFixed() + currency + '</div>\
			</div>';
			
			
						$parent.append(row);

				});

				$('.user_title_link').tipsy({gravity: 's'}); 
			}
		});
	};

	var buildHistoryPage = function(history, historyOrder, commission) {
		var $parent = $('#history-page');
		
		$.each(historyOrder, function(i, index) {
			var el = history[index];
			
		$('.loading').addClass('hiddenes');

			var itemsHistory = '';
			var steam_id = 0;
			$.each(el.items, function(index1, item) {
				if(getLang() == "ru"){  item.cost = parseFloat(item.cost).toFixed(2); }else{   item.cost = parseFloat(item.cost/curs).toFixed(2);; }
				if(item.user == el.winnername) steam_id = item.steamid;
				itemsHistory += '<div class="south" style="border:1px solid '+item.background_color+'"><a class="history-item-prize" data-image="http://steamcommunity-a.akamaihd.net/economy/image/'+ item.image+'/85fx70f" data-title="'+ item.itemname+'" data-user="'+ item.ava+'" data-price="~ '+ item.cost+'" data-color="'+ item.background_color+'">\
									<img src="http://steamcommunity-a.akamaihd.net/economy/image/'+ item.image+'/85fx70f" alt="image">\
									</a><span>' + item.cost + ' руб.</span></div>';
			});

				if(getLang() == "ru"){  el.winnermoney = el.winnermoney; 	}else{el.winnermoney = el.winnermoney/curs;  }
		var row;
		var gold = "";
		(el.winnername.indexOf('EZYSKINS.RU')>-1)?gold='style="color:gold;"':"";
			if(getLang() == "ru") row = '<div class="histoty-short">\
			<div class="top">\
				<div class="avatar left"><a href="/profile.php?steam_id='+steam_id+'" target="_blank"><img src="' + el.winnerimg + '" alt="" title="" /></a></div>\
				<ul>\
					<li><a original-title="Перейти в профиль" '+gold+' href="/profile.php?steam_id='+steam_id+'" target="_blank">' + el.winnername + '</a></li>\
					<li>Выигрыш: ' + el.winnermoney + ' руб.</li>\
					<li>Шанс: ' + el.winnerchance + '%</li>\
				</ul>\
				<div class="number">Игра #' + el.game + '</div><div class="blanks">ХЭШ РАУНДА: '+ el.hash+'</div>\
			</div>\
			<div class="items hidden">\
				  ' + itemsHistory + '\
			</div>\
		</div>';
		else row = '<div class="histoty-short">\
			<div class="top">\
				<div class="avatar left"><a href="/profile.php?steam_id='+steam_id+'" target="_blank"><img src="' + el.winnerimg + '" alt="" title="" /></a></div>\
				<ul>\
					<li><a '+godl+' original-title="Перейти в профиль" href="/profile.php?steam_id='+steam_id+'" target="_blank">' + el.winnername + '</a></li>\
					<li>Win: ' + el.winnermoney + ' руб.</li>\
					<li>Chance: ' + el.winnerchance + '%</li>\
				</ul>\
				<div class="number">Game #' + el.game + '</div><div class="blanks">Hash raund: '+ el.hash+'</div>\
			</div>\
			<div class="items hidden">\
				  ' + itemsHistory + '\
			</div>\
		</div>';
$('.user_title_link').tipsy({gravity: 's'}); 
			$parent.append(row);
		});
		
		$('.history-item-prize').hover(function() {
            var cur = $(this);
            var cur_image = cur.attr('data-image');
            var cur_title = cur.attr('data-title');
            var cur_price = cur.attr('data-price');
            var cur_color = cur.attr('data-color');
			var cur_ava=cur.attr('data-user');
				
            $('body').append('<div class="history-item-prize-drop">\
            <div class="history-item-prize-drop-top">\
            <div class="history-item-prize-drop-left" style="background: ' + cur_color + '">\
            <div class="history-item-prize-drop-image">\
            <img src="' + cur_image + '" alt="image" />\
            </div>\
            </div>\
			<div style="float: right;padding: 7px;">                                        <img src="'+ cur_ava +'" alt="image" style="width: 90px;height: 90px;">                                    </div>\
            <div class="history-item-prize-drop-top-inner">\
            <div class="history-item-prize-drop-title">' + cur_title + '</div>\
            <div class="history-item-prize-drop-price">' + cur_price+' ' + currency + '</div>\
            </div>\
            </div>\
            </div>');
            $('.history-item-prize-drop').fadeIn(200);
            $('.history-item-prize-drop').position({
                of: cur,
                my: "center bottom-10",
                at: "center top",
                collision: "none none"
            });
        }, function() {
            $('.history-item-prize-drop').remove();
        });

	}

	// sounds
	var sound = $.cookie('sound');
	if (sound == 'on') {
	//	$('.sound-link-off').addClass('hiddenes');
		//$('.sound-link-on').removeClass('hiddenes');
	} else {
		//$('.sound-link-on').addClass('hiddenes');
        //$('.sound-link-off').removeClass('hiddenes');
	}


	$(document).on('click', '.sound-link-on', function(e) {
		e.preventDefault();

       // $(this).addClass('hiddenes');
      //  $('.sound-link-off').removeClass('hiddenes');

         sound = 'on';
        $.cookie('sound', 'on', { expires: 365 });
	});

	$(document).on('click', '.sound-link-off', function(e) {
		e.preventDefault();
       // $(this).addClass('hiddenes');
      //  $('.sound-link-on').removeClass('hiddenes');
      
		 sound = 'off';
        $.cookie('sound', 'off', { expires: 365 });
	});
	
	
	
	$(document).on('click', '#save-link', function() {
		var link = $('input[rel="get-trade-link"]').val();
		if (link.indexOf('https://steamcommunity.com/tradeoffer/new/?partner=') < 0) {
				var txt;
			if(getLang() == "ru") txt = '<div><div><strong>Ошибка</strong><br>Введите нормальную ссылку и попробуйте ещё раз</div></div>';
			else txt = '<div><div><strong>Error!</strong><br>Enter valid link</div></div>';
			noty({
	              text: txt,
	            layout: 'topRight',
	            type: 'error',
	            theme: 'relax',
	            timeout: 8000,
	            closeWith: ['click'],
	            animation: {
	                open: 'animated bounceInRight',
	                close: 'animated bounceOutRight'
	            }
	        });
		} else {
		socketIO.emit('1', {
				type: 1,
				steamId: getToken(),
				link: link,
				lsecure: lsecure
			});
			
			var txt;
			if(getLang() == "ru") txt = '<div><div><strong>Ссылка успешно сохранена</strong><br>Не забудьте открыть инвентарь чтобы получить выигрыш!</div></div>';
			else txt = '<div><div><strong>Trade link succesfully save!</strong><br>Dont forgot to open your inventory!</div></div>';


			noty({
	             text: txt,
				 layout: 'topRight',
	            type: 'success',
	            theme: 'relax',
	            timeout: 8000,
	            closeWith: ['click'],
	            animation: {
	                open: 'animated bounceInRight',
	                close: 'animated bounceOutRight'
	            }
	        });

	        $('.token-block.promo').addClass('hiddenes');

		}
		
	});
	


});

if(window.steam_user && window.steam_user.steamid){
	set_user_online(window.steam_user.steamid);
}





})(jQuery);



function build_user_inventory(steamid){
	if(steamid){
		var $items_container = $('#user_profile_items');
		$.ajax({
			type : "GET",
			url  : "/application/appClass.php?action=inventory&steamid="+steamid,
			dataType : "json",
			cache  : false,
			success : function(message){
				if(!message.error){
					$items_container.html('');
					var c =0;
					for(var i in message){
						if(message[i] && typeof message[i].name !== "undefined"){
							$items_container.append(get_item_template(message[i]));
							c++;
						}
					}
					var money =0;
					
					$('#moneys').each(function() {
   money += +this.textContent;
});

					$('.myvesh').tipsy({gravity: 's'}); 
					$('#items_count').text(c);
					$('#items_money').text(money);
				}else{
					alert(message.error);
				}
			}
		});
	}
}

function set_user_online(steam_id){
	if(steam_id && typeof steam_id !== "undefined"){
		$.ajax({
			type : "GET",
			url  : "/application/appClass.php?action=online&steamid="+steam_id,
			cache : false,
			success : function(message){
				setTimeout(function(){set_user_online(steam_id);},2000);
			}
		});
	}
}



function get_item_template(item){
	return '	<div class="south myvesh" original-title="'+item.name+'"><img src="http://steamcommunity-a.akamaihd.net/economy/image/'+item.icon_url+'/130fx90f/" alt="" title="" /><span id="moneys">'+item.price+'</span></div>';
}




function getWordNormal(num, str1, str2, str3) {var val = num % 100;if (val > 10 && val < 20) return num +' '+ str3;else {var val = num % 10;if (val == 1) return num +' '+ str1;else{if (val > 1 && val < 5) return num +' '+ str2;else return num +' '+ str3;}}}
	