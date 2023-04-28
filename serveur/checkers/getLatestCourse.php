<?php
require_once('checkers/checkGroupe.php');

function getLatestCourse(PDO $bdd, $user, $callback) {
	checkGroupe($bdd, $user, getPostGroupeId(), function($groupe) use ($user, $bdd, $callback){
		
		$reqUsedCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC LIMIT 0,1');
		$reqUsedCourse->execute(array($groupe['id']));
		if($reqUsedCourse->rowCount() == 1){
			$usedCourse = $reqUsedCourse->fetch();
			call_user_func($callback, $user, $usedCourse);

		} else {
			echo json_encode(array('status' => 204, 'payload' => array('err' => 'Empty Groupe')));
		}

	});
}

?>