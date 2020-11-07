<?php

function login( PDO $bdd, $callback){
	if(isset($_COOKIE['email']) && isset($_COOKIE['pass'])){
		$mail = htmlspecialchars($_COOKIE['email']);
		$pass = $_COOKIE['pass'];

		$reqPreUser = $bdd->prepare('SELECT `salage` FROM `users` WHERE `mail` = ? AND `deleted` = 0');
		$reqPreUser->execute(array($mail));

		if ($reqPreUser->rowCount() == 1) {
			$preUser = $reqPreUser->fetch();
			$hash = hash('sha512', $preUser['salage'].$pass);

			$reqUser = $bdd->prepare('SELECT * FROM users WHERE mail = ? AND pass = ? AND `deleted` = 0');
			$reqUser->execute(array($mail, $hash));

			if ($reqUser->rowCount() == 1) {
				$user = $reqUser->fetch();
				if($user['activated']){
					call_user_func($callback, $user);
				} else {
					http_response_code(403);
					echo json_encode(array('notAuthed' => true, 'err' => 'authNonActivated','sent' => $send));
				}
			} else {
				http_response_code(401);
				echo json_encode(array('err' => 'authCredential'));
			}
			$reqUser->closeCursor();

		} else {
			http_response_code(401);
			echo json_encode(array('err' => 'authNoEmail'));
		}
		$reqPreUser->closeCursor();
		
	} else {
		http_response_code(204);
		echo json_encode(array('notAuthed' => true, 'err' => 'authCookies'));
	}

}

?>