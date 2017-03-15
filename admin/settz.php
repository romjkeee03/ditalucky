
<?php
		$connection = new MongoClient();
		$collection = $connection->selectDB('admin')->selectCollection('setting');
		$list = $collection->find();
		$steam_list = array();
		
		foreach($list as $key => $value){
			$minDeposite = $value['minDeposite'];
			$gameDuration = $value['gameDuration'];
			$usersToStart = $value['usersToStart'];
			$usersItemsLimit = $value['usersItemsLimit'];
			$fee = $value['fee'];
			$commissionHistory = $value['commissionHistory'];
			$commissionType = $value['commissionType'];
			$currency = $value['currency'];
			$historyCommission = $value['historyCommission'];
			$name = $value['name'];
		}

	?>