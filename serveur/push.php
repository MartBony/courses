<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
header('Content-type: application/json');

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['submitCourse'])) {
		$titre = htmlspecialchars((string)  $_POST['titre']);
		$maxPrice = htmlspecialchars((string)  $_POST['maxPrice']);

		$insert = $bdd->prepare('INSERT INTO courses (nom, maxprice, groupe) VALUES (?,?,?)');
		$insert->execute(array($titre, $maxPrice, $_POST['groupe']));

		echo json_encode(['done']);
		return true;

	} else {
		return false;
	}
}

function push($user, $usedCourse, PDO $bdd){

	if (isset($_POST['submitArticle'])) {
		$titre = htmlspecialchars((string) $_POST['titre']);
		$prix = (float) $_POST['prix'];

		$insertArt = $bdd->prepare('INSERT INTO articles (titre, prix, course, preview, idAuteur) VALUES (?,?,?,0,?)');
		$insertArt->execute(array($titre, $prix, $usedCourse['id'], $user['id']));

		$updCourse = $bdd->prepare('UPDATE courses SET total=? WHERE id=?');
		$updCourse->execute(array($usedCourse['total'] + $prix, $usedCourse['id']));

		$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
		$reqIdInserted->execute(array($usedCourse['id']));
		$idInserted = $reqIdInserted->fetch();
		echo json_encode([
			'id' => $idInserted['id'],
			'titre' => $titre,
			'prix' => $prix
		]);

		return true;
	}
	elseif (isset($_POST['submitPreview'])) {
		$titre = htmlspecialchars((string) $_POST['titre']);

		$insertArt = $bdd->prepare('INSERT INTO articles (titre, prix, course, preview, idAuteur) VALUES (?,0,?,1,?)');
		$insertArt->execute(array($titre, $usedCourse['id'], $user['id']));

		$reqIdInserted = $bdd->prepare('
			SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
		$reqIdInserted->execute(array($usedCourse['id']));
		$idInserted = $reqIdInserted->fetch();
		echo json_encode([
			'id'=> $idInserted['id'],
			'titre'=> $titre,
			'color' => $user['hexColor']
		]);
		
		return true;
	}
	elseif (isset($_POST['deleteArticle'])) {
		$_POST['id'] = (int) $_POST['id'];

		$reqIdDeleted = $bdd->prepare('SELECT prix FROM articles WHERE id = ?');
		$reqIdDeleted->execute(array((int) $_POST['id']));
		$idDeleted = $reqIdDeleted->fetch();

		$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
		$reqDelete->bindParam(':index', $_POST['id'], PDO::PARAM_INT);
		$reqDelete->execute();

		$updCourse = $bdd->prepare('UPDATE courses SET total=? WHERE id=?');
		$updCourse->execute(array($usedCourse['total'] - $idDeleted['prix'], $usedCourse['id']));

		echo json_encode(['done', $idDeleted['prix']]);
		
		return true;
	}
	elseif (isset($_POST['deletePreview'])) {
		$_POST['id'] = (int) $_POST['id'];

		$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
		$reqDelete->bindParam(':index', $_POST['id'], PDO::PARAM_INT);
		$reqDelete->execute();

		echo json_encode(['done']);
		
		return true;
	}
	elseif(isset($_POST['buyPreview'])) {
		$updCourse = $bdd->prepare('UPDATE articles SET preview=0, prix=? WHERE id=?');
		$updCourse->execute(array((float) $_POST['prix'],(int) $_POST['id']));

		$updCourse = $bdd->prepare('UPDATE courses SET total=? WHERE id=?');
		$updCourse->execute(array($usedCourse['total'] + (float) $_POST['prix'], $usedCourse['id']));

		$reqIdInserted = $bdd->prepare('SELECT * FROM articles WHERE id=?');
		$reqIdInserted->execute(array((int) $_POST['id']));
		$idInserted = $reqIdInserted->fetch();

		echo json_encode([
			'id' => $_POST['id'],
			'titre' => $idInserted['titre'],
			'prix' => $idInserted['prix']
		]);
	
		return true;
	}
	elseif(isset($_POST['activate'])) {
		$time = time();
		$updCourse = $bdd->prepare('UPDATE courses SET dateStart=? WHERE id=?');
		$updCourse->execute(array($time, $usedCourse['id']));

		echo json_encode([
			"status" => 200,
			"time" => $time
		]);
		
		return true;
	}
}

login($bdd, function($user, $bdd){
	if(!pushCousesIndependent($user, $bdd)){	
		getCourse($user, $bdd, function($user, $usedCourse, $bdd){
			push($user, $usedCourse, $bdd);
		});
	}
	
});

?>