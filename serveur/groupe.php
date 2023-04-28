<?php
require('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkGroupe.php');

header("Content-Type: application/json");

login($bdd, function($user) use ($bdd){
	checkGroupe($bdd, $user, getPostGroupeId(), function($groupe) use ($user, $bdd){

		// Pulling membres for specified group
		$reqMembres = $bdd->prepare('SELECT u.nom 
			FROM `users` u
			INNER JOIN `gulinks` l
			ON u.id = l.userId
			WHERE l.groupeId = ? AND l.active = 1
		');
		$reqMembres->execute(array($groupe['id']));
		$membres = array();
		while($resMembres = $reqMembres->fetch()){
			array_push($membres, $resMembres['nom']);
		}

		// Pulling courses + Get additionnal data

		// Actives, anciennes
		$coursesList = array(array(), array());
		// Id et timestamp de la liste la plus récente
		$newestCourseId = -1;
	
		$reqAllCourses = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `dateCreation` DESC');
		$reqAllCourses->execute(array($groupe['id']));

		$isFirst = true;
		while($resCoursesGp = $reqAllCourses->fetch()){
			$totalCategories = array();
						
			for ($i=0; $i <= 3; $i++) { 
				$reqCategories = $bdd->prepare('SELECT SUM(prix) FROM `articles` WHERE `course` = ? AND `domaine` = ?');
				$reqCategories->execute(array($resCoursesGp['id'], $i));
				array_push($totalCategories, (float) ($reqCategories->fetch())[0]);
			}
			

			if($isFirst && $resCoursesGp['dateCreation'] && !$resCoursesGp['isold']){
				$newestCourseId = $resCoursesGp["id"];
				$isFirst = false;
			}
			if($resCoursesGp["isold"]){
				array_push($coursesList[1], array(
					'id' => (int) $resCoursesGp['id'],
					'nom' => $resCoursesGp['nom'],
					'total' => (float) $resCoursesGp['total'],
					'maxPrice' => (float) $resCoursesGp['maxPrice'],
					'dateCreation' => (int) $resCoursesGp['dateCreation'],
					'isold' => (bool) $resCoursesGp['isold'],
					'totalCategories' => $totalCategories
			));
			} else {
				array_push($coursesList[0], array(
						'id' => (int) $resCoursesGp['id'],
						'nom' => $resCoursesGp['nom'],
						'total' => (float) $resCoursesGp['total'],
						'maxPrice' => (float) $resCoursesGp['maxPrice'],
						'dateCreation' => (int) $resCoursesGp['dateCreation'],
						'isold' => (bool) $resCoursesGp['isold'],
						'totalCategories' => $totalCategories
				));
			}
		}
		$reqAllCourses->closeCursor();

		echo json_encode(array(
			'status' => 200,
			'payload' => array(
				'id' => (int) $groupe['id'],
				'nom' => $groupe['nom'],
				'coursesList' => $coursesList,
				'defaultId' => $newestCourseId,
				'membres' => $membres
			)
		));
	});
});

?>