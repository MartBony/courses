<?php

require_once('../dbConnect.php');
require_once('checkers/passFunctions.php');
require_once('checkers/login.php');

header('Content-Type: application/json');

if(isset($_POST['inscription'])){


	if(isset($_POST['mail']) && isset($_POST['pass']) && isset($_POST['passConf']) && isset($_POST['nom'])){
		$mail = htmlspecialchars($_POST['mail']);
		$pass = $_POST['pass'];
		$passConf = $_POST['passConf'];
		$nom = htmlspecialchars($_POST['nom']);

		if(preg_match("/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/", $mail)){
			if(strlen($pass) >= 6){
				if($pass == $passConf){
					if(preg_match("/^[a-zA-Z0-9._-áàäâéèëêòôóöîïûúùü]{2,20}$/", $nom)){
						inscrire($bdd, $mail, $pass, $nom);
					} else echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Votre nom contient des caractères interdits.')));
				} else echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Vous mots de passe ne correspondent pas.')));
			} else echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Votre mot de passe est trop court.')));
		} else echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Veuillez entrer un email valide.')));
	} else echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Le formulaire n\'est pas entièrement rempli.')));


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
			
			echo json_encode(array('mail' => $user['mail']));

		} else echo json_encode(array('status' => 401, 'err' => 'wrong'));
		$reqUser->closeCursor();

	} else echo json_encode(array('status' => 400, 'err' => 'manquant'));
	
} else if (isset($_POST['connect'])) {

	if(isset($_POST['mail']) && isset($_POST['pass'])){
		connect($bdd, $_POST['mail'], $_POST['pass']);
	} else echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'Email ou mot de passe manquant')));

} else if (isset($_POST['tryCookiesAuth'])) {

	login($bdd, function($user, $oldToken) use ($bdd){
		$newToken = generateToken();
		$setToken = $bdd->prepare("UPDATE `tokens` 
			SET `selector` = :selector, `hashedValidator` = :hashedValidator, `expires` = :expires
			WHERE `id` = :oldTokenId");
		$setToken->execute(array(
			'selector' => $newToken['selector'],
			'hashedValidator' => $newToken['hashedValidator'],
			'expires' => $newToken['expires'],
			'oldTokenId' => $oldToken['id']
		));

		setcookie("identificationToken", $newToken['validator'], array(
			'expires' => $newToken['expires'],
			'path' => '',
			'secure' => true,
			'samesite' => 'strict',
			'httponly' => true
		));

		
		echo json_encode(array(
			'status' => 200,
			'payload' => array(
				'userId' => $user['userId']
			)
		));
	});

} else if (isset($_POST['deconnect'])){
	/* setcookie("email", "", time() - 3600, '/', null, false, true);
	setcookie("pass", "", time() - 3600, '/', null, false, true); */
	
	if(login($bdd, function($user, $oldToken) use ($bdd){
		$deleteToken = $bdd->prepare("DELETE FROM `tokens` 
			WHERE `id` = ?");
		$deleteToken->execute(array($oldToken['id']));
	})){

		setcookie("identificationToken", "", array(
			'expires' => time() - 3600,
			'path' => '',
			'secure' => true,
			'samesite' => 'strict',
			'httponly' => true
		));

		echo json_encode(array('status' => 200));
	}
}

function connect(PDO $bdd, $mail, $pass){
	$mail = htmlspecialchars($mail);
	$reqUser = $bdd->prepare('SELECT * FROM `users` WHERE `mail` = ? AND `deleted` = 0');
	$reqUser->execute(array($mail));

	if ($reqUser->rowCount() == 1) {
		$user = $reqUser->fetch();

		if (verifyPassword($pass, $user['pass'])) {
			if($user['activated']){
				/* setcookie("email", $user['mail'], array(
					'expires' => time() + 31*24*3600,
					'path' => '',
					'secure' => true,
					'samesite' => 'strict',
					'httponly' => true
				));
				setcookie("pass", $pass, array(
					'expires' => time() + 31*24*3600,
					'path' => '',
					'secure' => true,
					'samesite' => 'strict',
					'httponly' => true
				)); */

				$token = generateToken();
				$setToken = $bdd->prepare("
					INSERT INTO `tokens` 
					(`selector`, `hashedValidator`, `userId`, `expires`) 
					VALUES (:selector, :hashedValidator, :userId, :expires)
				");
				$setToken->execute(array(
					'selector' => $token['selector'],
					'hashedValidator' => $token['hashedValidator'],
					'userId' => $user['id'],
					'expires' => $token['expires']
				));

				setcookie("identificationToken", $token['validator'], array(
					'expires' => $token['expires'],
					'path' => '',
					'secure' => true,
					'samesite' => 'strict',
					'httponly' => true
				));
				
				echo json_encode(array(
					'status' => 200,
					'payload' => array('userId' => $user['userId'])
				));
			} else {
				$isSent = false;
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
				if(mail($to, $subject, $message, $headers)){
					$isSent = true;
			 	} else{
					$isSent = false;
				} */
		
				if($isSent) echo json_encode(array('status' => 403, 'payload' => array('type' => 'ERROR', 'message' => 'Votre compte n\'est pas encore actif, nous vous envoyons un email pour confirmez votre identité.')));
				else echo json_encode(array('status' => 403, 'payload' => array('type' => 'ERROR', 'message' => 'Votre compte n\'est pas encore actif mais l\'envoi d\'un email de confirmation à échoué.')));
			}
		} else echo json_encode(array('status' => 401, 'payload' => array('type' => 'ERROR', 'message' => 'Votre mot de passe est incorrect.')));

	} else echo json_encode(array('status' => 401, 'payload' => array('type' => 'ERROR', 'message' => 'Cet email n\'est pas rensignée sur notre site.')));
	$reqUser->closeCursor();
}

function inscrire(PDO $bdd, $mail, $pass, $nom){
	$reqUser = $bdd->prepare('SELECT * FROM users WHERE mail = ? AND `deleted` = 0');
	$reqUser->execute(array($mail));

	if ($reqUser->rowCount() == 0) {
		// Create unique userID
		$resUniqueId = -1;
		$reqUniqueId = $bdd->prepare('SELECT COUNT(*) AS nbr FROM `users` WHERE `userId` = ?');
		while($resUniqueId != 0){
			$userId = generateRandomString(10);
			$reqUniqueId->execute(array($userId));
			$resUniqueId = ($resUniqueId->fetch())['nbr'];
			$reqUniqueId->closeCursor();
		}

		$pass = hashPassword($pass);
		$clef = generateRandomString(6);

		$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (nom) VALUES (?)'); // Create groupe
		$insertGroupe->execute(array("Groupe de ".$nom));

		$reqGroupe = $bdd->prepare('SELECT `id` FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
		$reqGroupe->execute(array("Groupe de ".$nom));
		$groupe = $reqGroupe->fetch();

		$createGroupLink = $bdd->prepare('
			INSERT INTO `gulinks`
			(`userId`, `groupeId`, `active`)
			VALUES (:userId, :groupeId, 1)
		');
		$createGroupLink->execute(array(
			"userId" => $userId,
			"groupeId" => $groupe['id']
		));

		$setUser = $bdd->prepare('INSERT INTO `users`
			(`mail`, `pass`, `userId`, `nom`, `clef`, `activated`, `hueColor`, `inviteKey`, `pending`, `deleted`)
			VALUES (:mail,:pass,:userId,:nom,:clef, 0,:hueColor,:inviteKey,"",0)');
		$setUser->execute(array(
			'mail' => $mail,
			'pass' => $pass,
			'userId' => $userId,
			'nom' => $nom,
			'clef' => hashPassword($clef),
			'hueColor' => rand(0,359),
			'inviteKey' => rand(0, 999999)
		));

		// Configuration du mail
		if($_SERVER['SERVER_NAME'] != "localhost"){
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
			$message .= '
				<html><body>
					<section style="background: #eee;padding: 20px 10px;">
						<header style="width: 100%;margin-bottom: 20px;">
							<h1 style="display:inline;margin: 0px;text-transform: uppercase; font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif; font-weight: 700; font-size: 2.5em; color: #0078d4;">Courses</h1>
						</header><br><br><br>
						<section style="margin-top: 30px;width: 100%;">
							<p style="margin: 0px;box-sizing: border-box;color: #333;font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif; font-weight: 700; font-size: 1.5em;">Vous pouvez des a present acceder a votre compte avec ce lien</p> <br>

							<a style="color: white;font-size: 1.5em;font-weight:600;background: #0078d4;text-decoration: none;font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif;padding: 5px;" href="http://mprojects.fr/courses/index.php?mail='.$mail.'&auth='.$clef.'">Cliquez ici</a> <br> <br>
							<hr> <br>
							<a style="color: black;font-size: 1.5em;font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif; font-weight: 700;color: #666;">Ou copiez/collez ce lien dans votre navigateur http://mprojects.fr/courses/index.php?mail='.$mail.'&auth='.$clef.'</a><br><br><br><br>
							<span style="display: block;margin-top: 60px;font-style: 1em;">Ceci est un mail automatique, Merci de ne pas y repondre.;</span>
						</section>
					</section>
				</body></html>';
				
			// Sending email
			if(mail($to, $subject, $message, $headers)){
				echo json_encode(array('status' => 200));
		 	} else{
				echo json_encode(array('status' => 200, 'payload' => array('type' => "WARNING", 'message' => 'VOus êtes correctement inscrits mais nous ne parvenons pas à vous envoyer un email de confirmation.')));
			}

		} else echo json_encode(array('status' => 200, 'payload' => array('type' => "WARNING", 'message' => 'Le serveur local ne peut pas envoyer de mail de vérification.')));


	} else echo json_encode(array('status' => 401, 'payload' => array('type' => "ERROR", 'message' => 'Cet email est déja renseignée.')));

	$reqUser->closeCursor();

}

?>