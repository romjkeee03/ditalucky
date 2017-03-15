<? 
require('../steamauth/steamauth.php');
?>
<html ng-app="gameApp">
<head>
<meta charset="utf-8">
<title> DOTA-WINS.RU - Проверь свою удачу! </title>
<meta name="keywords" content="">
<meta name="description" content="">
<script src="/scripts/jquery-1.7.2.js"></script>
<script src="/scripts/jquery.noty.packaged.min.js"></script>
<script src="/scripts/jquery.cookie.js"></script>
<script src="/scripts/jquery-tipsy.js"></script>
<script src="/scripts/smooth-scroll.js"></script>
<script src="/scripts/apps/module.js"></script>
<script src="/scripts/apps/jquery-ui.js"></script>
<script src="/scripts/swiper.min.js"></script>
<link rel="stylesheet" href="/styles/styles.css">
<link rel="stylesheet" href="/styles/fonts.css">
<link rel="stylesheet" href="/styles/widgets.css">
<link rel="stylesheet" href="/styles/swiper.min.css"">

</head>
<body>

<header>

	<div class="top">
		<div class="width">

			<a href="/" class="logotype left"></a>
<a href="/ru.php"><img class="flag" src="/styles/images/ruRU.png" title="смена языка"></a>
<a href="/en.php"><img class="flag" src="/styles/images/enGB.png" title="switch language"></a>
				
				<?php if(!isset($_SESSION['steamid'])) {

        ?>
			
	<a href="logger.php?login" class="login login-link right"><?=$msg['login']?></a>
			
					 <?php } else { 

						include ('../steamauth/userInfo.php');
						?>
						
						<div class="profile" style="display:none;">

							<?php echo "<img src=\"".$steamprofile['avatarfull']."\" class=\"avatar\">";

							echo "<div class=\"nickname\">". $steamprofile['personaname'] ."</div>";

							echo "<div class=\"logout\"><a href=\"steamauth/logout.php\">".$msg['my_out']."</a></div>";?>

							<div class="getlink"><a target="_blank" href="http://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url">Получить ссылку на обмен</a></div>

						</div>
			
			<div class="profile right">
				<div class="avatar left"><img src="<?php echo $steamprofile['avatarfull'];  ?>" alt="" title="" /></div>
				<div class="name left"><?=$msg['hi']?>, <?php echo $steamprofile['personaname'];  ?></div>
				<div class="menu left">
					<div class="hollow"></div>
					<ul>
						
						<li><a href="/steamauth/logout.php">Выйти</a></li>
						<!--a href="#" id="top">Страница 2</a-->
					</ul>
				</div>
			</div>
			
			
						<div hidden id="steamtoken"><?php				
						function generateRandomString($length = 10) {
							$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
							$charactersLength = strlen($characters);
							$randomString = '';
							for ($i = 0; $i < $length; $i++) {
								$randomString .= $characters[rand(0, $charactersLength - 1)];
							}
							return $randomString;
						}
						$rstr = generateRandomString(32);
						$m = new MongoClient("mongodb://localhost:27017");
						$db = $m->admin;
						$collection = $db->auth;
						$document = array( "userid" => $_SESSION['steamid'] );
						$collection->remove($document);
						$document = array( "userid" => $_SESSION['steamid'], "token" => $rstr );
						$collection->insert($document);
						echo $rstr;
						?></div>

					
						

						<div hidden id="steamid"><?php echo $steamprofile['steamid'];?></div>
						
						

						

						<?php 

					}?>
			

		</div>
	</div>

	<div class="clear"></div>

</header>



