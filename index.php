<?php include('head.php'); ?>
<?php include('header.php'); ?>

<div class="content">
<!-- <middle> -->

	
<?php include('left.php'); ?>


	

<div class="rightbar hiddenes" id="trade_link">


		<div class="settings-url hidden">
			<div class="left"><?=$msg['Enter_link_exchange']?></div>
			<div class="right">
				<input type="text" rel="get-trade-link" placeholder="Вставьте ссылку...">
				<input type="submit" id="save-link" value="">
				</div>
		</div>

		<div class="settings-text"><?=$msg['Attention!_make_your_inventory_visible_and_open to_all_as_well_as_being_enter_your_link_exchange.']?></div>
</div>


	<div class="rightbar" id="rightbar">


		<div class="game-number"><?=$msg['game'] ?> #<span class="game-num"></span></div>

		<div class="middle-game">
		<div class="settings-game">
				<div class="button">
					<div class="hollow"></div>
					<div class="sub">
						<div><?=$msg['sound_set'] ?></div>
						<a href="#" class="sound-link-on"><?=$msg['sound_on'] ?></a>
						<a href="#" class="sound-link-off"><?=$msg['sound_off'] ?></a>
					</div>
				</div>
			</div>
			<div class="timer"><?=$msg['do_start'] ?><div id="timer">00:00</div></div>
			<div class="progress">
				<div class="line" id="pb" style="width: 0%;"><span>&nbsp;</span></div>
			</div>
			<div class="sum">
				<div class="percent"><?=$msg['progress'] ?> - <span id="items-count-temps">0</span>%</div>
				<div class="dollar"><?=$msg['all_money']?>  - <span id="jackpot-temp">0</span></div>
			</div>
		</div>

		<div class="roulette hiddenes">
			<div class="inbox" style="-moz-transform: translate3d(390px, 0, 0);-ms-transform: translate3d(390px, 0, 0);-o-transform: translate3d(390px, 0, 0);-webkit-transform: translate3d(390px, 0, 0);transform: translate3d(390px, 0, 0); -moz-transition: 13s ease;-o-transition: 13s ease;-webkit-transition: 13s ease;transition: 13s ease; backface-visibility: hidden;">


			</div>
		</div>

		
				<?php if(isset($_SESSION['steamid'])) {

        ?>	<div class="inform">
			<div class="text"><div><?=$msg['you_vnes']?> <span id="player-items-count">0</span> из 20 <?=$msg['veshey']?></div><?=$msg['min_dep']?> <?=$msg['min-10rub']?> - <span id="currency"></span> <?=$msg['max_veshey']?> 20 <?=$msg['veshey']?></div>
			<div class="right">
				<div class="chance left"><?=$msg['you_chance']?>: <span id="chance-temp">0</span>%</div>
				<a href="https://steamcommunity.com/tradeoffer/new/?partner=247423293&token=rPMG_X4q" target="_blank" class="add-item left"><?=$msg['deposite']?></a>
			</div>
		</div>	<?php 

					}?>

	

		<div class="choice-winner gameend hiddenes">
			<div class="text"><div><?=$msg['pobedil_igrok']?>: <span id="winner-end">???</span> / <?=$msg['win_money']?>: <span class="winner-cost-value">???</span> / <?=$msg['win_tickets']?> <span id="winner-ticket"> ??? </span></div><?=$msg['win_ready']?></div>
			<?php if(isset($_SESSION['steamid'])) {

        ?>	<div class="right">
				<a href="https://steamcommunity.com/tradeoffer/new/?partner=247423293&token=rPMG_X4q" target="_blank" class="add-item left"><?=$msg['deposite_one']?></a>
			</div>	<?php 

					}?>
		</div>
		
		
<div class="added-short ">
<div class="game-end acceptoffer hiddenes">
 <div class="text"><div><?=$msg['Your_bid_accepted']?></div><?=$msg['Wait_your_bet_is_processed']?></div>
</div>
<div class="game-end maxitem hiddenes">
<div class="text"><div><?=$msg['Your_proposal_has_been_declined_by_the_exchange']?></div><?=$msg['Maximum_Delivered_items_20']?></div>
</div>
<div class="game-end notradelink hiddenes">
<div class="text"><div><?=$msg['Your_proposal_has_been_declined_by_the_exchange']?></div><?=$msg['Enter_a_reference_to_the_exchange_settings']?></div>
</div>
<div class="game-end errortrade hiddenes">
<div class="text"><div><?=$msg['Your_proposal_has_been_declined_by_the_exchange']?></div><?=$msg['The_minimum_rate_of_5_rubles']?></div>
</div>	
<div class="game-end game_end hiddenes">
<div class="text"><div><?=$msg['igra_offnik']?></div><?=$msg['chislo_raunda']?><span id="roundNum">0.0000000000</span></div>
</div>
<div class="game-end game_end hiddenes">
<div class="text"><div><?=$msg['igra_offnik']?></div><?=$msg['win_temssss']?><span id="winner-item"> ??? </span></div>
</div>
<div class="game-end pauses hiddenes">
<div class="text"><div>ПРОБЛЕМЫ СО СТИМОМ</div><span id="winner-item">поэтому мы на некоторое время отключили прием ставок</span></div>
</div>
</div>

<div class="swiper-container">
<div class="swiper-wrapper" style="cursor: -webkit-grab;">
<div ng-transclude="" class="swiper-slide users-add hidden" ></div>
</div>
</div>
<script type="text/javascript">
				var swiper = new Swiper('.swiper-container', {
					pagination: '.swiper-pagination',
					slidesPerView: 3,
					paginationClickable: true,
					spaceBetween: 0
				});
				</script>

<div class="added-short">
<div class="game-end gamepause hiddenes">
<div class="text"><div><?=$msg['igra_off']?></div><?=$msg['posled_stav']?></div>		
</div>
<div class="bg-shorts hiddenes" id="game">
</div></div>
<div class="game-start">

<div class="title"><?=$msg['igra_nach']?></div>
<div class="clear"></div>
<div class="fair"><?=$msg['chestn']?></div>

<div class="hash"><?=$msg['hash']?>: <span id="roundHash"></span></div>

</div>

<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>
</div>
<!-- </middle> -->
<div class="clear"></div>
</div>
</body>
</html>