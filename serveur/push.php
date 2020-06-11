<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
require_once('checkers/checkGroupe.php');

header('Content-type: application/json');

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['newGroupe'])) {
		if(isset($_POST['titre']) && strlen($_POST['titre']) < 15){
			$_POST['titre'] = htmlspecialchars($_POST['titre']);

			$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (nom) VALUES (?)');
			$insertGroupe->execute(array($_POST['titre']));

			$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
			$reqGroupe->execute(array($_POST['titre']));
			$groupe = $reqGroupe->fetch();

			$insertUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
			$insertUser->execute(array(( "[". $groupe['id'] ."]". $user['groupe']), $user['id']));

			echo json_encode(array('status' => 200));

		} else {
			echo json_encode(array('status' => 403));
		}

		return true;
	} else {

		return checkGroupe($user, $bdd, function($user, $groupe, $bdd){
	
			if(isset($_POST['submitCourse'])) {
				$titre = htmlspecialchars( $_POST['titre']);
				$maxPrice = (float)  $_POST['maxPrice'];
		
				$insert = $bdd->prepare('INSERT INTO courses (`nom`, `maxprice`, `groupe`) VALUES (?,?,?)');
				$insert->execute(array($titre, $maxPrice, $groupe['id']));
		
				echo json_encode(array('status' => 200));
				return true;
		
			} else if(isset($_POST['leaveGroup'])) {

				$membres = 0;
				$reqAllUsers = $bdd->prepare('SELECT `nom`, `groupe` FROM `users`');
				$reqAllUsers->execute();
				while($scanedUser = $reqAllUsers->fetch()){
					if (strpos($scanedUser['groupe'], "[". $_POST['groupe'] ."]") !== false) {
						$membres++;
					}
				}
				$reqAllUsers->closeCursor();

				if($membres == 1){
					$reqAllCourses = $bdd->prepare('SELECT id FROM courses WHERE groupe = ? ORDER BY id DESC');
					$reqAllCourses->execute(array($_POST['groupe']));
					while($resCoursesGp = $reqAllCourses->fetch()){
						$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
						$delArticles->execute(array($resCoursesGp['id']));
					}
					$reqAllCourses->closeCursor();
					$delCourses = $bdd->prepare('DELETE FROM `courses` WHERE `groupe` = ?');
					$delCourses->execute(array($_POST['groupe']));
					$delCourses->closeCursor();

					$delgroupe = $bdd->prepare('DELETE FROM `groupes` WHERE `id` = ?');
					$delgroupe->execute(array($_POST['groupe']));
					$delgroupe->closeCursor();
				}

				$newString = str_replace("[". $_POST['groupe'] ."]","",$user['groupe']);

				$updateUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
				$updateUser->execute(array($newString, $user['id']));

				echo json_encode(array('status' => 200));


				return true;

			}

			return false;
				
		});
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
	elseif (isset($_POST['deleteCourse'])) {

		$reqDelete = $bdd->prepare('DELETE FROM `courses` WHERE `id` = :index');
		$reqDelete->bindParam(':index', $usedCourse['id'], PDO::PARAM_INT);
		$reqDelete->execute();
		
		$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
		$delArticles->execute(array($usedCourse['id']));

		echo json_encode(array('status' => 200));
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