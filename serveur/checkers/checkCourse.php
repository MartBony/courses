<?php


function getPostCourseId(){
	if(isset($_POST['course']) && !empty($_POST['course'])){
		return $_POST['course'];
	} else {
		return NULL;
	}
}

function checkCourse(PDO $bdd, $user, $courseId, $callback) {
	if($courseId){
		$reqCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `id` = ?');
		$reqCourse->execute(array($_POST['course']));
		if($reqCourse->rowCount() == 1){
			$course = $reqCourse->fetch();

			$reqLink = $bdd->prepare('SELECT * FROM `gulinks` WHERE `userId` = :userId AND `groupeId` = :groupeId AND `active` = 1');
			$reqLink->execute(array(
				"userId" => $user['id'],
				"groupeId" => $course['groupe']
			));
			if($reqLink->rowCount() == 1){
				call_user_func($callback, $user, $course);
			} else {
				echo json_encode(array('status' => 404, 'payload' => array('type' => 'ERROR', 'message' => 'La course demandée est inacessible.')));
				return true;
			}
		} else {
			echo json_encode(array('status' => 404, 'payload' => array('type' => 'ERROR', 'message' => 'Nous ne trouvons pas votre course.')));
			return true;
		}
	} else {
		echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Votre requête est invalide. Rechargez la page et réessayez.')));
		return true;
	}
}

?>