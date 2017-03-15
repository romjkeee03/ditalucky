<? 

require('steamauth/steamauth.php');
?>

<html ng-app="gameApp">
<head>
<meta charset="utf-8">
<title> DOTA-WINS.RU - Проверь свою удачу! </title>
<meta name="keywords" content="">
<meta name="description" content="">
<script src="scripts/jquery-1.7.2.js"></script>
<script src="scripts/socket.io-1.3.5.js"></script>
<script src="scripts/jquery.noty.packaged.min.js"></script>
<script src="scripts/jquery.cookie.js"></script>
<script src="scripts/jquery-tipsy.js"></script>
<script src="scripts/apps/app.js"></script>
<script src="scripts/userChat.js"></script>
<script src="scripts/smooth-scroll.js"></script>
<script src="scripts/emoji.js"></script>
<script src="scripts/apps/module.js"></script>
<script src="scripts/apps/jquery-ui.js"></script>
<script src="scripts/swiper.min.js"></script>
<link rel="stylesheet" href="/styles/styles.css">
<link rel="stylesheet" href="/styles/fonts.css">
<link rel="stylesheet" href="/styles/widgets.css">
<link rel="stylesheet" href="/styles/swiper.min.css"">
<?php
if(isset($_SESSION["steamid"])) {
	include_once('steamauth/userInfo.php');
		$connection = new MongoClient();
		$collection = $connection->selectDB('admin')->selectCollection('site_users');
		$list = $collection->find();
		$steam_list = array();
		foreach($list as $key => $value){
			$steam_list[] = $value['steamid'];
		}

		if(!in_array($_SESSION['steamid'],$steam_list)){
			$collection->save(array('steamid' => $_SESSION['steamid'],'name' => $_SESSION['steam_personaname'],'ip' => $_SERVER['REMOTE_ADDR']));
		}

	?>
	<script type="text/javascript">
		window.steam_user = <?php echo json_encode($steamprofile);?>;
		window.chat_user = new steamUser(window.steam_user.personaname,window.steam_user.avatarfull,window.steam_user.steamid);
	</script>
	<?php
}
?>
</head>
<body>

<?php
if(!isset($_COOKIE['lang'])) {
	setcookie("lang","ru",2147485547);
	$lang = "ru";
} else $lang = $_COOKIE["lang"];
if($lang == "ru") include ("lang_ru.php");
else if($lang == "en") include ("lang_en.php");
					echo '<div hidden id="lang">'.$lang.'</div>'
?>
<audio id="start-roule-sound" src="/sounds/cykcyk.wav" preload="auto"></audio>
