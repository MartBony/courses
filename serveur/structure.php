<?php
require('../dbConnect.php');
require_once('checkers/login.php');

header("Content-Type: application/json");

function groupes($user, PDO $bdd) {
	// USING GULINKS

	// Request Groupes of User
	$reqGroupesOfUser = $bdd->prepare('SELECT g.id, g.nom 
		FROM `groupes` g 
		INNER JOIN `gulinks` l
		ON g.id = l.groupeId
		WHERE l.userId = ? AND l.active = 1
	');
	$reqGroupesOfUser->execute(array($user['id']));

	// Add Members
	$groupesOfUser = array();
	while($groupe = $reqGroupesOfUser->fetch()){
		$reqMembres = $bdd->prepare('SELECT u.nom 
			FROM `users` u
			INNER JOIN `gulinks` l
			ON u.id = l.userId
			WHERE l.groupeId = ? AND `active` = 1
		');
		$reqMembres->execute(array($groupe['id']));
		$membres = array();
		while($resMembres = $reqMembres->fetch()){
			array_push($membres, $resMembres['nom']);
		}

		array_push($groupesOfUser, array(
			"id" => $groupe['id'],
			"nom" => $groupe['nom'],
			"membres" => $membres
		));

	}

	echo json_encode(array(
		'status' => 200,
		'payload' => array(
			'id' => $user['userId'],
			'nom' => $user['nom'],
			'color' => $user['hueColor'],
			'groupes' => $groupesOfUser
		)
	));
	
	/* DEPRECATED
	$reqAllCourses = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC');
	$reqAllUsers = $bdd->prepare('SELECT `nom`, `groupe` FROM `users`');

	$cursor = "outside";
	$idGroupe = "";
	foreach(str_split($user['groupe']) as $char){
		if($char == "[") {
			$cursor = "inside";
		} else if ($char == "]") {
			$cursor = "outside";

			// Pulling group info
			$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `id` = ?');
			$reqGroupe->execute(array($idGroupe));
			$groupe = $reqGroupe->fetch();
			$reqGroupe->closeCursor();

			if($reqGroupe->rowCount() == 1){
				$coursesList = array();
				$membresGp = array();

				// Pulling membres for specified group
				$reqAllUsers->execute();
				while($scanedUser = $reqAllUsers->fetch()){
					if (strpos($scanedUser['groupe'], $idGroupe) !== false) {
						array_push($membresGp, $scanedUser['nom']);
					}
				}
				$reqAllUsers->closeCursor();

				// Pulling courses + Get additionnal data

				$firstDate = time();

				$reqAllCourses->execute(array($idGroupe));
				while($resCoursesGp = $reqAllCourses->fetch()){
					
					if ($resCoursesGp['dateStart'] != 0) {
						$firstDate = min($resCoursesGp['dateStart'], $firstDate);
					}

					array_push($coursesList, array(
						'id' => $resCoursesGp['id'],
						'nom' => $resCoursesGp['nom']
					));
				}
				$reqAllCourses->closeCursor();

				array_push($groupsInfo, array(
					'id' => (int) $groupe['id'],
					'nom' => $groupe['nom'],
					'membres' => $membresGp
				));

			}
			
			$idGroupe = "";

		} else if ($cursor == "inside") {
			$idGroupe .= $char;
		}

	}

	echo json_encode(array(
		'status' => 200,
		'payload' => array(
			'id' => $user['userId'],
			'nom' => $user['nom'],
			'color' => $user['hueColor'],
			'groupes' => $groupsInfo
		)
	)); */
}

login($bdd, function($user) use ($bdd){
	groupes($user, $bdd);
});

?>