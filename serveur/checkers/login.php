<?php

require_once('passFunctions.php');

function login( PDO $bdd, $callback){ // Rewite responses
	if(isset($_COOKIE['identificationToken'])){
		$validator = $_COOKIE['identificationToken'];
		$selector = substr($validator, 0, 5);


		$reqToken = $bdd->prepare('SELECT * FROM `tokens` WHERE `selector` = ?');
		$reqToken->execute(array($selector));

		if($reqToken->rowCount() == 1){
			$token = $reqToken->fetch();

			if(time() < $token['expires'] && verifyPassword($validator, $token['hashedValidator'])){
				$reqUser = $bdd->prepare("SELECT * FROM `users` WHERE id = ? AND  `deleted` = 0");
				$reqUser->execute(array($token['userId']));

				if ($reqUser->rowCount() == 1) {
					$user = $reqUser->fetch();


					if($user['activated']){
						call_user_func($callback, $user, $token);
					} else {
						echo json_encode(array('status' => 403 ,'payload' => array('err' => 'User Not Activated')));
					}

				} else {
					echo json_encode(array('status' => 401 ,'payload' => array('err' => 'User Not Found')));
				}
				$reqUser->closeCursor();
				
			} else {
				echo json_encode(array('status' => 401 ,'payload' => array('err' => 'Bad Token (Whrong or Expired)')));
			}

		} else {
			echo json_encode(array('status' => 401 ,'payload' => array('err' => 'Token Not Found')));
		}
		$reqToken->closeCursor();
		
	} else {
		echo json_encode(array('status' => 401 ,'payload' => array('err' => 'User Token Not Found, requires cookies')));
	}

}

?>