
   <?php

session_start();
include('../steamauth/userInfo.php');
if($steamprofile['steamid'] == '76561198175661250'){
	$_SESSION['adm_login'] = 1;
}
?>
<?php

		if(!isset($_SESSION['adm_login'])){
			
			header("Location: /");
			
			
			?>
			
			
			
	<?php
		}else{

?>
<div class="leftbar">

		<div class="block">
			<div class="title">Навигация</div>
			<div class="menu">
				<ul>
					<li><a href="/admin/">Главная</a></li>
					<li><a href="/admin/users.php">Пользователи</a></li>
					<li><a href="/admin/sett.php">Настройки</a></li>
						<li><a href="/admin/console.php">Консоль</a></li>
			
				</ul>
			</div>
		</div>
		
		

		

		<div class="block chat">
<div class="scroll">
			<?php		
if(isset($_GET['delmsg'])){
	$connection = new MongoClient();
	$connection->selectDB('admin')->selectCollection('steam_chat')->remove(array('date' => $_GET['delmsg']));
	header("Location:/admin");
	exit();
}
if(isset($_GET['addtoban'])){
	$connection = new MongoClient();
	$connection->selectDB('admin')->selectCollection('chat_ban')->insert(array('steamid' => $_GET['addtoban']));
	header("Location:/admin");
	exit();
}
if(isset($_GET['removefromban'])){
	$connection = new MongoClient();
	$connection->selectDB('admin')->selectCollection('chat_ban')->remove(array('steamid' => $_GET['removefromban']));
	header("Location:/admin");
	exit();
}
$connection = new MongoClient();
$users = $connection->selectDB('admin')->selectCollection('steam_chat');
$ban_users = $connection->selectDB('admin')->selectCollection('chat_ban')->find();
$list_ban = array();
$list = array();
foreach($ban_users as $key => $value){
$list_ban[] = $value['steamid'];
}
?>
<?php
$list = array();
foreach($users->find()->sort(array('date' => -1)) as $key => $value)
{?>
				<div class="short">	
				<div class="top hidden">
				<div class="avatar left">
				<img src="<?=$value['user_avatar'];?>" alt="" title="">
				</div>
					<ul>	
				<li>IP : 	<?=$value['ip'];?>
			</li>
				
				</ul>	
				</div>
				<div class="top hidden">
				<div class="avatar left">
				<img src="<?=$value['user_avatar'];?>" alt="" title="">
				</div>
				<ul>	
				<li>
				<a class="user_title_linka" original-title="Перейти в профиль" href="/profile.php?steam_id=<?=$value['user_id'];?>" target="_blank">
				<?=htmlspecialchars($value['user_name']);?>
			</a>
				</li>
				<li><a href="/admin/index.php?delmsg=<?=$value['date'];?>">Удалить смс</a>   |   
				
				<?php
											if(!in_array($value['user_id'],$list_ban)){
												?>
													<a href="/admin/index.php?addtoban=<?=$value['user_id'];?>" >Добавить в бан</a>
												<?php
											}else{
												?>
												<a href="/admin/index.php?removefromban=<?=$value['user_id'];?>">Убрать из бана</a>
												<?php
											}
											?>
				
			</li>
				
				</ul>	
				</div>	
				<div class="message">
				<?=htmlspecialchars($value['user_message']);?>
				</div>
			
				
</div>
										
									<?php
									$list[] = $value;
										
								}
						
								
								
		
							?>
			
		</div>	</div>
		
		
			</div>	<?php
		}
	?>