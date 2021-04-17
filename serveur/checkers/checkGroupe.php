<?php

function getPostGroupeId(){
	if(isset($_POST['groupe']) && !empty($_POST['groupe'])){
		return $_POST['groupe'];
	} else {
		return NULL;
	}
}

function checkGroupe(PDO $bdd, $user, $groupeId, $callback) {
	if($groupeId){
		$groupeId = (int) $groupeId;
		$reqGULink = $bdd->prepare("SELECT `id` FROM `gulinks` WHERE userId = ? AND groupeId = ?");
		$reqGULink->execute(array($user['id'], $groupeId));

		if($reqGULink->rowCount() == 1){
			$reqUsedGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `id` = ?');
			$reqUsedGroupe->execute(array($groupeId));
			if($reqUsedGroupe->rowCount() == 1){
				$groupe = $reqUsedGroupe->fetch();
				return call_user_func($callback, $user, $groupe);
			} else {
				echo json_encode(array('status' => 404, 'payload' => array('err' => 'Groupe Not Found')));
				return true;
			}
			$reqUsedGroupe->closeCursor();
			
		} else {
			echo json_encode(array('status' => 404, 'payload' => array('err' => 'User not linked to requested groupe')));
			return true;
		}
	} else {
		echo json_encode(array('status' => 400, 'payload' => array('err' => 'No groupe id in request')));
		return true;
	}
}

?>