<?php

require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkGroupe.php');

header('Content-Type: application/json');

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['getInviteKey'])) {
		$id = rand(0, 999999);
		$reqStoreId = $bdd->prepare('UPDATE `users` SET `inviteKey` = ? WHERE id = ?');
		$reqStoreId->execute(array($id, $user['id']));

		http_response_code(200);
		echo json_encode(array(
			'id' => $id,
			'user' => $user['id']
		));

		return true;
	} else if(isset($_POST['pull'])){
		$groupes = array();

		$reqPullPendings = $bdd->prepare('SELECT `pending` FROM `users` WHERE `id` = ?');
		$reqPullPendings->execute(array($user['id']));
		$pullPendings = $reqPullPendings->fetch();
		$reqPullPendings->closeCursor();

		if($reqPullPendings->rowCount() == 1){
			$cursor = "outside";
			$idGroupe = "";
		
			foreach(str_split($pullPendings['pending']) as $char ){
				if($char == "[") {
					$cursor = "inside";
				} else if ($char == "]") {
					$cursor = "outside";

					$reqAskingGroupe = $bdd->prepare('SELECT `nom` FROM `groupes` WHERE `id` = ?');
					$reqAskingGroupe->execute(array($idGroupe));
					$groupe = $reqAskingGroupe->fetch();
					if($reqAskingGroupe->rowCount() == 1){
						array_push($groupes, array('id' => $idGroupe, 'nom' => $groupe['nom']));
					}
					$reqAskingGroupe->closeCursor();

					$idGroupe = "";
		
				} else if ($cursor == "inside") {
					$idGroupe .= $char;
				}
			
			}

		}

		http_response_code(200);
		echo json_encode(array(
			'groupes' => $groupes
		));
		
		return true;
	} else if(isset($_POST['accept']) && isset($_POST['id'])){
		$id = $_POST['id'];

		$reqPullPendings = $bdd->prepare('SELECT `pending` FROM `users` WHERE `id` = ?');
		$reqPullPendings->execute(array($user['id']));
		$pullPendings = $reqPullPendings->fetch();
		$reqPullPendings->closeCursor();
		$gotIt = false;

		if($reqPullPendings->rowCount() == 1){

			$cursor = "outside";
			$idGroupe = "";
			foreach(str_split($pullPendings['pending']) as $char ){
				if($char == "[") {
					$cursor = "inside";
				} else if ($char == "]") {
					$cursor = "outside";

					if($idGroupe == $id){
						if (strpos($user['groupe'], '['. $id .']') !== false) {
							$newString = str_replace("[".$id."]","",$pullPendings['pending']);
							$updateUser = $bdd->prepare('UPDATE `users` SET `pending` = ? WHERE `id` = ?');
							$updateUser->execute(array($newString, $user['id']));
		
							$insertUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
							$insertUser->execute(array(( "[". $idGroupe ."]". $user['groupe']), $user['id']));
		
							http_response_code(200);
							echo json_encode(array());
							$gotIt = true;
						} else {
							http_response_code(403);
							echo json_encode(array('err' => 'Already present'));
						}
						break;
					}

					$idGroupe = "";
		
				} else if ($cursor == "inside") {
					$idGroupe .= $char;
				}
			
			}

		}

		if(!$gotIt){
			http_response_code(404);
			echo json_encode(array('err' => 'Not Proposed'));
		}
		
		return true;
	} else if(isset($_POST['reject']) && isset($_POST['id'])){
		$id = $_POST['id'];

		$reqPullPendings = $bdd->prepare('SELECT `pending` FROM `users` WHERE `id` = ?');
		$reqPullPendings->execute(array($user['id']));
		$pullPendings = $reqPullPendings->fetch();
		$reqPullPendings->closeCursor();
		$gotIt = false;

		if($reqPullPendings->rowCount() == 1){

			$cursor = "outside";
			$idGroupe = "";
			foreach(str_split($pullPendings['pending']) as $char ){
				if($char == "[") {
					$cursor = "inside";
				} else if ($char == "]") {
					$cursor = "outside";

					if($idGroupe == $id){
						$newString = str_replace("[". $id ."]","",$pullPendings['pending']);
						$updateUser = $bdd->prepare('UPDATE `users` SET `pending` = ? WHERE `id` = ?');
						$updateUser->execute(array($newString, $user['id']));

						http_response_code(200);
						echo json_encode(array());
						$gotIt = true;
	
						break;
					}

					$idGroupe = "";
		
				} else if ($cursor == "inside") {
					$idGroupe .= $char;
				}
			
			}

		}

		if(!$gotIt){
			http_response_code(404);
			echo json_encode(array('err' => 'Not Proposed'));
		}
		
		return true;
	}
}

function pushGroupeDependent($user, $groupe, PDO $bdd){
	if(isset($_POST['invite']) && isset($_POST['nom']) && isset($_POST['key'])) {

		$reqInvited = $bdd->prepare('SELECT `pending`, `id`,`groupe` FROM `users` WHERE `inviteKey` = ? AND nom = ?');
		$reqInvited->execute(array($_POST['key'], $_POST['nom']));
		$invited = $reqInvited->fetch();
		if($reqInvited->rowCount() == 1){
			if(strpos($invited['groupe'], "[".$groupe['id']."]") === false && strpos($invited['pending'], "[".$groupe['id']."]") === false){

				$reqInvited->closeCursor();
				$setPending = $bdd->prepare('UPDATE `users` SET `pending` = ? WHERE id = ?');
				$setPending->execute(array( "[". $groupe['id'] ."]" . $invited['pending'], $invited['id']));
				$setPending->closeCursor();
				http_response_code(200);
				echo json_encode(array());

			} else {
				http_response_code(403);
				echo json_encode(array());
			}

		} else {
			http_response_code(404);
			echo json_encode(array('err' => 'No User Found'));
		}
		
	}
}

login($bdd, function($user) use($bdd){
	if(!pushCousesIndependent($user, $bdd)){
		checkGroupe($bdd, $user, function($user, $groupe) use ($bdd){
			pushGroupeDependent($user, $groupe, $bdd);
		});
	}
});

?>