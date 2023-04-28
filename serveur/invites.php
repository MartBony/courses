<?php

require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkGroupe.php');

header('Content-Type: application/json');

function pushCousesIndependent(PDO $bdd, $user){
	if(isset($_POST['getInviteKey'])) {
		$key = rand(0, 999999);
		$hashedKey = hash('sha384', $key);
		$reqStoreId = $bdd->prepare('UPDATE `users` SET `inviteKey` = ? WHERE `id` = ?');
		$reqStoreId->execute(array($hashedKey, $user['id']));

		echo json_encode(array(
			'status' => 200,
			'payload' => array('key' => $key, 'deletethat' => $hashedKey)
		));

		return true;
	} else if(isset($_POST['pull'])){
		$groupes = array();

		$reqPullPendings = $bdd->prepare('SELECT g.nom, g.id 
			FROM `gulinks` as lks 
			INNER JOIN `groupes` as g 
			ON g.id = lks.groupeId 
			WHERE lks.userId = ? AND lks.active = 0');
		$reqPullPendings->execute(array($user['id']));

		while($groupe = $reqPullPendings->fetch()){
			array_push($groupes, array('id' => $groupe['id'], 'nom' => $groupe['nom']));
		}
		

		echo json_encode(array(
			'status' => 200,
			'payload' => array(
				'groupes' => $groupes
			)
		));
		
		return true;
	} else if(isset($_POST['accept'])){

		if(!isset($_POST['groupeId'])){
			echo json_encode(array('status' => 400, 'payload' => array('message' => 'Votre requête n\'est pas valide, actualisez et réessayez.')));
			return true;
		}

		$groupeId = (int) $_POST['groupeId'];

		$reqLink = $bdd->prepare('SELECT `id` FROM `gulinks` WHERE `userId` = ? AND `groupeId` = ? AND `active` = 0');
		$reqLink->execute(array($user['id'], $groupeId));

		if($reqLink->rowCount() == 1){
			$link = $reqLink->fetch();

			$updateLink = $bdd->prepare('UPDATE `gulinks` SET `active` = 1 WHERE `id` = ?');
			$updateLink->execute(array($link['id']));

			echo json_encode(array('status' => 200));
	
		}
		else {
			echo json_encode(array('status' => 400, 'payload' => array('message' => 'Nous ne trouvons pas votre invitation. Actualisez et réessayez.')));
		}
		
		return true;
	} else if(isset($_POST['reject'])){

		if(!isset($_POST['groupeId'])){
			echo json_encode(array('status' => 400, 'payload' => array('message' => 'Votre requête n\'est pas valide, actualisez et réessayez.')));
			return true;
		}

		$groupeId = (int) $_POST['groupeId'];

		$reqLink = $bdd->prepare('SELECT `id` FROM `gulinks` WHERE `userId` = ? AND `groupeId` = ? AND `active` = 0');
		$reqLink->execute(array($user['id'], $groupeId));

		if($reqLink->rowCount() == 1){
			$link = $reqLink->fetch();

			$updateLink = $bdd->prepare('DELETE FROM `gulinks` WHERE `id` = ?');
			$updateLink->execute(array($link['id']));

			echo json_encode(array('status' => 200));
	
		}
		else {
			echo json_encode(array('status' => 400, 'payload' => array('message' => 'Nous ne trouvons pas votre invitation. Actualisez et réessayez.')));
		}
		
		return true;
	}
}

function pushGroupeDependent(PDO $bdd, $user, $groupe){
	if(isset($_POST['createInvitation'])) {
		if(!isset($_POST['nom']) || !isset($_POST['code'])){
			echo json_encode(array('status' => 400, 'payload' => array('message' => 'Assurez-vous d\'avoir correctement rempli le formulaire.')));
			return true;
		}


		$reqInvited = $bdd->prepare('SELECT `id`, `premium` FROM `users` WHERE `inviteKey` = ? AND `nom` = ?');
		$reqInvited->execute(array(hash('sha384', $_POST['code']), $_POST['nom']));

		if($reqInvited->rowCount() == 1){
			$invited = $reqInvited->fetch();

			if(!$invited['premium']){
				$reqLinksNum = $bdd->prepare('SELECT COUNT(*) AS nbr FROM `gulinks` WHERE `userId` = ? AND `active` = 1');
				$reqLinksNum->execute(array($invited['id']));
				$linksNum = $reqLinksNum->fetch();
				if($linksNum['nbr'] > 2){
					echo json_encode(array('status' => 400, 'payload' => array('message' => 'L\'utilisateur à atteind son nombre maximal de groupe. Votre invité doit passer en premium ou bien quitter un de ses groupes.')));
					return true;
				}
			}

			$reqNoLink = $bdd->prepare('SELECT COUNT(*) AS nbr FROM `gulinks` WHERE `groupeId` = ? AND `userId` = ?');
			$reqNoLink->execute(array($groupe['id'], $invited['id']));
			$noLink = $reqNoLink->fetch();
			if($noLink["nbr"] == 0){

				$createLink = $bdd->prepare('INSERT INTO `gulinks` (`userId`, `groupeId`, `active`) VALUES (?,?,0)');
				$createLink->execute(array($invited['id'], $groupe['id']));

				echo json_encode(array('status' => 200));

			} else {
				echo json_encode(array('status' => 400, 'payload' => array('message' => 'L\'invitation n\'a pas pu être envoyée, vérifiez que l\'utilisateur n\'est pas déja invité ou membre du groupe.')));
			}

		} else {
			echo json_encode(array('status' => 400, 'payload' => array('message' => 'Les informations fournies ne correspondent à aucun utilisateur.')));
		}
		return true;
		
	}
}

login($bdd, function($user) use($bdd){
	if(!pushCousesIndependent($bdd, $user)){
		checkGroupe($bdd, $user, getPostGroupeId(), function($groupe) use ($user, $bdd){
			if(!pushGroupeDependent($bdd, $user, $groupe)){
				http_response_code(404);
				echo json_encode(array("status" => 404));
			}
		});
	}
});

?>