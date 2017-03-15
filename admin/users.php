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
</style>
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
$users = $connection->selectDB('admin')->selectCollection('users')->find(array('type' => 'trade-link'));




?>


<div class="rightbar" id="rightbar">
<div class="game-number">Пользователи</div>
<div class="table">
<div class="topss">
<div class="list">				
<div class="tb1" style="width: 2%;">&nbsp;</div>				
<div class="tb2">steamid</div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>				
<div class="tb4">Трейд ссылка</div>				
<div class="tb5" tyle="
    font-size: 15px;      white-space: nowrap;                              
    width: 20%;
">&nbsp;</div>			
</div>
<?php




foreach($users as $key => $value)


{

?>
<div class="list" style=" background: none;    border-bottom: 1px solid #3D4E5E; ">				
<div class="tb1" style="width: 2%;"><span style=" background: none; ">&nbsp;</span></div>				
<div class="tb2"><?=$value['steamid'];?></div>				
<div class="tb3" style=" width: 11%; ">&nbsp;</div>			
<div class="tb4" style="
    font-size: 15px;      white-space: nowrap;                              
    width: 20%;    margin-top: 6px;
"><input type="text" value='<?=$value['tradelink'];?>'></div>				
<div class="tb5">&nbsp;</div>			
</div>
<?php

}

?>

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