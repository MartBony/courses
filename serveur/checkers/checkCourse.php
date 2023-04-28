<?php


function getPostCourseId(){
	if(isset($_POST['idCourse']) && !empty($_POST['idCourse'])){
		return $_POST['idCourse'];
	} elseif (isset($_POST['course']) && !empty($_POST['course'])){
		return $_POST['course'];
	} else {
		return NULL;
	}
}

function checkCourse(PDO $bdd, $user, $courseId, $callback) {
	if($courseId){
		$courseId = (int) $courseId;
		$reqCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `id` = ?');
		$reqCourse->execute(array($courseId));
		if($reqCourse->rowCount() == 1){
			$course = $reqCourse->fetch();

			$reqLink = $bdd->prepare('SELECT * FROM `gulinks` WHERE `userId` = :userId AND `groupeId` = :groupeId AND `active` = 1');
			$reqLink->execute(array(
				"userId" => $user['id'],
				"groupeId" => $course['groupe']
			));
			if($reqLink->rowCount() == 1){
				return call_user_func($callback, $course);
			} else {
				echo json_encode(array('status' => 404, "error" => "forbidden"));
				return true;
			}	
		} else {
			echo json_encode(array('status' => 404, "error" => "notFound"));
			return true;
		}
	} else {
		echo json_encode(array('status' => 400, "error" => "badReq"));
		return true;
	}
}

?>