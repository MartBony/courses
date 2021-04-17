<?php

require('../dbConnect.php');
require('checkers/login.php');

header("Content-Type: application/json");

login($bdd, function($user) use ($bdd){ // REWRITE
	if(isset($_POST['deleteUser'])){
		// Request Groupes of User
		$reqGroupesOfUser = $bdd->prepare('SELECT g.id, g.nom 
		FROM `groupes` g 
		INNER JOIN `gulinks` l
		ON g.id = l.groupeId
		WHERE l.userId = ?
	');
	$reqGroupesOfUser->execute(array($user['id']));

	// Add Members
	$groupesOfUser = array();
	while($groupe = $reqGroupesOfUser->fetch()){
		
		$reqNbrMembres = $bdd->prepare('SELECT COUNT(*) as nbrMembres FROM `gulinks` WHERE `groupeId` = ?');
		$reqNbrMembres->execute(array($user['id']));
		$nbmMembres = $reqNbrMembres->fetch();
		$nbmMembres = $nbmMembres['nbrMembres'];

		if($membres == 1){

			$reqAllCourses = $bdd->prepare('SELECT id FROM courses WHERE groupe = ? ORDER BY id DESC');
			$reqAllCourses->execute(array($idGroupe));
			while($resCoursesGp = $reqAllCourses->fetch()){
				$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
				$delArticles->execute(array($resCoursesGp['id']));
			}
			$reqAllCourses->closeCursor();

			$delCourses = $bdd->prepare('DELETE FROM `courses` WHERE `groupe` = ?');
			$delCourses->execute(array($idGroupe));
			$delCourses->closeCursor();

			$delgroupe = $bdd->prepare('DELETE FROM `groupes` WHERE `id` = ?');
			$delgroupe->execute(array($idGroupe));
			$delgroupe->closeCursor();
		}

	}

	$reqDeleteLinks = $bdd->prepare('DELETE FROM `gulinks` WHERE userId = ?');
	$reqDeleteLinks->execute();




		/* // DEPRECATED
		$cursor = "outside";
		$idGroupe = "";
		foreach(str_split($user['groupe']) as $char ){ // Pour chaque groupe
			if($char == "[") {
				$cursor = "inside";
			} else if ($char == "]") {
				$cursor = "outside";

				// Sortir des groupes
				$membres = 0;
				$reqAllUsers = $bdd->prepare('SELECT `nom`, `groupe` FROM `users` WHERE `deleted` = 0');
				$reqAllUsers->execute();
				
				while($scanedUser = $reqAllUsers->fetch()){
					if (strpos($scanedUser['groupe'], "[". $idGroupe ."]") !== false) {
						$membres++;
					}
				}
				$reqAllUsers->closeCursor();


				if($membres == 1){

					$reqAllCourses = $bdd->prepare('SELECT id FROM courses WHERE groupe = ? ORDER BY id DESC');
					$reqAllCourses->execute(array($idGroupe));
					while($resCoursesGp = $reqAllCourses->fetch()){
						$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
						$delArticles->execute(array($resCoursesGp['id']));
					}
					$reqAllCourses->closeCursor();

					$delCourses = $bdd->prepare('DELETE FROM `courses` WHERE `groupe` = ?');
					$delCourses->execute(array($idGroupe));
					$delCourses->closeCursor();

					$delgroupe = $bdd->prepare('DELETE FROM `groupes` WHERE `id` = ?');
					$delgroupe->execute(array($idGroupe));
					$delgroupe->closeCursor();
				}
				

				$user['groupe'] = str_replace("[".$idGroupe."]","",$user['groupe']);

				$updateUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
				$updateUser->execute(array($user['groupe'], $user['id']));


				$idGroupe = "";
	
			} else if ($cursor == "inside") {
				$idGroupe .= $char;
			}
		
		}

		$updUser = $bdd->prepare('UPDATE `users` SET `nom` = "", `mail` = "", `pass` = "", `userId` = "", `clef` = "", `inviteKey` = 0, `activated` = 0, `pending` = "", `groupe` = "", `deleted` = 1 WHERE `id` = ?');
		$updUser->execute(array($user['id']));

		echo json_encode(array('status' => 200));
		
	} */

});

?>