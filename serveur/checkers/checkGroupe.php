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
				echo json_encode(array('status' => 404, 'payload' => array('type' => 'ERROR', 'message' => 'Nous ne trouvons pas votre groupe.')));
				return true;
			}
			$reqUsedGroupe->closeCursor();
			
		} else {
			echo json_encode(array('status' => 404, 'payload' => array('type' => 'ERROR', 'message' => 'Le groupe demandé est inacessible.')));
			return true;
		}
	} else {
		echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Votre requête est invalide. Rechargez la page et réessayez.')));
		return true;
	}
}

?>