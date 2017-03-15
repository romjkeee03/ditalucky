<script src="/scripts/jquery-1.7.2.js"></script>
<style>
.rightbar .tb4 input[type="text"] {
    background: #374756;
    border: 0 none;
    width: 560px;
    height: 41px;
    margin: 0;
    padding: 0 15px;
    font: 13px/42px 'Lato';
    color: #fff;
}
.rightbar input[type="submit"] {
      background: url('/styles/images/settings-url-submit.png') no-repeat;
    border: 0 none;
    width: 41px;
    height: 41px;
    position: absolute;
    margin-top: 7px;
    margin-left: -45px;
    cursor: pointer;
}
.rightbar div .info {    background: url('/styles/images/rightbar-short-info.png') no-repeat;
    width: 14px;
    height: 14px;
    position: absolute;
    margin-top: 0px;
    margin-left: -5px;
}
</style>
<script>
 $(function() { 
	
  $('.rightbar div .info').tipsy({gravity: 's'});
 }); 

</script>
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

<?php include('head.php'); ?>


<div class="content">
<!-- <middle> -->

	
<?php include('left.php'); ?>

<?php
		$connection = new MongoClient();
		$collection = $connection->selectDB('admin')->selectCollection('setting');
		$list = $collection->find();
		$steam_list = array();
		
		foreach($list as $key => $value){
			$minDeposite = $value['minDeposite'];
			$gameDuration = $value['gameDuration'];
			$userstoStart = $value['userstoStart'];
			$usersItemsLimit = $value['usersItemsLimit'];
			$fee = $value['fee'];
			$commissionHistory = $value['commissionHistory'];
			$commissionType = $value['commissionType'];
			$currency = $value['currency'];
			$historyCommission = $value['historyCommission'];
		}
		
		
	
	$m = new MongoClient();
$c = $m->admin->setting;
$c->drop();

$document = array(
    '_id' => new MongoId('55db000f03334b1559db5970'),
    'minDeposite' => $minDeposite,
	'gameDuration' => $gameDuration,
	'userstoStart ' => $userstoStart,
	'usersItemsLimit' =>   $usersItemsLimit,
	'fee' =>   $fee,
	'commissionHistory' =>   $commissionHistory,
	'commissionType' =>   $commissionType,
	'currency' =>   $currency,
	'historyCommission' =>   $historyCommission
);

$c->insert($document);
if(isset($_POST['minD'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('minDeposite' => $_POST['minD']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}
if(isset($_POST['gameD'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('gameDuration' => $_POST['gameD']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}
if(isset($_POST['userst'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('userstoStart' => $_POST['userst']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}
if(isset($_POST['usersI'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('usersItemsLimit' => $_POST['usersI']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}if(isset($_POST['currency'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('currency' => $_POST['currency']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}if(isset($_POST['fee'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('fee' => $_POST['fee']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}
if(isset($_POST['commissionHistory'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('commissionHistory' => $_POST['commissionHistory']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}
if(isset($_POST['commissionType'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('commissionType' => $_POST['commissionType']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}
if(isset($_POST['historyCommission'])){
$c->update(
    array('_id' => $document['_id']),
    array('$set' => array('historyCommission' => $_POST['historyCommission']))
);
var_dump($c->findOne());		
header("Location:/admin/sett.php");
exit();		
}	

	?>


<div class="rightbar" id="rightbar">
<div class="game-number">Настройки</div>
<div class="table">
<div class="topss">

<div class="list">				
<div class="tb1" style="width: 2%;">&nbsp;</div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>				
<div class="tb4">&nbsp;</div>				
<div class="tb5" style="
    font-size: 15px;      white-space: nowrap;                              
    width: 20%;
">&nbsp;</div>			
</div>
<!-- начало -->
<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E;  height: 68px;">				
<div class="tb1" style="width: 20%;">Минимальный депозит<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Минимальный депозит для юзера"></div>
<form action="" method="post">
<input type="text" name="minD" value='<?=$minDeposite;?>'>
<input type="submit" value="">	
</form>	
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E;  height: 68px;">				
<div class="tb1" style="width: 20%;">Длительность игры<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Длительность игры в секундах"></div>
<form action="" method="post">
<input type="text" name="gameD" value='<?=$gameDuration;?>'>
<input type="submit" value="">		
</form>	
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E;  height: 68px;">				
<div class="tb1" style="width: 20%;">Количество юзеров<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Количество юзеров необходимое для старта игры"></div>
<form action="" method="post">
<input type="text" name="userst" value='<?=$userstoStart;?>'>
<input type="submit" value="">	
	</form>	
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E;  height: 68px;">				
<div class="tb1" style="width: 20%;">Лимит предметов<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Лимит предметов которые может скидывать юзер в одну игру"></div>
<form action="" method="post">
<input type="text" name="usersI" value='<?=$usersItemsLimit;?>'>
<input type="submit" value="">		
</form>	
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E;  height: 68px;">				
<div class="tb1" style="width: 20%;">Тип валюты<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Тип валюты 0 - USD, 5 - RUR"></div>
<form action="" method="post">
<input type="text" name="currency" value='<?=$currency;?>'>
<input type="submit" value="">
</form>			
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E; height: 68px;">				
<div class="tb1" style="width: 20%;">Комиссия на выигрыше<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Комиссия на выигрыше (от 0 до 1 дробное - процент)"></div>
<form action="" method="post">
<input type="text" name="fee" value='<?=$fee;?>'>
<input type="submit" value="">	
</form>		
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E; height: 68px;">				
<div class="tb1" style="width: 20%;">Тип комиссии<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Комиссия 0 - если со всего банка, 1 - если с прибыли"></div>
<form action="" method="post">
<input type="text" name="commissionType" value='<?=$commissionType;?>'>
<input type="submit" value="">	
</form>		
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E; height: 68px;">				
<div class="tb1" style="width: 20%;">Комиссия в истории<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="В истории выводим все предметы - 0, с комиссией - 1"></div>
<form action="" method="post">
<input type="text" name="commissionHistory" value='<?=$commissionHistory;?>'>
<input type="submit" value="">
</form>			
</div>	
<div class="tb5">&nbsp;</div>		
</div>

<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E; height: 68px;">				
<div class="tb1" style="width: 20%;">Комиссия в истории<span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="font-size: 15px;white-space: nowrap; width: 20%;margin-top: 6px;">
<div class="info" original-title="Комиссия 0 если пишем без комиссии, 1 если с комиссией"></div>
<input type="text" name="historyCommission" value='<?=$historyCommission;?>'>
<input type="submit" value="">		
</div>	
<div class="tb5">&nbsp;</div>		
</div>

</div>
</div>

<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>
</div>
<!-- </middle> -->
<div class="clear"></div>
</div>
</body>
</html>
			<?php
		}
	?>