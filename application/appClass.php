<?php
session_start();
header("Content-type:text/html;charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors',1);
require_once(dirname(__FILE__).'/../steamauth/settings.php');



if(isset($_GET['action'])){
	switch($_GET['action']){
		case 'inventory' : echo json_encode(get_user_inventory($_GET['steamid'],$steamauth));break;
		case 'online' : set_user_online($_GET['steamid']);break;
		case 'count_winners' : echo get_count_winners();break;
		case 'top' : echo json_encode(get_top_page());break;
	}
}


function get_count_winners(){
	$connection = new MongoClient();
	$collection = $connection->selectDB('admin')->selectCollection('gamedb');
	$cursor = $collection->find(array('name' => 'history'));
	echo $cursor->count();
}



function get_top_page(){
	$connection = new MongoClient();
	$collection = $connection->selectDB('admin')->selectCollection('gamedb');
	
	$result_list = array();
	$cursor = $collection->find(array('name' => 'history'));
	$biff_list = array();
	$counter = 0;
	foreach($cursor as $key => $value){
		$cursor_key = md5($value['winnername']);

		if(!isset($result_list[$cursor_key])){
			$result_list[$cursor_key] = $value;
			$result_list[$cursor_key]['count'] = 1;
			$result_list[$cursor_key]['winc'] = $value['winnerchance'];
			$buff_list[$cursor_key] = $value['winnermoney'];
			$counter ++;
		}else{
			$result_list[$cursor_key]['count'] += 1;
			$result_list[$cursor_key]['winnermoney'] += $value['winnermoney'];
			$result_list[$cursor_key]['winc'] += $value['winnerchance'];
			$buff_list[$cursor_key] += $value['winnermoney'];
		}
	}

	arsort($buff_list);
	$buff_list = array_slice($buff_list,0,70);
	$result_print = array();
	foreach($buff_list as $key => $value){
		$result_print[] = $result_list[$key];
	}

	return array('count' => $counter,'list' => $result_print);

}

function set_user_online($steam_id){
	$date = time();
	$connection = new MongoClient();
	$collection = $connection->selectDB('admin')->selectCollection('user_status_online');
	$collection->remove(array('steamid' => $steam_id));
	$collection->insert(array('steamid' => $steam_id,'date' => $date));
}





function get_user_inventory($steamid,$steamauth){
	$data = awCache::getInstance()->load_cache('user_steam_profile_'.$steamid);
	if(!$data){
		$profile = get_profile_url($steamid,$steamauth);
		if($profile){
			$data = awCache::getInstance()->load_cache($profile['profileurl']."inventory/json/730/2/?l=russian");
			if(!$data){
				$data = (file_get_contents($profile['profileurl']."inventory/json/730/2/?l=russian"));
				AwCache::getInstance()->save_cache($profile['profileurl']."inventory/json/730/2/?l=russian",$data);
			}
			#die($profile['profileurl']."inventory/json/730/2");
		
			$data = object_to_array(json_decode($data));
			#die(print '<pre>'.print_r($data,true).'</pre>');
			if($data['success'] == 1){
				$items = array();
				$sort_array = array();
				foreach($data['rgInventory'] as $itemId => $itemValue){
					$item = array('id' => $itemId,'classid'=>$itemValue['classid'],'position' => $itemValue['pos'],'amount' => $itemValue['amount']);
					$class_info = $data['rgDescriptions'][$itemValue['classid'].'_'.$itemValue['instanceid']];
					if($class_info){
						if(strpos($class_info['name'],'Монета участника') === false){
							#echo $item['name'].'<br />';
							$item['name'] = $class_info['name'];
							$item['icon_url'] = $class_info['icon_url'];
							$item['classid'] = $class_info['classid'];
							$item['appid'] = $class_info['appid'];
							$item['descriptions'] = $class_info['descriptions'];
							$item['tags'] = $class_info['tags'];
							$item['price'] = get_item_price($class_info['market_hash_name']);
							$item['price_normal'] = str_replace(',','.',str_replace(' p&#1091;&#1073;.','',$item['price']));
							if($item['price']){
								$items[$itemId] = $item;
								$sort_array[$itemId] = $item['price_normal'];
							}
						}
					}
				}

				$result_array = array();
			
				arsort($sort_array);
				
				foreach($sort_array as $key => $value){
					$result_array[$key] = $items[$key];
				}
				awCache::getInstance()->save_cache('user_steam_profile_'.$steamid,json_encode($result_array));
				return $result_array;
			}else{
				return array('errors' => 'Inventory is close');
			}
		}else{
			return array('error' => 'Can not load profile');
		}
	}else{
		return object_to_array(json_decode($data));
	}
}


function get_item_price($item_hash_name){
	$data = AwCache::getInstance()->load_cache(@file_get_contents("http://steamcommunity.com/market/priceoverview/?currency=5&appid=730&market_hash_name=".urlencode($item_hash_name)));
	if(!$data){
		$data = @file_get_contents("http://steamcommunity.com/market/priceoverview/?currency=5&appid=730&market_hash_name=".urlencode($item_hash_name));
		AwCache::getInstance()->save_cache("http://steamcommunity.com/market/priceoverview/?currency=5&appid=730&market_hash_name=".urlencode($item_hash_name),$data);
	}
	if($data){
		$data = json_decode($data);
		$data = object_to_array($data);
		return isset($data['lowest_price']) ? $data['lowest_price'] : 0;
	}

	return false;
}

function get_profile_url($steamid,$steamauth){
	$data = AwCache::getInstance()->load_cache("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".$steamauth['apikey']."&steamids=".$steamid);
	if(!$data){
		$data = (file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".$steamauth['apikey']."&steamids=".$steamid));
		AwCache::getInstance()->save_cache("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=".$steamauth['apikey']."&steamids=".$steamid,$data);
	}
	$data = json_decode($data);
	$data = object_to_array($data);
	if(isset($data['response']) && isset($data['response']['players'][0])){
		return $data['response']['players'][0];
	}
	return false;
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



class AwCache{
	public static $__life_time = 108000;
	
	public static $__instance = null;
	
	public static function getInstance(){
		if(self::$__instance === null){
			self::$__instance = new self();
		}
		return self::$__instance;
	}

	public function save_cache($cache_url,$cache_data){
		$key = md5($cache_url);
		$file = fopen(dirname(__FILE__).'/cache/'.$key.'.json','w');
		fwrite($file, $cache_data);
		fclose($file);
		#die($cache_url);
		chmod(dirname(__FILE__).'/cache/'.$key.'.json',0777);
	}

	public function load_cache($cache_url){
		$key = md5($cache_url);
		if(file_exists(dirname(__FILE__).'/cache/'.$key.'.json')){
			$data = file_get_contents(dirname(__FILE__).'/cache/'.$key.'.json');
			if($data == '') return false;
			$filetime = filemtime(dirname(__FILE__).'/cache/'.$key.'.json');
			#die('File time: '.$filetime.' time: '.time());
			if($filetime < time() - self::$__life_time){

				unlink(dirname(__FILE__).'/cache/'.$key.'.json');
			}
			return $data;
		}
		return false;
	}
}


?>