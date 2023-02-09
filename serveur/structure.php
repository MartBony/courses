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

}

login($bdd, function($user) use ($bdd){
	groupes($user, $bdd);
});

?>