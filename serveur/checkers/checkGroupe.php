<?php

function checkGroupe($user, PDO $bdd, $callback) {
	if(isset($_POST['groupe']) && !empty($_POST['groupe'])){
		if(strpos($user['groupe'], $_POST['groupe']) !== false){
			$reqUsedGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `id` = ?');
			$reqUsedGroupe->execute(array($_POST['groupe']));
			$reqUsedGroupe->closeCursor();
			if($reqUsedGroupe->rowCount() == 1){
				call_user_func($callback, $user, $reqUsedGroupe->fetch(), $bdd);
			} else {
				echo json_encode(array('status' => 404));
			}
			
		} else {
			echo json_encode(array('status' => 403));
		}
	} else {
		echo json_encode(array('status' => 412));
	}
}

?>