<?php
require_once('../dbConnect.php');
require_once('checkers/passFunctions.php');

$msg = "";

if(isset($_GET['mail']) && isset($_GET['clef'])){
	$mail = $_GET['mail'];
	$clef = $_GET['clef'];

	$reqUser = $bdd->prepare('SELECT id, clef FROM users WHERE mail = ? AND `deleted` = 0');
	$reqUser->execute(array($mail));

	if ($reqUser->rowCount() == 1) {
		$user = $reqUser->fetch();

		if(verifyPassword($clef, $user['clef'])){
			$activate = $bdd->prepare('UPDATE `users` SET `activated` = 1 WHERE `id` = ?');
			$activate->execute(array($user['id']));
			$msg = "Nous avons pu vérifier votre e-mail, veuillez vous rendre sur la page d'accueil du site pour vous connecter.";
	
		} else $msg = "La clef fournie est invalide, veuillez réessayer.";

	} else $msg = "Votre email n'est pas renseignée sur le site.";

} else{
	header('Location: ../index.php');
}

?>
	
<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<title>Verification de votre email.</title>
</head>
<body>
	
	<?php
		echo $msg;
	?>
	<a href="../index.php">Retourner sur la page d'acceuil.</a>
</body>
</html>