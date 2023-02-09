<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
require_once('checkers/checkGroupe.php');
require_once('checkers/checkCourse.php');

header('Content-type: application/json');

function editCourse($user, $bdd){
	if(isset($_POST['editCourse']) && $_POST['editCourse'] && isset($_POST['idCourse'])){
		checkCourse($bdd, $user, $_POST['idCourse'], function($course) use ($bdd,$user){

			if(isset($_POST['titre']) && isset($_POST['maxPrice']) && isset($_POST['taxes']) && isset($_POST['date'])){

				$titre = htmlspecialchars($_POST['titre']);
				$budget = (float) $_POST['maxPrice'];
				$taxes = ((float) $_POST['taxes'])/100;
				$date = (int) $_POST['date'];

				if(strlen($titre) > 80){
					echo json_encode(array("status" => 400, "payload" => array('type' => 'ERROR', 'message' => 'Titre trop long.')));
				} else {
					$modifyReq = $bdd->prepare('UPDATE `courses` SET `nom` = :nom, `maxPrice` = :maxPrice, `dateCreation` = :dateCreation, `taxes` = :taxes WHERE `id` = :id');
					$modifyReq->execute(array(
						"nom" => $titre,
						"maxPrice" => $budget,
						"dateCreation" => $date,
						"taxes" => $taxes,
						"id" => $course['id']
					));
					

					echo json_encode(array(
						"status" => 200,
						"payload" => array(
							"id" =>(int) $course['id'],
							"dateCreation" => $date,
							"maxPrice" => $budget,
							"nom" => $titre,
							"taxes" => $taxes,
							"total" => $course["total"]
						)
					));
				}
				
			} else {
				echo json_encode(array("status" => 400, "payload" => array('type' => 'ERROR', 'message' => 'Informations incomplètes')));
			}
		});
		return true;
	} else {
		return False;
	}
}

function pushCousesIndependent($user, PDO $bdd){
	if(isset($_POST['newGroupe']) && isset($_POST['titre'])) { // REWRITE
		if(strlen($_POST['titre']) <= 20 && strlen($_POST['titre']) >= 2){
			if(!$user['premium']){
				$recNbrGroupes = $bdd->prepare('SELECT COUNT(*) AS nbr FROM `gulinks` WHERE userId = ? AND `active` = 1');
				$recNbrGroupes->execute(array($user['id']));
				$resNbrGroupes = $recNbrGroupes->fetch();
				if($resNbrGroupes['nbr'] > 2) {
					echo json_encode(array('status' => 400, "payload" => array("type" => "ERROR", "message" => "Vous avez atteind votre limite de groupes. Passez en premium pour cela.")));
					return true;
				}
			}
			$_POST['titre'] = htmlspecialchars($_POST['titre']);

			$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (`nom`) VALUES (?)');
			$insertGroupe->execute(array($_POST['titre']));

			$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
			$reqGroupe->execute(array($_POST['titre']));
			$groupe = $reqGroupe->fetch();

			$createLink = $bdd->prepare('INSERT INTO `gulinks` (`groupeId`, `userId`, `active`) VALUES (?,?, 1)');
			$createLink->execute(array($groupe['id'], $user['id']));

			
			echo json_encode(array('status' => 200, "payload" => $groupe));

		} else {
			echo json_encode(array('status' => 400, "payload" => array("type" => "ERROR", "message" => "Votre titre ne respecte pas la longeur autorisée (entre 2 et 20 caractères).")));
		}

		return true;
	} else if (isset($_POST['submitMessage'])) {
		if(!isset($_POST['message']) || !isset($_POST['idItem'])){
			echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'La requête est incomplête, actualisez et réessayez.')));
			return true;
		}
		$message = htmlspecialchars($_POST['message']);
		$idItem = (int) $_POST['idItem'];
		
		$reqItemsValidity = $bdd->prepare('SELECT a.id as id
			FROM `articles` as a
			INNER JOIN `courses` as c
				ON a.course = c.id
			INNER JOIN `gulinks` as lks
				ON c.groupe = lks.groupeId
			WHERE lks.userId = ? AND a.id = ?');
		$reqItemsValidity->execute(array($user['id'], $idItem));
		if($reqItemsValidity->rowCount() == 1){
			$idItem = $reqItemsValidity->fetch();
			$reqSetMessage = $bdd->prepare('UPDATE `articles` SET `message` = ? WHERE `id` = ?');
			$reqSetMessage->execute(array($message, $idItem['id']));
			echo json_encode(array('status' => 200, 'payload' => array('message' => $message)));
		} else {
			echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'L\'article que vous essayez de modifier n\'est plus disponible sur le serveur, rechargez la page et réessayez.')));
		}
		return true;
	} else if (isset($_POST["action"]) && $_POST["action"] == "setItemType") {
		if(isset($_POST["itemId"]) && isset($_POST["type"])){
			$type = (int) $_POST["type"];
			$itemId = (int) $_POST["itemId"];

			$reqItemsValidity = $bdd->prepare('SELECT a.id as id, d.id id_domaine, d.couleur hue_domaine, c.id id_course
				FROM `articles` as a
				INNER JOIN `courses` as c
					ON a.course = c.id
				INNER JOIN `gulinks` as lks
					ON c.groupe = lks.groupeId
				INNER JOIN `domaines` d
					ON d.id = ?
				WHERE lks.userId = ? AND a.id = ?');
			$reqItemsValidity->execute(array($type, $user['id'], $itemId));
			if($reqItemsValidity->rowCount() == 1){
				$data = $reqItemsValidity->fetch();
				$reqSetMessage = $bdd->prepare('UPDATE `articles` SET `domaine` = ? WHERE `id` = ?');
				$reqSetMessage->execute(array($type, $data['id']));
				echo json_encode(array('status' => 200, 'payload' => array('id' => $data["id_domaine"], 'hue' => $data["hue_domaine"], 'id_course' => (int) $data["id_course"])));
			} else {
				echo json_encode(array('status' => 400, 'payload' => array('type' => 'ERROR', 'message' => 'La requête à échouée')));
			}
		}
		return true;
	} else {

		return checkGroupe($bdd, $user, getPostGroupeId(), function($user, $groupe) use ($bdd){
	
			if(isset($_POST['submitCourse'])) {
				if(!isset($_POST['titre']) || !isset($_POST['maxPrice']) || !isset($_POST['taxes'])){
					echo json_encode(array("status" => 400, "payload" => array('type' => 'ERROR', 'message' => 'La requête n\'est pas valide.')));
					return true;
				}
				
				$titre = htmlspecialchars($_POST['titre']);
				$maxPrice = (float) $_POST['maxPrice'];
				$taxes = ((float) $_POST['taxes'])/100;

				if(strlen($titre) > 80){
					echo json_encode(array("status" => 400, "payload" => array('type' => 'ERROR', 'message' => 'Titre trop long.')));
					return true;
				}
		
				$insert = $bdd->prepare('INSERT INTO `courses`
					(`nom`, `maxPrice`, `total`, `dateCreation`, `groupe`, `taxes`)
					VALUES (?,?,0,?,?,?)');
				$insert->execute(array($titre, $maxPrice, time(), $groupe['id'], $taxes));

				$reqInserted = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY id DESC LIMIT 0,1');
				$reqInserted->execute(array($groupe['id']));
				if($reqInserted->rowCount() == 1){
					$inserted = $reqInserted->fetch();


					if($user["premium"] == 0){
						// DELETE VERY OLD COURSES
						$timeLimit = time() - 60*60*24*30*7;
						$reqVeryOldCourses = $bdd->prepare('SELECT `id` FROM `courses`
							WHERE groupe = :idGroupe AND dateCreation < :timelim ORDER BY id DESC');
						$reqVeryOldCourses->execute(array(
							"idGroupe" => $groupe['id'],
							"timelim" => $timeLimit
						));
						$counter = -1;
						while($delCrs = $reqVeryOldCourses->fetch()){
							$counter++;
							if($counter < 2){ // Pass first three entries, may be working one
								continue;
							}
							$deleteItems = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
							$deleteItems->execute(array($delCrs['id']));
							$deleteCourse = $bdd->prepare('DELETE FROM `courses` WHERE id = ?');
							$deleteCourse->execute(array($delCrs['id']));
						}
					}

					echo json_encode(array(
						"status" => 200,
						"payload" => array(
							"id" => $inserted['id'],
							"groupe" => $groupe['id'],
							"dateCreation" => $inserted['dateCreation'],
							"maxPrice" => $inserted['maxPrice'],
							"nom" => $inserted['nom'],
							"taxes" => $inserted['taxes']
						)
					));
				} else {
					echo json_encode(array("status" => 500, "payload" => array("type" => "ERROR", "message" => "Erreur interne au serveur. La requête à été anullée.")));
				}
		

				return true;
		
			}
			else if(isset($_POST['leaveGroup'])) {
				$reqNbrMembres = $bdd->prepare('SELECT * FROM `gulinks` WHERE `groupeId` = ?');
				$reqNbrMembres->execute(array($groupe['id']));


				if($reqNbrMembres->rowCount() == 1){
					$reqAllCourses = $bdd->prepare('SELECT id FROM courses WHERE groupe = ? ORDER BY id DESC');
					$reqAllCourses->execute(array($groupe['id']));
					while($resCoursesGp = $reqAllCourses->fetch()){
						$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
						$delArticles->execute(array($resCoursesGp['id']));
					}
					$reqAllCourses->closeCursor();
					
					$delCourses = $bdd->prepare('DELETE FROM `courses` WHERE `groupe` = ?');
					$delCourses->execute(array($groupe['id']));
					$delCourses->closeCursor();

					$delgroupe = $bdd->prepare('DELETE FROM `groupes` WHERE `id` = ?');
					$delgroupe->execute(array($groupe['id']));
					$delgroupe->closeCursor();
				}

				$updateLink = $bdd->prepare('DELETE FROM `gulinks` WHERE `userId` = ? AND `groupeId` = ?');
				$updateLink->execute(array($user['id'], $groupe['id']));

				
				echo json_encode(array('status' => 200));

				return true;

			} elseif (isset($_POST['deleteCourse']) && $_POST['id']) {
				$id = (int) $_POST['id'];

				$reqCourse = $bdd->prepare('SELECT * FROM `courses` WHERE `id` = :index AND `groupe` = :groupe');
				$reqCourse->bindParam(':index', $id, PDO::PARAM_INT);
				$reqCourse->bindParam(':groupe', $groupe['id'], PDO::PARAM_INT);
				$reqCourse->execute();
		
				if($reqCourse->rowCount() == 1){
					$course = $reqCourse->fetch();
					$reqDelete = $bdd->prepare('DELETE FROM `courses` WHERE `id` = :index');
					$reqDelete->bindParam(':index', $id, PDO::PARAM_INT);
					$reqDelete->execute();
					
					$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
					$delArticles->execute(array($id));
	
					echo json_encode(array('status' => 200, "payload" => array("id" => $id)));
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
	
	if(isset($_POST['action']) && $_POST['action'] == "buy" && isset($_POST['id']) && isset($_POST['prix'])) {
		$prix = (float) $_POST['prix'];
		if($prix > 0){
			$reqOld = $bdd->prepare('SELECT * FROM `articles` WHERE id=?');
			$reqOld->execute(array($_POST['id']));

			if($reqOld->rowCount() == 1){
				$old = $reqOld->fetch();

				$updTotal = (float) $latestCourse['total'] + (float) $_POST['prix'] - (float) $old['prix'];

				$updCourse = $bdd->prepare('UPDATE `articles` SET `preview`=0, `prix`=? WHERE `id`=?');
				$updCourse->execute(array($prix, $old['id']));

				$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
				$updCourse->execute(array($updTotal, $latestCourse['id']));

				//http_response_code(200);
				echo json_encode(array(
					'type' => 200,
					'payload' => array(
						'id' => $_POST['id'],
						'domaine' => $old['domaine'],
						'titre' => $old['titre'],
						'prix' => $prix,
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
}

login($bdd, function($user) use($bdd){
	if(!editCourse($user, $bdd)){
		if(!pushCousesIndependent($user, $bdd)){
			getLatestCourse($bdd, $user, function($user, $latestCourse) use ($bdd){
				push($user, $latestCourse, $bdd);
			});
		}
	}
	
});

?>