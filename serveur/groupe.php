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
		$error = false;

		// Pulling membres for specified group
		$reqAllUsers->execute();
		while($scanedUser = $reqAllUsers->fetch()){
			if (strpos($scanedUser['groupe'], $groupe['id']) !== false) {
				array_push($membresGp, $scanedUser['nom']);
			}
		}
		$reqAllUsers->closeCursor();

		// Pulling courses + Get additionnal data

		$monthCost = 0;
		$firstDate = time();
		$coef = 0;

		$reqAllCourses->execute(array($groupe['id']));
		while($resCoursesGp = $reqAllCourses->fetch()){
			
			if (time() - $resCoursesGp['dateStart'] < 31*24*60*60) {
				$monthCost += $resCoursesGp['total'];
			}
			if ($resCoursesGp['dateStart'] != 0) {
				$firstDate = min($resCoursesGp['dateStart'], $firstDate);
			}

			array_push($coursesList, array(
				'id' => $resCoursesGp['id'],
				'nom' => $resCoursesGp['nom']
			));
		}
		$reqAllCourses->closeCursor();

		if (!empty($coursesList)) {
			if (time() - $firstDate > 31*24*60*60) {
				$coef = max(1,sizeof($coursesList)*(31*24*60*60)/(time() - $firstDate));
			} else {
				$coef = 2.5;
			}
		} else {
			$error = 204;
		}

		echo json_encode(array(
			'status' => 200,
			'groupe' => array(
				'id' => $groupe['id'],
				'nom' => $groupe['nom'],
				'coursesList' => $coursesList,
				'membres' => $membresGp,
				'monthCost' => $monthCost,
				'coef' => $coef,
				'error' => $error
			)
		));
	});
});

?>