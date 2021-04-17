<?php
	require_once('../dbConnect.php');
	require_once('checkers/login.php');
	require_once('checkers/getLatestCourse.php');
	require_once('checkers/checkCourse.php');
	
	header('Content-type: application/json');

	login($bdd, function($user) use ($bdd){
		checkCourse($bdd, $user, getPostCourseId(), function($user, $course) use ($bdd){
			getLatestCourse($bdd, $user, function($user, $latestCourse) use ($bdd, $course){ // CheckGroupe integrated
				
				$reqUpdateItems = $bdd->prepare('UPDATE `articles` SET `course`=:newCourseId WHERE `course`=:oldCourseId AND `preview`=1');
				$reqUpdateItems->execute(array(
					"newCourseId" => $latestCourse['id'],
					"oldCourseId" => $course['id']
				));
				echo json_encode(array("status" => 200));

			});
		});
	});

?>