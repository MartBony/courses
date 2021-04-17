<?php
require('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkGroupe.php');

header("Content-Type: application/json");

login($bdd, function($user) use ($bdd){
	checkGroupe($bdd, $user, getPostGroupeId(), function($user, $groupe) use ($bdd){

		// Pulling membres for specified group
		$reqMembres = $bdd->prepare('SELECT u.nom 
			FROM `users` u
			INNER JOIN `gulinks` l
			ON u.id = l.userId
			WHERE l.groupeId = ?
		');
		$reqMembres->execute(array($groupe['id']));
		$membres = array();
		while($resMembres = $reqMembres->fetch()){
			array_push($membres, $resMembres['nom']);
		}

		// Pulling courses + Get additionnal data

		$firstDate = time();

		$coursesList = array();
	
		$reqAllCourses = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC');
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
				'membres' => $membres
			)
		));
	});
});

?>