<?php

function checkGroupe(PDO $bdd, $user, $callback) {
	if(isset($_POST['groupe']) && !empty($_POST['groupe'])){
		if(strpos($user['groupe'], "[". $_POST['groupe'] ."]") !== false){
			$reqUsedGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `id` = ?');
			$reqUsedGroupe->execute(array($_POST['groupe']));
			if($reqUsedGroupe->rowCount() == 1){
				$groupe = $reqUsedGroupe->fetch();
				return call_user_func($callback, $user, $groupe);
			} else {
				http_response_code(404);
				echo json_encode(array('status' => 404));
				return true;
			}
			$reqUsedGroupe->closeCursor();
			
		} else {
			http_response_code(403);
			echo json_encode(array('status' => 403));
			return true;
		}
	} else {
		http_response_code(412);
		echo json_encode(array('status' => 412));
		return true;
	}
}

?>