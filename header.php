<?php
	if(isset($_SESSION["steamid"])) {

include_once('steamauth/userInfo.php');}
?>
<audio id="bet1-sound" src="/sounds/Stavka-1.mp3" preload="auto"></audio>
<audio id="bet2-sound" src="/sounds/Stavka-2.mp3" preload="auto"></audio>
<audio id="bet3-sound" src="/sounds/Stavka-3.mp3" preload="auto"></audio>
<audio id="start-game-sound" src="/sounds/start-game.mp3" preload="auto"></audio>
<audio id="rulette-sound" src="/sounds/rulette.wav" preload="auto"></audio>
<audio id="rulette-end" src="/sounds/5.mp3" preload="auto"></audio>
<audio id="click-sound-1" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-2" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-3" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-4" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-5" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-6" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-7" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-8" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-9" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="click-sound-10" src="/sounds/click.mp3" preload="auto"></audio>
<audio id="rulet" src="/sounds/rulet.mp3" preload="auto"></audio>

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

						include ('steamauth/userInfo.php');
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
						<li><a href="/myprofile.php"><?=$msg['my_profile']?></a></li>
						<li><a href="/settings.php"><?=$msg['my_set']?></a></li>
						<li><a href="/steamauth/logout.php"><?=$msg['my_out']?></a></li>
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



