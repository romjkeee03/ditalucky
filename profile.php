<?php
if(intval($_GET['steam_id']) == 0){
	die('Error load content,steamid incorrect');
}


?>
<?php include('head.php'); ?>
<?php include('header.php'); ?>
<div class="content">
<!-- <middle> -->
<?php include('left.php'); ?>

<?php  { 


/*calculate user profile data*/





$steam_id = (string)$_GET['steam_id'];
$connection = new MongoClient();
$collection = $connection->selectDB('admin')->selectCollection('gamedb');
$user_games = $collection->find(array('name' => 'history','allItems.steamid'=> $steam_id));


$countGames = 0;
$countGamesWinner = 0;
$countPercent = 0;
$itemsCount = 0;

$user_steam_name = false;
$profile_avatar = false; 

foreach($user_games as $key=>$value){
	
	$countGames ++;
	

	foreach($value['allItems'] as $itemIndex => $itemValue){
		if($itemValue['steamid'] == $steam_id){
			$user_steam_name = $itemValue['user'];
			$profile_avatar = $itemValue['ava'];
			$itemsCount ++;
		}
	}

	if($value['winnername'] == $user_steam_name){
		$countGamesWinner ++;
		$countPercent += floatval($value['winnerchance']);
	}

}


$date = time() - 18000;
$collection = $connection->selectDB('admin')->selectCollection('user_status_online');
$cursor = $collection->find(array('steamid' => $steam_id))->sort(array('date' => -1))->limit(1);
$online = false;
foreach($cursor as $key => $value){
	if($value['date'] > $date) $online = true;
}

include("../steamauth/settings.php");
 $urls = file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".$steamauth['apikey']."&steamids=".$steam_id); 
     $contents = json_decode($urls, true);
	 $filter = '/golucky|CSGOLINE.RU|CSGOIN|csgoin|WOODUPPERS|csgokill|CSGOKILL|wooduppers|cslots|CSLOTS|LOTS|lots|gl|GL|csgotrue|true|TRUE|CSGOTRUE|CSGONINJA|firecsgo|FIRECSGO|csgo|ticket|TICKET|CSGO|CSgetto|CSGOSELLER|CSGOEZY|csgoezy|CSGOWAR|uitems|CSGOSTART|csgostart|skinswin|SKINSWIN|csmonkey|CSMONKEY|CSGOCASE.PRO|CSGOUP|CSJACKPOT|CSGO-JAKPOT|CSLOTS|CSGO-FARM|html|script|src|scr|frame|gojackpot|starlucky|shop|skinarena|raffle|csgoup|goshuffle|gameluck|casino|DOTA2HOUSE|UITEMS|roulettecsgo|ROULETTECSGO|LUCKY-SKIN|lucky-skin|HARD-LUCKY|hard-lucky|JACKBEST|jackbets|FLL-LUCKY|fll-lucky|SKINBETS|skinbets|CSGOHOT|csgohot|csgo-chance|CSGO-CHANCE|CSGORISE|csgorise|CSFARM|csfarm|CATSKINS|catskins|mycsgoup|CSGOAMMO|MYCSGOUP|pro|farm|cslottery|CSGOVICTORY|goskins/';

	 

 $_SESSIONs['steam_personaname'] = htmlspecialchars(preg_replace($filter, '', $contents['response']['players'][0]['personaname']));
 	  $vip = '/EZYSKINS.RU|ezyskins.ru/';
 $_SESSIONs['steam_personaname'] = preg_replace($vip, 'VIP', $contents['response']['players'][0]['personaname']);

 $_SESSIONs['steam_avatarfull'] = $contents['response']['players'][0]['avatarfull'];

 $usersteamname = $_SESSIONs['steam_personaname'];
 $avatarfull['avatarfull'] = $_SESSIONs['steam_avatarfull'];



?>

<div id="steam_user_page_id" style="display:none"><?=$steam_id;?></div>
	<div class="rightbar">

		<div class="game-number"><?=$msg['My_profile']?></div>

		<div class="profile-info hidden">
			<div class="left-info left">
				<div class="top">
					<div class="avatar left"><img src="<?php echo $avatarfull['avatarfull'];  ?>" alt="" title="" /></div>
					<ul>
						<li original-title="<?php echo $usersteamname;  ?>"><?php echo $usersteamname;  ?></li>
						<li><?=$online ? 'в сети' : '';?></li>
						<!--<li>25</li>-->
					</ul>
				</div>
				<a  href="http://steamcommunity.com/profiles/<?=$steam_id;?>/"  target="_blank"><?=$msg['Go_to_page']?></a>
					<a href="/stat.php?id=<?=$steam_id;?>">история побед</a>
			</div>
			<div class="right-info right hidden">
				<div class="blanks"><?=$msg['Things']?> / <?=$itemsCount;?></div>
				<ul>
					<li><!--Звание: Всемирная элита--></li>
					<li><?=$msg['Win_a_victory']?> <?=$countGamesWinner;?></li>  
					<li><?=$msg['Coefficient']?> <?=ceil($countPercent/$countGamesWinner);?>%</li>
				<li><?=$msg['Number_Games']?>: <?=$countGames;?></li>
				</ul>
				<ul>
						<!--<li>Друзей онлайн: 65</li>-->
					<li><?=$msg['Plays ezyskins.ruツ']?></li>
				</ul>
			</div>
		</div>

		<div class="inform">
			<div class="text"><div><?=$msg['My inventory']?></div><?=$msg['zfes_tov']?></div>
			<div class="right">
				<div class="chance left"><?=$msg['Total_items']?>: <span id="items_count">0</span></div>
				<!--a href="#" class="add-item left"><?=$msg['Внести в игру']?></a-->
			</div>
		</div>

		<div class="profile-items hidden">
			<div class="scroll myinvenory" id="user_profile_items">
			
			

			</div>
		</div>

		<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>

	</div>

<!-- </middle> -->
	<div class="clear"></div>
</div>

</body>
</html>
 <?php }
            ?>