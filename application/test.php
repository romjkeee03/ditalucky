<?php

$first = "23-07-2015 19:28";
$second = "48:03";
$first_time = strtotime($first); 
$second_time = strtotime('00-00-00 00:'.$second);

$result_time = date('d-m-Y H:i',$first_time + $second_time);

echo $result_time;