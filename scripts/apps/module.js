 jQuery(document).ready(function(){
 setTimeout(function(){
 $('a[original-title="Перейти в профиль"]:contains("EZYSKINS.RU")').each(function(){
    $(this).css('color','gold');
});
},1000);
 jQuery('body').append("<div class='scrolltotop'><div class='scrolltotop__side'></div><div class='scrolltotop__arrow'></div></div>");
 jQuery(window).scroll(function(){
 if (jQuery(this).scrollTop() > 350) {
 jQuery('.scrolltotop').fadeIn();
 } else {
 jQuery('.scrolltotop').fadeOut();
 }
 });
 jQuery('.scrolltotop').click(function(){
 jQuery("html, body").animate({ scrollTop: 0 }, 50);
 return false;
 });
 });0
 $(function() { 
 $('.north').tipsy({gravity: 'n'}); 
 $('.south').tipsy({gravity: 's'}); 
 $('.east').tipsy({gravity: 'e'}); 
 $('.west').tipsy({gravity: 'w'}); 
 	$('.user_title_linka').tipsy({gravity: 's'}); 	
  $('.rightbar .profile-info .left-info .top ul li:first-child').tipsy({gravity: 's'});
 }); 