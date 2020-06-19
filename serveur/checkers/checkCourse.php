<?php

function checkCourse($user, PDO $bdd, $callback) {
	if(isset($_POST['course']) && !empty($_POST['course'])){
		$reqCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `id` = ?');
		$reqCourse->execute(array($_POST['course']));
		if($reqCourse->rowCount() == 1){
			$course = $reqCourse->fetch();
			if(strpos($user['groupe'], "[". $course['groupe'] ."]") !== false){

				call_user_func($callback, $user, $course);
				
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