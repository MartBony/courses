<?php

function checkCourse($user, PDO $bdd, $callback) {
	if(isset($_POST['id']) && !empty($_POST['id'])){
		$reqUsedCourse = $bdd->prepare('SELECT * FROM `courses` WHERE id = ?');
		$reqUsedCourse->execute(array($_POST['id']));
		if($reqUsedCourse->rowCount() == 1){
			$usedCourse = $reqUsedCourse->fetch();
			if(strpos($user['groupe'], $usedCourse['groupe']) !== false){

				call_user_func($callback, $user, $usedCourse, $bdd);
				
			} else {
				echo json_encode(array('status' => 403));
			}
		} else {
			echo json_encode(array('status' => 204));
		}
	} else {
		echo json_encode(array('status' => 412));
	}
}

?>