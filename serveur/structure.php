<?php
require('../dbConnect.php');
require_once('checkers/login.php');

header("Content-Type: application/json");

function groupes($user, PDO $bdd) {
	$reqAllCourses = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC');
	$groupsInfo = array();
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
				$error = false;

				// Pulling membres for specified group
				$reqAllUsers->execute();
				while($scanedUser = $reqAllUsers->fetch()){
					if (strpos($scanedUser['groupe'], $idGroupe) !== false) {
						array_push($membresGp, $scanedUser['nom']);
					}
				}
				$reqAllUsers->closeCursor();

				// Pulling courses + Get additionnal data

				$monthCost = 0;
				$firstDate = time();
				$coef = 0;

				$reqAllCourses->execute(array($idGroupe));
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

				array_push($groupsInfo, array(
					'id' => $groupe['id'],
					'nom' => $groupe['nom'],
					'membres' => $membresGp
				));

			}
			
			$idGroupe = "";

		} else if ($cursor == "inside") {
			$idGroupe .= $char;
		}

	}

	http_response_code(200);
	echo json_encode(array(
		'groupes' => $groupsInfo,
		'nom' => $user['nom'],
		'id' => (int) $user['id']
	));
}

login($bdd, function($user) use ($bdd){
	groupes($user, $bdd);
});

?>