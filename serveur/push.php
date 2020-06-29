<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
require_once('checkers/checkGroupe.php');

header('Content-type: application/json');

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['newGroupe'])) {
		if(isset($_POST['titre']) && strlen($_POST['titre']) <= 20 && strlen($_POST['titre']) >= 2){
			$_POST['titre'] = htmlspecialchars($_POST['titre']);

			$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (`nom`) VALUES (?)');
			$insertGroupe->execute(array($_POST['titre']));

			$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
			$reqGroupe->execute(array($_POST['titre']));
			$groupe = $reqGroupe->fetch();

			$insertUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
			$insertUser->execute(array(( "[". $groupe['id'] ."]". $user['groupe']), $user['id']));

			echo json_encode(array('status' => 200));

		} else echo json_encode(array('status' => 400, 'err' => 'length'));

		return true;
	} else {

		return checkGroupe($bdd, $user, function($user, $groupe) use ($bdd){
	
			if(isset($_POST['submitCourse']) && isset($_POST['titre']) && isset($_POST['maxPrice']) && isset($_POST['taxes'])) {
				$titre = htmlspecialchars($_POST['titre']);
				$maxPrice = (float) $_POST['maxPrice'];
				$taxes = ((float) $_POST['taxes'])/100;
		
				$insert = $bdd->prepare(
					'INSERT INTO `courses`
					(`nom`, `maxPrice`, `total`, `dateStart`, `groupe`, `taxes`)
					VALUES (?,?,0,0,?,?)'
				);
				$insert->execute(array($titre, $maxPrice, $groupe['id'], $taxes));
		
				echo json_encode(array('status' => 200));
				return true;
		
			} else if(isset($_POST['leaveGroup'])) {
				$membres = 0;
				$reqAllUsers = $bdd->prepare('SELECT `nom`, `groupe` FROM `users` WHERE `deleted` = 0');
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

	if (isset($_POST['submitArticle']) && isset($_POST['titre']) && isset($_POST['prix'])) {
		$titre = htmlspecialchars($_POST['titre']);
		$prix = (float) $_POST['prix'];

		$insertArt = $bdd->prepare(
			'INSERT INTO `articles`
			(`titre`, `prix`, `course`, `preview`, `idAuteur`)
			VALUES (?,?,?,0,?)'
		);
		$insertArt->execute(array($titre, $prix, $usedCourse['id'], $user['id']));

		$updCourse = $bdd->prepare('UPDATE courses SET total=? WHERE id=?');
		$updCourse->execute(array($usedCourse['total'] + $prix, $usedCourse['id']));

		$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
		$reqIdInserted->execute(array($usedCourse['id']));
		$idInserted = $reqIdInserted->fetch();
		echo json_encode([
			'status' => 200,
			'id' => $idInserted['id'],
			'titre' => $titre,
			'prix' => $prix
		]);

		return true;
	}
	elseif (isset($_POST['submitPreview']) && isset($_POST['titre'])) {
		$titre = htmlspecialchars($_POST['titre']);

		$insertArt = $bdd->prepare(
			'INSERT INTO `articles`
			(`titre`, `prix`, `course`, `preview`, `idAuteur`)
			VALUES (?,0,?,1,?)'
		);
		$insertArt->execute(array($titre, $usedCourse['id'], $user['id']));

		$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
		$reqIdInserted->execute(array($usedCourse['id']));
		$idInserted = $reqIdInserted->fetch();
		echo json_encode([
			'status' => 200,
			'id'=> $idInserted['id'],
			'titre'=> $titre,
			'color' => $user['hueColor']
		]);
		
		return true;
	}
	elseif (isset($_POST['deleteCourse']) && $_POST['id']) {

		$reqDelete = $bdd->prepare('DELETE FROM `courses` WHERE `id` = :index');
		$reqDelete->bindParam(':index', $usedCourse['id'], PDO::PARAM_INT);
		$reqDelete->execute();
		
		$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
		$delArticles->execute(array($usedCourse['id']));

		echo json_encode(array('status' => 200));
		return true;
	}
	elseif (isset($_POST['deleteArticle']) && isset($_POST['id'])) {

		$reqDeleted = $bdd->prepare('SELECT `id`, `prix` FROM `articles` WHERE `id` = ?');
		$reqDeleted->execute(array($_POST['id']));
		$deleted = $reqDeleted->fetch();

		$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
		$reqDelete->bindParam(':index', $deleted['id'], PDO::PARAM_INT);
		$reqDelete->execute();

		$updCourse = $bdd->prepare('UPDATE courses SET total=? WHERE id=?');
		$updCourse->execute(array($usedCourse['total'] - $deleted['prix'], $usedCourse['id']));

		echo json_encode(array('status' => 200, 'prix' => $deleted['prix']));
		
		return true;
	}
	elseif (isset($_POST['deletePreview']) && isset($_POST['id'])) {
		$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
		$reqDelete->bindParam(':index', $_POST['id'], PDO::PARAM_INT);
		$reqDelete->execute();

		echo json_encode(array('status' => 200));
		
		return true;
	}
	elseif(isset($_POST['buyPreview']) && isset($_POST['id']) && isset($_POST['prix'])) {
		$updCourse = $bdd->prepare('UPDATE articles SET preview=0, prix=? WHERE id=?');
		$updCourse->execute(array($_POST['prix'], $_POST['id']));

		$updCourse = $bdd->prepare('UPDATE courses SET total=? WHERE id=?');
		$updCourse->execute(array($usedCourse['total'] + $_POST['prix'], $usedCourse['id']));

		$reqIdInserted = $bdd->prepare('SELECT * FROM articles WHERE id=?');
		$reqIdInserted->execute(array($_POST['id']));
		$idInserted = $reqIdInserted->fetch();

		echo json_encode([
			'status' => 200,
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

login($bdd, function($user) use($bdd){
	if(!pushCousesIndependent($user, $bdd)){
		getLatestCourse($user, $bdd, function($user, $usedCourse, $bdd){
			push($user, $usedCourse, $bdd);
		});
	}
	
});

?>