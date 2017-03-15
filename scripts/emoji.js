/*
	Emoji
	Author: Andrey Goglev
	Copyright: KabulJan LTD. (c) 2015
*/

var Emoji = {
	inited: {},
	init: function(){
		var _e = Emoji;
		KJ('body').append('<div class="emoji_box no_select" onmouseover="Emoji.overBox(event)" onmouseout="Emoji.outBox(event)">\
			<div class="emoji_scroll_wrap">\
				<div id="emoji_list" class="bsbb"></div>\
				<div class="scroll_slider_wrap"><div class="scroll_slider"></div></div>\
			</div>\
			<div class="emoji_arrow"></div>\
		</div>');
		_e.box = KJ('.emoji_box');
		_e.page = 0;
		var wrap = KJ('.emoji_scroll_wrap'),
			wrap_h = 182,
			cont = KJ('#emoji_list'),
			slider = KJ('.emoji_box .scroll_slider'),
			win = KJ(window);

		KJ('.emoji_scroll_wrap').bind('mousewheel', function(e){
			cancelEvent(e);

			var max_top = cont[0].scrollHeight - wrap_h,
				st = win.scrollTop(),
				wheel_offset = is_mac ? cont.position().top - (e.wheelDelta) : cont.position().top + e.wheelDelta,
				top = Math.min(0, Math.max(-max_top, wheel_offset)),
				slider_top = Math.floor(Math.abs(top) / max_top * 100);

			cont.css('top', top+'px');
			slider.css('top', slider_top + 'px');
		});
		var win = KJ(window);
		slider.bind('mousedown', function(e){

			wrap.addClass('drag');

			removeTimer('emoji_hide');
			_e.startDragSlider = true;

			var st = win.scrollTop(), start = slider.position().top, h = slider.height(), ctop, ch = cont.height();
			function Move(e1){
				var top = Math.max(0, Math.min(wrap_h - h, ((start + e1.pageY) - e.pageY)));
				slider.css('top', top+'px');
				ctop = Math.abs(top) / wrap_h * 100;
				ctop = -Math.floor(ctop  * ch / 100);
				cont.css('top', ctop+'px')
			}
			function Up(e2){
				win.unbind('mousemove', Move).unbind('mouseup', Up);
				wrap.removeClass('drag');
				_e.startDragSlider = false;

				var hovered = KJ('.emoji_box:hover');
				if(!hovered.length) Emoji.outBox(e2);
			}
			Move(e);
			win.unbind('mousemove', Move).unbind('mouseup', Up).bind('mousemove', Move).bind('mouseup', Up);
			cancelEvent(e);
		});
		_e.init_end = true;
		if(_e.pending){
			_e.showBox(_e.pending[0], _e.pending[1]);
			_e.pending = null;
		}
	},
	checkScroll: function(){
		var wrap = KJ('.emoji_scroll_wrap').height(), cont = KJ('#emoji_list')[0].scrollHeight;
		if(cont > wrap){
			KJ('.emoji_box .scroll_slider_wrap').show();
			KJ('.emoji_box .scroll_slider').css('height', ( (wrap / cont) * 100 )+'%');
		}else KJ('.emoji_box .scroll_slider_wrap').hide();
	},
	emojiRegEx: /((?:[\uE000-\uF8FF\u270A-\u2764\u2122\u231B\u25C0\u25FB-\u25FE\u2615\u263a\u2648-\u2653\u2660-\u2668\u267B\u267F\u2693\u261d\u26A0-\u26FA\u2708\u2702\u2601\u260E]|[\u2600\u26C4\u26BE\u23F3\u2705\u2764]|[\uD83D\uD83C][\uDC00-\uDFFF]|\uD83C[\uDDE6-\uDDFF]\uD83C[\uDDE6-\uDDFF]|[0-9]\u20e3|[\u200C\u200D])+)/g,
	findCodes: function(str){
		var pos = 0, code, out = '', symb;

		while(code = str.charCodeAt(++pos)) {
			symb = str.charCodeAt(pos - 1).toString(16).toUpperCase();
			if(symb != 'D83D' && symb != 'D83C') symb = '';
			out += Emoji.getEmojiHtml(symb + code.toString(16).toUpperCase(), str.substr(pos - 1, 2));
			pos++;
		}
		return out;
	},
	old_smiles: {'D83DDE0A': [0, ':-)'], 'D83DDE03': [1, ':-D'], 'D83DDE09': [2, ';-)'], 'D83DDE06': [3, 'xD'], 'D83DDE1C': [4, ';-P'], 'D83DDE0B': [5, ':-p'], 'D83DDE0D': [6, '8-)'], 'D83DDE0E': [7, 'B-)'], 'D83DDE12': [8, ':-('], 'D83DDE0F': [9, ';-]'], 'D83DDE14': [10, '3('], 'D83DDE22': [11, ':\'('], 'D83DDE2D': [12, ':_('], 'D83DDE29': [13, ':(('], 'D83DDE28': [14, ':o'], 'D83DDE10': [15, ':|'], 'D83DDE0C': [16, '3-)'], 'D83DDE20': [17, '>('], 'D83DDE21': [18, '>(('], 'D83DDE07': [19, 'O:)'], 'D83DDE30': [20, ';o'], 'D83DDE33': [21, '8|'], 'D83DDE32': [22, '8o'], 'D83DDE37': [23, ':X'], 'D83DDE1A': [24, ':-*'], 'D83DDE08': [25, '}:)'], '2764': [26 , '<3'], 'D83DDC4D': [27, ':like:'], 'D83DDC4E': [28, ':dislike:'], '261D': [29, ':up:'], '270C': [30, ':v:'], 'D83DDC4C': [31, ':ok:']},
	regExpOld: {'D83DDE0A': /(:-\))([\s\.,]|$)/g, 'D83DDE03': /(:-D)([\s\.,]|$)/g, 'D83DDE1C': /(;-[PÐ])([\s\.,]|$)/g, 'D83DDE0B': /(:-[pð])([\s\.,]|$)/g, 'D83DDE12': /(:-\()([\s\.,]|$)/g, '263A': /(:-?\])([\s\.,]|$)/g, 'D83DDE0F': /(;-\])([\s\.,]|$)/g, 'D83DDE14': /(3-?\()([\s\.,]|$)/g, 'D83DDE22': /(:&#039;\()([\s\.,]|$)/g, 'D83DDE2D': /(:_\()([\s\.,]|$)/g, 'D83DDE29': /(:\(\()([\s\.,]|$)/g, 'D83DDE10': /(:\|)([\s\.,]|$)/g, 'D83DDE21': /(&gt;\(\()([\s\.,]|$)/g, 'D83DDE1A': /(:-\*)([\s\.,]|$)/g, 'D83DDE08': /(\}:\))([\s\.,]|$)/g, 'D83DDC4D': /(:like:)([\s\.,]|$)/g, 'D83DDC4E': /(:dislike:)([\s\.,]|$)/g, '261D': /(:up:)([\s\.,]|$)/g, '270C': /(:v:)([\s\.,]|$)/g, 'D83DDC4C': /(:ok:|:îê:)([\s\.,]|$)/g},
	all_smiles: ['D83DDE0A', 'D83DDE03', 'D83DDE09', 'D83DDE06', 'D83DDE1C', 'D83DDE0B', 'D83DDE0D', 'D83DDE0E', 'D83DDE12', 'D83DDE0F', 'D83DDE14', 'D83DDE22', 'D83DDE2D', 'D83DDE29', 'D83DDE28', 'D83DDE10', 'D83DDE0C', 'D83DDE04', 'D83DDE07', 'D83DDE30', 'D83DDE32', 'D83DDE33', 'D83DDE37', 'D83DDE02', '2764', 'D83DDE1A', 'D83DDE15', 'D83DDE2F', 'D83DDE26', 'D83DDE35', 'D83DDE20',  'D83DDE21', 'D83DDE1D', 'D83DDE34', 'D83DDE18', 'D83DDE1F', 'D83DDE2C', 'D83DDE36', 'D83DDE2A', 'D83DDE2B', '263A', 'D83DDE00', 'D83DDE25', 'D83DDE1B', 'D83DDE16', 'D83DDE24', 'D83DDE23', 'D83DDE27', 'D83DDE11', 'D83DDE05', 'D83DDE2E', 'D83DDE1E', 'D83DDE19', 'D83DDE13', 'D83DDE01', 'D83DDE31', 'D83DDE08', 'D83DDC7F', 'D83DDC7D', 'D83DDC4D', 'D83DDC4E', '261D', '270C', 'D83DDC4C', 'D83DDC4F', 'D83DDC4A', '270B', 'D83DDE4F', 'D83DDC43', 'D83DDC46', 'D83DDC47', 'D83DDC48', 'D83DDCAA', 'D83DDC42', 'D83DDC8B', 'D83DDCA9', '2744', 'D83CDF4A', 'D83CDF77', 'D83CDF78', 'D83CDF85', 'D83DDCA6', 'D83DDC7A', 'D83DDC28', 'D83DDD1E', 'D83DDC79', '26BD', '26C5', 'D83CDF1F', 'D83CDF4C', 'D83CDF7A', 'D83CDF7B', 'D83CDF39', 'D83CDF45', 'D83CDF52', 'D83CDF81', 'D83CDF82', 'D83CDF84', 'D83CDFC1', 'D83CDFC6', 'D83DDC0E', 'D83DDC0F', 'D83DDC1C', 'D83DDC2B', 'D83DDC2E', 'D83DDC03', 'D83DDC3B', 'D83DDC3C', 'D83DDC05', 'D83DDC13', 'D83DDC18', 'D83DDC94', 'D83DDCAD', 'D83DDC36', 'D83DDC31', 'D83DDC37', 'D83DDC11', '23F3', '26BE', '26C4', '2600', 'D83CDF3A', 'D83CDF3B', 'D83CDF3C', 'D83CDF3D', 'D83CDF4B', 'D83CDF4D', 'D83CDF4E', 'D83CDF4F', 'D83CDF6D', 'D83CDF37', 'D83CDF38', 'D83CDF46', 'D83CDF49', 'D83CDF50', 'D83CDF51', 'D83CDF53', 'D83CDF54', 'D83CDF55', 'D83CDF56', 'D83CDF57', 'D83CDF69', 'D83CDF83', 'D83CDFAA', 'D83CDFB1', 'D83CDFB2', 'D83CDFB7', 'D83CDFB8', 'D83CDFBE', 'D83CDFC0'],
	toHtml: function(str, opts){
		if(!opts) opts = {};

		str = str.replace(Emoji.emojiRegEx, Emoji.findCodes).replace(/\uFE0F/g, '');

		str = str.replace(/&nbsp;/g, ' ').replace(/<br>/g, "\n");
		for (var code in Emoji.regExpOld) {
			str = str.replace(Emoji.regExpOld[code], function(match, smile, space) {
				return Emoji.getEmojiHtml(code) + (space || '', smile);
			});
		}

		str = str.replace(/\n/g, '<br>');

		if(opts.to_back) return str;
		document.getElementById('output').innerHTML = str;
	},
	getEmojiHtml: function(code, alt){
		if(!alt) alt = this.toChar(code);
		if(Emoji.old_smiles[code]){
			var shift = Emoji.old_smiles[code][0] * 17;
			return '<img src="/img/white.gif" emoji="'+code+'" emoji_char="'+alt+'" class="old_emoji" style="background-position: 0px -'+shift+'px;" alt="'+alt+'"/>';
		}
		return '<img src="/img/emoji/'+code+'.png" emoji="'+code+'" class="emoji" emoji_char="'+alt+'"/>';
	},
	toChar: function(code){
  		var len = code.length / 4,
			chr = '',
			i = 0;

  		while(len--) {
    		chr += String.fromCharCode(parseInt(code.substr(i, 4), 16))
    		i += 4;
  		}
 		return chr;
	},
	showBox: function(opts, noshow){
		var _e = Emoji;

		if(!_e.init_end){
			_e.pending = [opts, noshow];
			return;
		}

		_e.area = opts.area;
		_e.show_but = KJ(opts.show_but);

		var offset = _e.show_but.offset();
		if(!opts.shift) opts.shift = [0,0];//left, top

		_e.opts = opts;
		delete _e.opts.no_show;

		offset.left += opts.shift[0];
		offset.top -= opts.shift[1];

		offset.top -= _e.box.height();
		offset.left -= _e.box.width();

		if(!_e.inited[opts.area]){
			_e.inited[opts.area] = true;

			KJ('#'+_e.area).bind('keydown', _e.onKeyDown).bind('blur', _e.onBlur);
			KJ(_e.show_but).bind('mouseover', _e.overBox).bind('mouseout', _e.outBox);
		}
		if(noshow) return;

		_e.box.addClass('anim').addClass('shown').css('left', offset.left + 'px').css('top', offset.top + 'px');

		setTimeout(function(){
			_e.box.removeClass('anim');
		}, 200);

		if(_e.page == 0){
			_e.showMore();
			KJ('#emoji_list .item:first').addClass('over');
		}
	},
	hide: function(){
		var _e = Emoji;
		_e.box.removeClass('shown').css('left', '-9999999px');
	},
	showMore: function(){
		var res = '', _e = Emoji, range = _e.all_smiles.slice(_e.page * 70, 170);
		for(var i = 0; i < range.length; i++) res += '<div class="item" onmouseover="Emoji.emoOver(this);" onmousedown="Emoji.select(this, event, \''+range[i]+'\'); return cancelEvent(event);" onClick="return cancelEvent(event);">'+_e.getEmojiHtml(range[i])+'</div>';
		KJ('#emoji_list').append(res);
		_e.page++;
		_e.checkScroll();
	},
	emoOver: function(el){
		KJ('#emoji_list .item.over').removeClass('over');
		KJ(el).addClass('over');
	},
	select: function(el, e, code){
		var _e = Emoji,
			sel = window.getSelection ? window.getSelection() : false,
			elem = ge(_e.area),
			rCont = false;

		if(sel && sel.rangeCount){
			r = sel.getRangeAt(0);
			var rCont = r.commonAncestorContainer ? r.commonAncestorContainer : r.parentElement ? r.parentElement() : r.item(0);
		}

		el = rCont;
      	while(el && el != elem) el = el.parentNode;

      	var edLast = (elem.lastChild || {});
      	if(!el) _e.setFocus();
      	document.execCommand('insertHTML', false, ' '+_e.getEmojiHtml(code)+'&nbsp;');
	},
	setFocus: function(){
		var el = ge(this.area);
		if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
    		var sel = window.getSelection();
      		var r = document.createRange();
       	 	r.selectNodeContents(el);
      		r.collapse(false);
      		var sel = window.getSelection();
      		sel.removeAllRanges();
      		sel.addRange(r);
  		}else if (typeof document.body.createTextRange != 'undefined') {
    		var tr = document.body.createTextRange();
    		tr.moveToElementText(obj || el);
    		tr.collapse(false);
    		tr.select();
  		}
	},
	clear: function(){
		this.inited = {};
	},
	onKeyDown: function(e){
		var _e = Emoji;
		if(e.keyCode == 9){// tab
			if(_e.box.hasClass('shown')) _e.hide();
			else _e.showBox(_e.opts);
			cancelEvent(e);
		}
	},
	onBlur: function(e){
		Emoji.hide();
	},
	overBox: function(e){
		removeTimer('emoji_hide');
		Emoji.showBox(Emoji.opts);
	},
	outBox: function(e){
		addTimer('emoji_hide', function(){
			if(Emoji.startDragSlider) return;
			Emoji.hide();
		}, 300);
	},
	getVal: function(cont){
		if(!cont) return '';
		var el = cont.firstChild;
		var v = '', contTag = new RegExp('^(DIV|P|LI|OL|TR|TD|BLOCKQUOTE)$');
		while (el) {
			switch (el.nodeType) {
				case 3:
        			var str = el.data.replace(/^\n|\n$/g, ' ').replace(/[\n\xa0]/g, ' ').replace(/[ ]+/g, ' ');
        			v += str;
        			break;
      			case 1:
      				var str = Emoji.getVal(el);
      				if (el.tagName && el.tagName.match(contTag) && str) {
      					if (str.substr(-1) != '\n') str += '\n';
      					var prev = el.previousSibling;
      					while(prev && prev.nodeType == 3 && KJ.trim(prev.nodeValue) == '')  prev = prev.previousSibling;
          				if (prev && !(prev.tagName && prev.tagName.match(contTag))) str = '\n' + str;
      				} else if (el.tagName == 'IMG'){
      					str += el.getAttribute('emoji_char');
      				}else if (el.tagName == 'BR') str += '\n';
      				v += str;
      			break;
			}
			el = el.nextSibling;
		}
		return v;
	}
};

try{ stManager.done('al/emoji.js'); }catch(e){ }