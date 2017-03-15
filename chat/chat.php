<?php
date_default_timezone_set('Europe/Moscow');
$connection = new MongoClient();
$collection = $connection->selectDB('admin')->selectCollection('steam_chat');
$ban = $connection->selectDB('admin')->selectCollection('chat_ban');
$list = array();
foreach($ban->find() as $key => $value){
	$list[] = $value['steamid'];
}
switch($_GET['action']){
	case 'add' : add_message($collection,$_POST,$list); break;
	case 'get' : echo json_encode(get_messages($collection));break;
	case 'test_get' : print_r(get_messages($collection));break;
}
$connection->close();

function add_message($collection,$message_info,$ban_user = array()){
if(isset($_GET['userid']) && in_array($_GET['userid'],$ban_user)){echo json_encode(array('error'=>'У вас бан в чате'));exit(0);};	
			
if (isset($message_info['userid']) == '76561198175661250') {
$message_info['user_id'] == '0';
}

$message_info['user_message'] = trim(strip_tags(htmlspecialchars_decode($message_info['user_message'])));
$words = file_get_contents(dirname(__FILE__).'/words.json');
$words = object_to_array(json_decode($words));
foreach($words as $key => $value){
$message_info['user_message'] = str_ireplace($key,$value,$message_info['user_message']);
}

session_start();
include ('../steamauth/userInfo.php');
$message_info['user_name'] = trim(strip_tags(htmlspecialchars_decode($message_info['user_name'])));
$message_info['user_avatar'] = trim(strip_tags(htmlspecialchars_decode($message_info['user_avatar'])));

if (!preg_match ("/href|url|http|www|.ru|.com|.net|.info|.org/i", $message_info['user_message'])) {
//ссылок не найдено,
} else {
die('найдена ссылка, ая-яй!'); //убиваем скрипт и выводим сообщение
}

$message_info['user_id'] = trim(strip_tags(htmlspecialchars_decode($message_info['user_id'])));
	   if($message_info['user_name']=="")
    {
        die("Пустое поле!");
    }
	   if($message_info['user_avatar']=="")
    {
        die("Пустое поле!");
    }
	
	   if($message_info['user_message']=="")
    {
        die("Пустое поле!");
    }
	$message_info['ip'] =  $_SERVER['REMOTE_ADDR'];
	$message_info['date'] =  date("Y-m-d H:i:s");
	$message_info['otvet'] =  "<li><a href=# onClick=add_otvet('@".$message_info['user_name'].":')>ответить</a></li>";
	if($collection->insert($message_info)){
		return true;
	}
	return false;
}

function get_messages($collection){
	$cursor = $collection->find()->sort(array('date' => -1))->limit(20);
	$list = array();
	foreach($cursor as $key => $value){
$value['user_message'] =strip_tags($value['user_message']);
$value['user_message'] =str_replace(":)","<img style='background-position: 0px 0px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":-d","<img style='background-position: 0px -17px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(";-)","<img style='background-position: 0px -34px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("xd","<img style='background-position: 0px -51px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(";-p","<img style='background-position: 0px -68px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":-p","<img style='background-position: 0px -85px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("8-)","<img style='background-position: 0px -102px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("b-)","<img style='background-position: 0px -119px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":-(","<img style='background-position: 0px -136px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(";-]","<img style='background-position: 0px -153px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("u—(","<img style='background-position: 0px -170px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":l(","<img style='background-position: 0px -187px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":_(","<img style='background-position: 0px -204px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":((","<img style='background-position: 0px -221px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":o","<img style='background-position: 0px -238px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":|","<img style='background-position: 0px -255px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("3-)","<img style='background-position: 0px -272px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("o*)","<img style='background-position: 0px -323px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(";o","<img style='background-position: 0px -340px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("8o","<img style='background-position: 0px -374px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("8|","<img style='background-position: 0px -357px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":x","<img style='background-position: 0px -391px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("*3","<img style='background-position: 0px -442px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":-*","<img style='background-position: 0px -409px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("}^)","<img style='background-position: 0px -425px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(">((","<img style='background-position: 0px -306px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(">(","<img style='background-position: 0px -289px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":like:","<img style='background-position: 0px -459px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":dislike:","<img style='background-position: 0px -476px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":u:","<img style='background-position: 0px -493px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":v:","<img style='background-position: 0px -510px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace(":kk:","<img style='background-position: 0px -527px' id=smile src=/styles/images/chat/white.gif>",$value['user_message']);
$value['user_message'] =str_replace("👏","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC4F.png>",$value['user_message']);
$value['user_message'] =str_replace("👊","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC4A.png>",$value['user_message']);
$value['user_message'] =str_replace("✋","<img style='background:none;' id=smile src=/styles/images/chat/270B.png>",$value['user_message']);
$value['user_message'] =str_replace("🙏","<img style='background:none;' id=smile src=/styles/images/chat/D83DDE4F.png>",$value['user_message']);
$value['user_message'] =str_replace("👃","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC43.png>",$value['user_message']);
$value['user_message'] =str_replace("👆","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC46.png>",$value['user_message']);
$value['user_message'] =str_replace("👇","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC47.png>",$value['user_message']);
$value['user_message'] =str_replace("👈","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC48.png>",$value['user_message']);
$value['user_message'] =str_replace("💪","<img style='background:none;' id=smile src=/styles/images/chat/D83DDCAA.png>",$value['user_message']);
$value['user_message'] =str_replace("👂","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC42.png>",$value['user_message']);
$value['user_message'] =str_replace("💋","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC8B.png>",$value['user_message']);
$value['user_message'] =str_replace("💩","<img style='background:none;' id=smile src=/styles/images/chat/D83DDCA9.png>",$value['user_message']);
$value['user_message'] =str_replace("❄","<img style='background:none;' id=smile src=/styles/images/chat/2744.png>",$value['user_message']);
$value['user_message'] =str_replace("🍷","<img style='background:none;' id=smile src=/styles/images/chat/D83CDF77.png>",$value['user_message']);
$value['user_message'] =str_replace("🍸","<img style='background:none;' id=smile src=/styles/images/chat/D83CDF78.png>",$value['user_message']);
$value['user_message'] =str_replace("🎅","<img style='background:none;' id=smile src=/styles/images/chat/D83CDF85.png>",$value['user_message']);
$value['user_message'] =str_replace("💦","<img style='background:none;' id=smile src=/styles/images/chat/D83DDCA6.png>",$value['user_message']);
$value['user_message'] =str_replace("👺","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC7A.png>",$value['user_message']);
$value['user_message'] =str_replace("🐨","<img style='background:none;' id=smile src=/styles/images/chat/D83DDC28.png>",$value['user_message']);
$value['user_message'] =str_replace("🍌","<img style='background:none;' id=smile src=/styles/images/chat/D83CDF4C.png>",$value['user_message']);
$value['user_message'] =str_replace("🏆","<img style='background:none;' id=smile src=/styles/images/chat/D83CDFC6.png>",$value['user_message']);
$value['user_message'] =str_replace("🎲","<img style='background:none;' id=smile src=/styles/images/chat/D83CDFB2.png>",$value['user_message']);
$value['user_message'] =str_replace("🍺","<img style='background:none;' id=smile src=/styles/images/chat/D83CDF7A.png>",$value['user_message']);
$value['user_message'] =str_replace("🍻","<img style='background:none;' id=smile src=/styles/images/chat/D83CDF7B.png>",$value['user_message']);

if ($value['user_id'] == '76561198175661250') {
	$value['user_id'] == '0';
	$value['user_avatar'] = '/styles/avatar.png';
	
   $value['user_name'] = '<font size="0.5px" color="#EA7526">System</font>';
	//$value['user_message'] = '<font color="#EA7526">'.$value['user_message'].'</font>';
}		


		
		
		

		if ($value['user_id'] == '76561198175661250') {
			
	$value['otvet'] =  "";
	}
	
	
	
	
		$list[] = $value;
	}
	return array_reverse($list);
}

function object_to_array($data){
	if (is_array($data) || is_object($data)){
		$result = array();
		foreach ($data as $key => $value){
			$result[$key] = object_to_array($value);
		}
		return $result;
	}
	return $data;
}