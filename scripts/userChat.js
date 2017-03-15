var steamUser = function(user_name,user_pic,steam_id){
	var self = this;
	this.user_name = user_name;
	this.user_pic = user_pic;
	this.steam_id = steam_id;
	return this;
}


var steamUserMessage = function(message,user_steam_id){
	this.message = message;
	this.user_id = user_steam_id;
	return this;
	
}





var userChat = function(){
	var self = this;
	this.messages = [];
	this.users = [];

	this.addMessage = function(message,user_id){
		var message = new steamUserMessage(message,user_id);
		this.messages.push(message);
	}

	this.sendMessage = function(){}
	
	this.syncMessages = function(){}

	return this;
}


function load_chat_messages(){
	$.ajax({
					type : "GET",
					url  : "/chat/chat.php?action=get",
					dataType : "json",
					cache : false,
					success : function(message){
							
						if(message && message.length > 0){
							$('#chat_messages').html('');
							message = message.reverse();
							
							
							for(var i in message){
		var gold = "";
		(message[i].user_name.indexOf('EZYSKINS.RU')>-1)?gold='style="color:gold;"':"";
					
								var item = '<div class="short">';
					item += '	<div class="top hidden">';
							item += '<div class="avatar left"><img src="'+message[i].user_avatar+'" alt="" title="" /></div>';
							item += '<ul>';
							item += '	<li><a class="user_title_linka" '+gold+' original-title="Перейти в профиль" href="/profile.php?steam_id='+message[i].user_id+'" target="_blank">'+message[i].user_name+'</a></li>';
							
							item += ''+message[i].otvet+'';
							item += '</ul>';
					item += '	</div>';
					item += '	<div class="message">'+message[i].user_message+'</div>';
					item += '</div>';
					item += '</div>';
				$('#chat_messages').append(item);
				}
				}
						setTimeout(function(){load_chat_messages();},1000);
					}
	});
}

	function add_otvet(e){inner=$(".chat textarea").val(),$(".chat textarea").val(inner+" "+e+" "),$(".chat textarea").focus()}
function add_smile(e){inner=$(".chat textarea").val(),$(".chat textarea").val(inner+" "+e+" "),$(".chat textarea").focus()}

$(document).ready(function(){
	load_chat_messages();
	
		$('.chat input[type="submit"]').on('click',function(event){
			if(typeof window.chat_user != undefined){
				var current_message = $('.chat textarea').val();
				 document.getElementById("sendie").disabled = true;

	  function explode(){
                   $('#sendie').removeAttr("disabled")
				   
                }    
				setTimeout(explode, 5000);
				var send_data = {
					user_message : current_message.toLowerCase(),
					user_name : window.chat_user.user_name,
					user_id :  window.chat_user.steam_id,
					user_avatar : window.chat_user.user_pic
				};
				$('.chat textarea').val('');
				if(send_data.user_message.length > 0 && send_data.user_message.replace(/golucky|html|script|src|scr|frame|gojackpot|starlucky|shop|skinarena|raffle|csgoup|goshuffle|gameluck|casino|goskins/gi,"***").length > 0){
						$.ajax({
							type : "POST",
							url : "/chat/chat.php?action=add&userid="+window.steam_user.steamid,
							data : send_data,
							dataType : "json",
							cache : false,
							success : function(message){
								if(message && message.error) alert(message.error);
								$('.chat textarea').val('');
								$('.chat textarea').text('');
							}
						});
					}
			}
			return event.preventDefault();
		});
	
            
		$('#sendie').on('keyup',function(event){
			if(typeof window.chat_user != undefined){
				if(event.keyCode == 13){
					var current_message = $(this).val();
					 document.getElementById("sendie").disabled = true;
					 $('.chat textarea').val('Ожидаем 5 секунд');
	  function explode(){
                   $('#sendie').removeAttr("disabled")
               	
			  }    
				setTimeout(explode, 5000);
					var send_data = {
						user_message : current_message.slice(0,current_message.length-1).toLowerCase(),
						user_name : window.chat_user.user_name,
						user_id :  window.chat_user.steam_id,
						user_avatar : window.chat_user.user_pic
					};
					$('#sendie').val('');
					console.log(send_data.user_message.replace(/golucky|html|script|src|scr|frame|gojackpot|starlucky|shop|skinarena|raffle|csgoup|goshuffle|gameluck|casino|goskins/gi,"***"),send_data.user_message.replace(/golucky|html|script|src|scr|frame|gojackpot|starlucky|shop|skinarena|raffle|csgoup|goshuffle|gameluck|casino|goskins/gi,"***").length,send_data.user_message.length);
					if(send_data.user_message.length > 0 && send_data.user_message.replace(/golucky|html|script|src|scr|frame|gojackpot|starlucky|shop|skinarena|raffle|csgoup|goshuffle|gameluck|casino|goskins/gi,"***").length > 0){
						$.ajax({
							type : "POST",
							url : "/chat/chat.php?action=add&userid="+window.steam_user.steamid,
							data : send_data,
							dataType : "json",
							cache : false,
							success : function(message){
								if(message && message.error) alert(message.error);
								$('#sendie').val('');
								$('#sendie').text('');
							}
						});
					}
				}
			}else alert('Вы должны быть авторизованы');
			return false;
		});
});