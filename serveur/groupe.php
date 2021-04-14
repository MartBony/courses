<?php
require('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkGroupe.php');

header("Content-Type: application/json");

login($bdd, function($user) use ($bdd){
	checkGroupe($bdd, $user, function($user, $groupe) use ($bdd){
		$reqAllCourses = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC');
		$reqAllUsers = $bdd->prepare('SELECT `nom`, `groupe` FROM `users`');

		$coursesList = array();
		$membresGp = array();

		// Pulling membres for specified group
		$reqAllUsers->execute();
		while($scanedUser = $reqAllUsers->fetch()){
			if (strpos($scanedUser['groupe'], '['. $groupe['id'] .']') !== false) {
				array_push($membresGp, $scanedUser['nom']);
			}
		}
		$reqAllUsers->closeCursor();

		// Pulling courses + Get additionnal data

		$firstDate = time();

		$reqAllCourses->execute(array($groupe['id']));
		while($resCoursesGp = $reqAllCourses->fetch()){
			
		
			if ($resCoursesGp['dateStart'] != 0) {
				$firstDate = min($resCoursesGp['dateStart'], $firstDate);
			}

			array_push($coursesList, array(
					'id' => (int) $resCoursesGp['id'],
					'nom' => $resCoursesGp['nom'],
					'total' => (float) $resCoursesGp['total'],
					'maxPrice' => (float) $resCoursesGp['maxPrice'],
					'dateStart' => (int) $resCoursesGp['dateStart']
			));
		}
		$reqAllCourses->closeCursor();

		echo json_encode(array(
			'status' => 200,
			'payload' => array(
				'id' => (int) $groupe['id'],
				'nom' => $groupe['nom'],
				'coursesList' => $coursesList,
				'membres' => $membresGp
			)
		));
	});
});

?>