<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
require_once('checkers/checkGroupe.php');

header('Content-type: application/json');

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['newGroupe']) && isset($_POST['titre'])) {
		if(strlen($_POST['titre']) <= 20 && strlen($_POST['titre']) >= 2){
			$_POST['titre'] = htmlspecialchars($_POST['titre']);

			$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (`nom`) VALUES (?)');
			$insertGroupe->execute(array($_POST['titre']));

			$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
			$reqGroupe->execute(array($_POST['titre']));
			$groupe = $reqGroupe->fetch();

			$insertUser = $bdd->prepare('UPDATE `users` SET `groupe` = ? WHERE `id` = ?');
			$insertUser->execute(array(( "[". $groupe['id'] ."]". $user['groupe']), $user['id']));

			
			http_response_code(200);
			echo json_encode(array());

		} else {
			http_response_code(400);
			echo json_encode(array('err' => 'length'));
		}

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

				$reqInserted =  $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY `id` DESC LIMIT 1');
				$reqInserted->execute(array($groupe['id']));
				if($reqInserted->rowCount() == 1){
					$inserted = $reqInserted->fetch();
					echo json_encode(array(
						"status" => 200,
						"payload" => array(
							"id" => $inserted['id'],
							"groupe" => $groupe['id'],
							"dateStart" => $inserted['dateStart'],
							"maxPrice" => $inserted['maxPrice'],
							"nom" => $inserted['nom'],
							"taxes" => $inserted['taxes']
						)
					));
				} else {
					echo json_encode(array("status" => "Failed Retrieving"));
				}

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

				
				http_response_code(200);
				echo json_encode(array());


				return true;

			} elseif (isset($_POST['deleteCourse']) && $_POST['id']) {
				$id = (int) $_POST['id'];
		
				$reqCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `id` = :index AND `groupe` = :groupe');
				$reqCourse->bindParam(':index', $id, PDO::PARAM_INT);
				$reqCourse->bindParam(':groupe', $groupe['id'], PDO::PARAM_INT);
				$reqCourse->execute();
		
				if($reqCourse->rowCount() == 1){
					$course = $reqCourse->fetch();
					/* 
					if(strpos($user['groupe'], "[". $course['groupe'] ."]") !== false){ */
						$reqDelete = $bdd->prepare('DELETE FROM `courses` WHERE `id` = :index');
						$reqDelete->bindParam(':index', $id, PDO::PARAM_INT);
						$reqDelete->execute();
						
						$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
						$delArticles->execute(array($id));
		
						echo json_encode(array('status' => 200, "payload" => array("id" => $id)));
			/* 		} else {
						echo json_encode(array('status' => 403));
					}
		 */
				} else {
					echo json_encode(array('status' => 404));
				}

				return true;
				
			}

			return false;
				
		});
	}
}

function push($user, $latestCourse, PDO $bdd){

	if (isset($_POST['submitArticle']) && isset($_POST['titre']) && isset($_POST['prix'])) {
		$titre = htmlspecialchars($_POST['titre']);
		$prix = (float) $_POST['prix'];

		if($prix > 0){
			
			$insertArt = $bdd->prepare(
				'INSERT INTO `articles`
				(`titre`, `prix`, `course`, `preview`, `idAuteur`)
				VALUES (?,?,?,0,?)'
			);
			$insertArt->execute(array($titre, $prix, $latestCourse['id'], $user['id']));

			$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
			$updCourse->execute(array($latestCourse['total'] + $prix, $latestCourse['id']));

			$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
			$reqIdInserted->execute(array($latestCourse['id']));
			$idInserted = $reqIdInserted->fetch();
			
			// http_response_code(200);
			echo json_encode([
				'type' => 200,
				'payload' => array(
					'id' => $idInserted['id'],
					'titre' => $titre,
					'color' => $user['hueColor'],
					'prix' => $prix,
					'course' => $latestCourse['id']
				)
			]);
		
		} else {
			//http_response_code(400);
			echo(json_encode(array('type' => 201, 'error' => 'NegVal')));
		}

	}
	elseif (isset($_POST['submitPreview']) && isset($_POST['titre'])) {
		$titre = htmlspecialchars($_POST['titre']);

		$insertArt = $bdd->prepare(
			'INSERT INTO `articles`
			(`titre`, `prix`, `course`, `preview`, `idAuteur`)
			VALUES (?,0,?,1,?)'
		);
		$insertArt->execute(array($titre, $latestCourse['id'], $user['id']));

		$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
		$reqIdInserted->execute(array($latestCourse['id']));
		$idInserted = $reqIdInserted->fetch();

		// http_response_code(200);
		echo json_encode([
			'type' => 200,
			'payload' => array(
				'id'=> $idInserted['id'],
				'titre'=> $titre,
				'color' => $user['hueColor'],
				'course' => $latestCourse['id']
			)
		]);
		
	}
	elseif (isset($_POST['deleteArticle']) && isset($_POST['id'])) {

		$reqDeleted = $bdd->prepare('SELECT `id`, `prix`, `course` FROM `articles` WHERE `id` = ?');
		$reqDeleted->execute(array($_POST['id']));
		
		if($reqDeleted->rowCount() == 1){
			$deleted = $reqDeleted->fetch();

			if($deleted['course'] == $latestCourse['id']){ // Si l'id correspond à la course utilisée
				$reqDelete = $bdd->prepare('DELETE FROM `articles` WHERE id=:index');
				$reqDelete->bindParam(':index', $deleted['id'], PDO::PARAM_INT);
				$reqDelete->execute();

				$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
				$updCourse->execute(array($latestCourse['total'] - $deleted['prix'], $latestCourse['id']));

				// http_response_code(200);
				echo json_encode(array('type' => 200, 'prix' => $deleted['prix']));

			} else {
				// http_response_code(403);
				echo json_encode(array('type' => 203));
			}
		} else {
			// http_response_code(404);
			echo json_encode(array('type' => 204));
		}

	}
	elseif (isset($_POST['deletePreview']) && isset($_POST['id'])) {
		$reqDeleted = $bdd->prepare('SELECT `id`, `course` FROM `articles` WHERE `id` = ?');
		$reqDeleted->execute(array($_POST['id']));

		if($reqDeleted->rowCount() == 1){
			$deleted = $reqDeleted->fetch();

			if($deleted && $deleted['course'] == $latestCourse['id']){ // Si l'id correspond à la course utilisée
			
				$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
				$reqDelete->bindParam(':index', $_POST['id'], PDO::PARAM_INT);
				$reqDelete->execute();
		
				// http_response_code(200);
				echo json_encode(array('type' => 200));

			} else {
				// http_response_code(403);
				echo json_encode(array('type' => 203));
			}
		} else {
			// http_response_code(404);
			echo json_encode(array('type' => 204));
		}
		
	}
	elseif(isset($_POST['buyPreview']) && isset($_POST['id']) && isset($_POST['prix'])) {
		$prix = (float) $_POST['prix'];
		if($prix > 0){
			$reqOld = $bdd->prepare('SELECT * FROM `articles` WHERE id=?');
			$reqOld->execute(array($_POST['id']));

			if($reqOld->rowCount() == 1){
				$old = $reqOld->fetch();

				$updTotal = (float) $latestCourse['total'] + $_POST['prix'] - $old['prix'];

				$updCourse = $bdd->prepare('UPDATE `articles` SET `preview`=0, `prix`=? WHERE `id`=?');
				$updCourse->execute(array($prix, $old['id']));

				$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
				$updCourse->execute(array($updTotal, $latestCourse['id']));

				//http_response_code(200);
				echo json_encode(array(
					'type' => 200,
					'payload' => array(
						'id' => $_POST['id'],
						'color' => $user['hueColor'],
						'titre' => $old['titre'],
						'prix' => $old['prix'],
						'course' => $latestCourse['id']
					)
				));
			} else {
				echo json_encode(array('type' => 204));
			}
			

		} else {
			//http_response_code(400);
			echo(json_encode(array('type' => 201, 'error' => 'NegVal')));
		}
	
	}
	elseif(isset($_POST['activate'])) {
		$time = time();
		$updCourse = $bdd->prepare('UPDATE `courses` SET `dateStart`=? WHERE `id`=?');
		$updCourse->execute(array($time, $latestCourse['id']));

		http_response_code(200);
		echo json_encode(array(
			"status" => 200,
			"payload" => array(
				"time" => $time,
				"course" => (int) $latestCourse['id']
			)
		));
	
	}
}

login($bdd, function($user) use($bdd){
	if(!pushCousesIndependent($user, $bdd)){
		getLatestCourse($user, $bdd, function($user, $latestCourse, $bdd){
			push($user, $latestCourse, $bdd);
		});
	}
	
});

?>