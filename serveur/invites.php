<?php

require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkGroupe.php');

header('Content-type: application/json');

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['getInviteKey'])) {
		$id = rand(0, 999999);
		$reqStoreId = $bdd->prepare('UPDATE `users` SET `inviteKey` = ? WHERE id = ?');
		$reqStoreId->execute(array($id, $user['id']));

		echo json_encode(array(
			'status' => 200,
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

		echo json_encode(array(
			'status' => 200,
			'groupes' => $groupes
		));
		
		return true;
	} else if(isset($_POST['push']) && isset($_POST['id'])){
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
						$newString = str_replace("  ", " ", str_replace("[".$id."]","",$pullPendings['pending']));
						$updateUser = $bdd->prepare('UPDATE `users` SET `pending` = ? WHERE `id` = ?');
						$updateUser->execute(array($newString, $user['id']));
	
						$insertUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
						$insertUser->execute(array(( "[". $idGroupe ."] ". $user['groupe']), $user['id']));
	
						echo json_encode(array('status' => 200));
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
			echo json_encode(array('status' => 204));
		}
		
		return true;
	} else if(isset($_POST['remove']) && isset($_POST['id'])){
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
						$newString = str_replace("  ", " ", str_replace("[". $id ."]","",$pullPendings['pending']));
						$updateUser = $bdd->prepare('UPDATE `users` SET `pending` = ? WHERE `id` = ?');
						$updateUser->execute(array($newString, $user['id']));
	
						echo json_encode(array('status' => 200));
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
			echo json_encode(array('status' => 204));
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
				echo json_encode(array('status' => 200));

			} else {
				echo json_encode(array('status' => 403));
			}

		} else {
			echo json_encode(array('status' => 400));
		}
	}
}

login($bdd, function($user, $bdd){
	if(!pushCousesIndependent($user, $bdd)){
		checkGroupe($user, $bdd, function($user, $groupe, $bdd){
			pushGroupeDependent($user, $groupe, $bdd);
		});
	}
});

?>