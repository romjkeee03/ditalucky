<?

if(intval($_GET['id']) == 0){
	header("Location: /");
}


?>
<?php include('head.php'); ?>
<?php include('header.php'); ?>

<div class="content">
<!-- <middle> -->

	
<?php include('left.php'); ?>



<?php  

include ('steamauth/userInfo.php');
$steamid = (string)$_GET['id'];
$connection = new MongoClient();
$collection = $connection->selectDB('admin')->selectCollection('gamedb');
$games = $collection->find(array('name' => 'history' , 'steamid' => $steamid))->sort(array('date' => -1));



?>
	
	<div class="rightbar" id="rightbar">


		<div class="game-number">Смотреть историю</div>
<div class="settings-info">
			<div>История игрока</div>
			<div>История победных игр</div>
		</div>
		
		
				
<?php
$list = array();






foreach($games as $key=>$value){
	

		
$filter = '/golucky|CSGOLINE.RU|CSGOIN|csgoin|WOODUPPERS|csgokill|kill|CSGOKILL|KILL|wooduppers|cslots|CSLOTS|LOTS|lots|gl|GL|csgotrue|true|TRUE|CSGOTRUE|CSGONINJA|firecsgo|FIRECSGO|csgo|ticket|TICKET|CSGO|CSgetto|CSGOSELLER|CSGOEZY|csgoezy|CSGOWAR|uitems|CSGOSTART|csgostart|skinswin|SKINSWIN|csmonkey|CSMONKEY|CSGOCASE.PRO|CSGOUP|CSJACKPOT|CSGO-JAKPOT|CSLOTS|CSGO-FARM|html|script|src|scr|frame|gojackpot|starlucky|shop|skinarena|raffle|csgoup|goshuffle|gameluck|casino|DOTA2HOUSE|UITEMS|roulettecsgo|ROULETTECSGO|LUCKY-SKIN|lucky-skin|HARD-LUCKY|hard-lucky|JACKBEST|jackbets|FLL-LUCKY|fll-lucky|SKINBETS|skinbets|CSGOHOT|csgohot|csgo-chance|CSGO-CHANCE|CSGORISE|csgorise|CSFARM|csfarm|CATSKINS|catskins|mycsgoup|CSGOAMMO|MYCSGOUP|pro|farm|cslottery|CSGOVICTORY|goskins/';
$hash = $value['hash'];

$list_ban[] = $value['steamid'];
		
?>
<div class="histoty-short">
<div class="top">
<div class="avatar left">
<a href="/profile.php?steam_id=<?=$steamid;?>" target="_blank">
<img src="<?=$value['winnerimg'];?>" alt="" title=""></a></div>				
<ul>
<li><a original-title="Перейти в профиль" href="/profile.php?steam_id=<?=$steamid;?>" target="_blank">
<?=htmlspecialchars(preg_replace($filter, '*',$value['winnername']));?></a></li>					
<li>Выигрыш: <?=$value['winnermoney'];?> руб.</li>					<li>Шанс: <?=$value['winnerchance'];?>%</li>				
</ul>				<div class="number">Игра #<?=$value['game'];?></div>
<div class="blanks">ХЭШ РАУНДА: <?php echo $hash;?></div>		
</div>			
<div class="items hidden">	
<?php 

foreach($value['allItems'] as $itemIndex => $itemValue){
	
		
	
	?>			
<div class="south" original-title="<?=$itemValue['itemname'];?>" style="border:1px solid <?=$itemValue['background_color'];?>">
<a class="history-item-prize">							
<img src="http://steamcommunity-a.akamaihd.net/economy/image/<?=$itemValue['image'];?>/85fx70f" alt="image">
</a><span><?=round($itemValue['cost'] , 2);?> руб.</span></div><?php 
	}?>
</div>
	</div>
	<?php 
		$list[] = $value;
	}
	?>	

		<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>

	</div>

<!-- </middle> -->
	<div class="clear"></div>
</div>

</body>
</html>