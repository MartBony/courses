<?php
require_once('checkers/checkGroupe.php');

function getLatestCourse($user, PDO $bdd, $callback) {
	checkGroupe($bdd, $user, function($user, $groupe) use ($bdd, $callback){
		if(isset($_POST['groupe']) && !empty($_POST['groupe'])){
			if (strpos($user['groupe'], $_POST['groupe']) !== false) {
			
				$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `id` = ?');
				$reqGroupe->execute(array($_POST['groupe']));
				$reqGroupe->closeCursor();

				if ($reqGroupe->rowCount() == 1){
					$reqUsedCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC LIMIT 0,1');
					$reqUsedCourse->execute(array($_POST['groupe']));
					if($reqUsedCourse->rowCount() == 1){
						$usedCourse = $reqUsedCourse->fetch();
						call_user_func($callback, $user, $usedCourse, $bdd);

					}
				} else {
					echo json_encode(array('status' => 404));
				}

			} else {
				echo json_encode(array('status' => 403));
			}
		} else {
			echo json_encode(array('status' => 412));
		}
	});
}

?>