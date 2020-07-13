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
				} else echo json_encode(array('status' => 403, 'notAuthed' => true, 'err' => 'authNonActivated','sent' => $send));
			} else echo json_encode(array('status' => 401, 'err' => 'authCredential'));
			$reqUser->closeCursor();

		} else echo json_encode(array('status' => 401, 'err' => 'authNoEmail'));
		$reqPreUser->closeCursor();
		
	} else echo json_encode(array('status' => 204, 'notAuthed' => true, 'err' => 'authCookies'));

}

?>