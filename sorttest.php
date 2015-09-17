<?php
header('Content-type: application/json');//The output is json;
date_default_timezone_set('UTC');
$current_time = date('Y-m-d').'T'.date('H:i:').'00Z';
$url = file_get_contents("./api1.sensitive").$current_time;
$url2 = file_get_contents("./api2.sensitive").$current_time;


$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$json = JSON_decode($response);
$count = count($json);

$prepare_array = array();
$top_four_array = array();

for ($x = 0; $x < $count; $x++) {
	if ($json[$x]->is_public == 1) {
		$occurrences_array = $json[$x]->occurrences;
		$occurrences_size = count($occurrences_array); //To see if there are more than 1 occurences. If
		//not, since the events are gotten by the time stamp, the first element will be the one we want;
		//else, we will compare the start time of each of the events to find out the first one in future.
		if ($occurrences_size == 1) {
			if ($json[$x]->occurrences[0]->ends_at > $current_time){
				$prepare_array[$json[$x]->occurrences[0]->starts_at] = array($x, 0);//we use the start time as 
																			//the key in the array and the index
			}																// of the event as value.

		} else {
			for ($i = 0; $i < $occurrences_size; $i++) {
				if ($json[$x]->occurrences[$i]->ends_at > $current_time) {
					$prepare_array[$json[$x]->occurrences[$i]->starts_at] = array($x, $i);
					break;
				}
			}
		}
	}
}

krsort($prepare_array); //krsort is the fastest method since we cannot get the key by index
$count = count($prepare_array);
if ($count > 4) {$count = 4;}
for ($m = 0; $m < $count; $m++) {
	$tuple_array = array_pop($prepare_array);
	$x = $tuple_array[0]; //index of the event among all events
	$i = $tuple_array[1]; //index of the event of the occurences of time
	array_push($top_four_array, array("name" => $json[$x]->name, "location" => $json[$x]->location, "start_time" => $json[$x]->occurrences[$i]->starts_at, "end_time" => $json[$x]->occurrences[$i]->ends_at));
}

//The variable names ended with "2" are used for events from Student Clubs $ Organizations Administration
$ch2 = curl_init($url2);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
$response2 = curl_exec($ch2);
curl_close($ch2);

$json2 = JSON_decode($response2);
$count2 = count($json2);


$prepare_array2 = array();
$top_four_array2 = array();

for ($x = 0; $x < $count2; $x++) {
	if ($json2[$x]->is_public == 1) {
		$occurrences_array2 = $json2[$x]->occurrences;
		$occurrences_size2 = count($occurrences_array2); 
		if ($occurrences_size2 == 1) {
			if ($json2[$x]->occurrences[$i]->ends_at > $current_time) {
				$prepare_array2[$json2[$x]->occurrences[0]->starts_at] = array($x, 0);
			}
		} else {
			for ($i = 0; $i < $occurrences_size2; $i++) {
				if ($json2[$x]->occurrences[$i]->ends_at > $current_time) {
					$prepare_array2[$json2[$x]->occurrences[$i]->starts_at] = array($x, $i);
					break;
				}
			}
		}
	}
}

krsort($prepare_array2);
$count2 = count($prepare_array2);

if ($count2 > 4) {$count2 = 4;}
for ($m = 0; $m < $count2; $m++) {
	$tuple_array2 = array_pop($prepare_array2);
	$x = $tuple_array2[0];
	$i = $tuple_array2[1];
	array_push($top_four_array2, array("name" => $json2[$x]->name, "location" => $json2[$x]->location, "start_time" => $json2[$x]->occurrences[$i]->starts_at, "end_time" => $json2[$x]->occurrences[$i]->ends_at));
}


#Compare two arrays to get the earliest four events
$result_array = array();
$num = 0;
$a = 0;
$b = 0;

while ($num < 4) {
	if ($top_four_array[$a]['start_time'] and $top_four_array2[$b]['start_time']){
		if ($top_four_array[$a]['start_time'] <= $top_four_array2[$b]['start_time']) {
		array_push($result_array, $top_four_array[$a]);
		$a++;
		} else {
		array_push($result_array, $top_four_array2[$b]);
		$b++;
		}
	}
	elseif ($top_four_array[$a]['start_time']) {
		array_push($result_array, $top_four_array[$a]);
		$a++;
	}
	elseif ($top_four_array[$b]['start_time']) {
		array_push($result_array, $top_four_array2[$b]);
		$b++;
	}
	$num++;
}

$jsonData = json_encode($result_array, true);
echo $jsonData;

// print_r($top_four_array);
// print_r($top_four_array2);
?>



