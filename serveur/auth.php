<?php

require('../dbConnect.php');

header('Content-Type: application/json');

function generateRandomString($length) {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for ($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}

if(isset($_POST['inscript'])){


	if(isset($_POST['mail']) && isset($_POST['pass']) && isset($_POST['passConf']) && isset($_POST['nom'])){
		$mail = htmlspecialchars($_POST['mail']);
		$pass = $_POST['pass'];
		$passConf = $_POST['passConf'];
		$nom = htmlspecialchars($_POST['nom']);

		if(preg_match("/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/", $mail)){
			if(strlen($pass) > 6){
				if($pass == $passConf){
					if(preg_match("/^[a-zA-Z0-9._-]{2,20}$/", $nom)){
						inscrire($bdd, $mail, $pass, $nom);
					} else echo json_encode(array('status' => 400, 'err' => 'nom'));
				} else echo json_encode(array('status' => 400, 'err' => 'diff'));
			} else echo json_encode(array('status' => 400, 'err' => 'pass'));
		} else echo json_encode(array('status' => 400, 'err' => 'mail'));
	} else echo json_encode(array('status' => 400, 'err' => 'manquant'));


} else if (isset($_POST['confirm'])) {

	if(isset($_POST['mail']) && isset($_POST['clef'])){
		$mail = htmlspecialchars($_POST['mail']);
		$clef = hash('sha512', $_POST['clef']);

		$reqUser = $bdd->prepare(
			'SELECT * FROM users 
			WHERE mail = ? AND clef = ? AND `deleted` = 0'
		);
		$reqUser->execute(array($mail, $clef));

		if ($reqUser->rowCount() == 1) {
			$user = $reqUser->fetch();
			$activate = $bdd->prepare('UPDATE `users` SET `activated` = ? WHERE `id` = ?');
			$activate->execute(array(true, $user['id']));
			
			echo json_encode(array('status' => 200, 'mail' => $user['mail']));

		} else echo json_encode(array('status' => 401, 'err' => 'wrong'));
		$reqUser->closeCursor();

	} else echo json_encode(array('status' => 400, 'err' => 'manquant'));
	
} else if (isset($_POST['connect'])) {

	if(isset($_POST['mail']) && isset($_POST['pass'])){
		$mail = htmlspecialchars($_POST['mail']);
		$pass = $_POST['pass'];

		connect($bdd, $mail, $pass);
	} else echo json_encode(array('status' => 400, 'err' => 'manquant'));

} else if (isset($_POST['tryCookiesAuth'])) {

	if(isset($_COOKIE['email']) && isset($_COOKIE['pass'])){
		$mail = htmlspecialchars($_COOKIE['email']);
		$pass = $_COOKIE['pass'];

		connect($bdd, $mail, $pass);
	} else echo json_encode(array('status' => 204));

} else if (isset($_POST['deconnect'])){
	setcookie("email", "", time() - 3600, '/', null, false, true);
	setcookie("pass", "", time() - 3600, '/', null, false, true);

	echo json_encode(array('status' => 200));
}

function connect(PDO $bdd, $mail, $pass){
	$reqPreUser = $bdd->prepare('SELECT `salage` FROM `users` WHERE `mail` = ?AND `deleted` = 0');
	$reqPreUser->execute(array($mail));

	if ($reqPreUser->rowCount() == 1) {
		$preUser = $reqPreUser->fetch();
		$hash = hash('sha512', $preUser['salage'].$pass);

		$reqUser = $bdd->prepare('SELECT * FROM users WHERE mail = ? AND pass = ? AND `deleted` = 0');
		$reqUser->execute(array($mail, $hash));

		if ($reqUser->rowCount() == 1) {
			$user = $reqUser->fetch();
			if($user['activated']){
				setcookie("email", $user['mail'], time() + 31*24*3600, '/', null, false, true);
				setcookie("pass", $pass, time() + 31*24*3600, '/', null, false, true);
				echo json_encode(array('status' => 200, 'mail' => $mail, 'nom' => $user['nom']));
			} else {
				$clef = generateRandomString(30);

				$updateClef = $bdd->prepare('UPDATE `users` SET clef = ? WHERE id = ?');
				$updateClef->execute(array(hash('sha512',$clef), $user['id']));

				/* 	// Configuration du mail
				$to = $mail;
				$subject = "Courses - Activer votre compte" ;
				$from = 'gestion@mprojects.fr';
					
				// To send HTML mail, the Content-type header must be set
				$headers  = 'MIME-Version: 1.0' . "\r\n";
				$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
					
				// Create email headers
				$headers .= 'From: '.$from."\r\n".
					'Reply-To: '.$from."\r\n" .
					'X-Mailer: PHP/' . phpversion();
					
				// Compose a simple HTML email message
				$message = '<html><body>';

				require("templateMail.php");

				$message .= '</body></html>';
					
				// Sending email
				if(mail($to, $subject, $message, $headers)){ */
					$send = true;
			/* 	} else{
					$send = false;
				} */
		
				echo json_encode(array('status' => 403, 'err' => 'nonActivated','sent' => $send));
			}
		} else echo json_encode(array('status' => 401, 'err' => 'credential'));
		$reqUser->closeCursor();

	} else echo json_encode(array('status' => 401, 'err' => 'noEmail'));
	$reqPreUser->closeCursor();
}

function inscrire(PDO $bdd, $mail, $pass, $nom){
	$salage = generateRandomString(3);
	$salted = $salage.$pass;
	$hash = hash('sha512', $salted);

	$reqUser = $bdd->prepare('SELECT * FROM users WHERE mail = ? AND `deleted` = 0');
	$reqUser->execute(array($mail));
	$user = $reqUser->fetch();

	if ($reqUser->rowCount() == 0) {
		$clef = generateRandomString(30);

		$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (nom) VALUES (?)'); // Create groupe
		$insertGroupe->execute(array("Groupe de ".$nom));

		$reqGroupe = $bdd->prepare('SELECT `id` FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
		$reqGroupe->execute(array("Groupe de ".$nom));
		$groupe = $reqGroupe->fetch();

		$setUser = $bdd->prepare('INSERT INTO `users`
			(`mail`, `pass`, `salage`, `nom`, `clef`, `activated`, `hueColor`, `groupe`, `inviteKey`, `pending`, `deleted`)
			VALUES (:mail,:pass,:salage,:nom,:clef, 0,:hueColor,:groupe,:inviteKey,"",0)');
		$setUser->execute(array(
			'mail' => $mail,
			'pass' => $hash,
			'salage' => $salage,
			'nom' => $nom,
			'clef' => hash('sha512', $clef),
			'hueColor' => rand(0,359),
			'groupe' => "[".$groupe['id']."]",
			'inviteKey' => rand(0, 999999)
		));

	/* 	// Configuration du mail
		$to = $mail;
		$subject = "Courses - Activer votre compte" ;
		$from = 'gestion@mprojects.fr';
			
		// To send HTML mail, the Content-type header must be set
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
			
		// Create email headers
		$headers .= 'From: '.$from."\r\n".
			'Reply-To: '.$from."\r\n" .
			'X-Mailer: PHP/' . phpversion();
			
		// Compose a simple HTML email message
		$message = '<html><body>';

		require("templateMail.php");

		$message .= '</body></html>';
			
		// Sending email
		if(mail($to, $subject, $message, $headers)){ */
			$send = true;
	/* 	} else{
			$send = false;
		} */

		echo json_encode(array('status' => 200, 'sent' => $send));

	} else echo json_encode(array('status' => 401, 'err' => 'exists'));

	$reqUser->closeCursor();

}

?>