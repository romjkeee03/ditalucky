<?php include('head.php'); ?>
<?php include('header.php'); ?>
<div class="content">
<!-- <middle> -->
<?php include('left.php'); ?>

<?php if(!isset($_SESSION['steamid'])) {
	Header("Location: index.php");
} else { 
include ('steamauth/userInfo.php');

/*calculate user profile data*/

$steam_id = (string)$_SESSION['steamid'];
$connection = new MongoClient();
$collection = $connection->selectDB('admin')->selectCollection('gamedb');
$user_games = $collection->find(array('name' => 'history','allItems.steamid'=> $steam_id));


$countGames = 0;
$countGamesWinner = 0;
$countPercent = 0;
$itemsCount = 0;

$user_steam_name = false;


foreach($user_games as $key=>$value){
	
	$countGames ++;
	

	foreach($value['allItems'] as $itemIndex => $itemValue){
		if($itemValue['steamid'] == $steam_id){
			$user_steam_name = $itemValue['user'];
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

#die('Look: '.$user_steam_name);

?>


	<div class="rightbar">

		<div class="game-number"><?=$msg['my_profile'] ?></div>

		<div class="profile-info hidden">
			<div class="left-info left">
				<div class="top">
					<div class="avatar left"><img src="<?php echo $steamprofile['avatarfull'];  ?>" alt="" title="" /></div>
					<ul>
						<li original-title="<?php echo $steamprofile['personaname'];  ?>"><?php echo $steamprofile['personaname'];  ?></li>
						<li><?=$online ? 'в сети' : '';?></li>
						<li></li>
					</ul>
				</div>
				<a href="<?php echo $steamprofile['profileurl'];  ?>"  target="_blank"><?=$msg['Go_to_page']?></a>
				<a href="/stat.php?id=<?=$steam_id;?>">моя история</a>
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
					<li><?=$msg['Plays ezyskins.ruツ']?> </li>
				</ul>
			</div>
		</div>

		<div class="inform">
			<div class="text"><div><?=$msg['My inventory']?></div><?=$msg['zfes_tov']?></div>
			<div class="right">
				<div class="chance left"><?=$msg['Total_items']?>: <span id="items_count">0</span></div>
				<a href="#" class="add-item left"><?=$msg['Submit_a_game']?></a>
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