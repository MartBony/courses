<?php

require_once('passFunctions.php');

function login( PDO $bdd, $callback){ // Rewite responses
	if(isset($_COOKIE['identificationToken'])){
		$validator = $_COOKIE['identificationToken'];
		$selector = getSelector($validator);

		$reqToken = $bdd->prepare('SELECT * FROM `tokens` WHERE `selector` = ?');
		$reqToken->execute(array($selector));

		if($reqToken->rowCount() >= 1){
			$token = $reqToken->fetch();

			if(time() < $token['expires'] && verifyPassword($validator, $token['hashedValidator'])){
				$reqUser = $bdd->prepare("SELECT * FROM `users` WHERE id = ? AND  `deleted` = 0");
				$reqUser->execute(array($token['userId']));

				if ($reqUser->rowCount() == 1) {
					$user = $reqUser->fetch();


					if($user['activated']){
						call_user_func($callback, $user, $token);
					} else {
						echo json_encode(array('status' => 403, 'action' => 'authenticate', 'payload' => array('type' => 'ERROR', 'title' => "Votre compte n'est pas encore actif, connectez-vous pour recevoir un email de confirmation.")));
					}

				} else {
					echo json_encode(array('status' => 401, 'action' => 'authenticate', 'payload' => array('type' => 'ERROR', 'title' => "Nous ne reconnaissons pas votre compte, connectez-vous de nouveau.")));
				}
				$reqUser->closeCursor();
				
			} else {
				echo json_encode(array('status' => 401, 'action' => 'authenticate', 'payload' => array('type' => 'MSG', 'title' => "Pour votre sécurité, connectez-vous de nouveau")));
			}

		} else {
			echo json_encode(array('status' => 401, 'action' => 'authenticate', 'payload' => array('type' => 'ERROR', 'title' => "Nous n'arrivons pas à vous identifier, connectez-vous de nouveau.")));
		}
		$reqToken->closeCursor();
		
	} else {
		echo json_encode(array('status' => 401, 'action' => 'authenticate', 'payload' => array('type' => 'ERROR', 'title' => "Nous n'arrivons pas à vous identifier, activez vos cookies et connectez-vous de nouveau.")));
	}

}

?>