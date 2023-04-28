<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
require_once('checkers/checkGroupe.php');
require_once('checkers/checkCourse.php');

header('Content-type: application/json');

function submitArticle($bdd, $user){
	checkCourse($bdd, $user, $_POST["courseId"], function($course) use ($bdd, $user){
		if(!$course["isold"]){
			if (isset($_POST['titre']) && isset($_POST['prix'])) {
				$titre = htmlspecialchars($_POST['titre']);
				$prix = (float) $_POST['prix'];

				if($prix > 0){
					
					$insertArt = $bdd->prepare(
						'INSERT INTO `articles`
						(`titre`, `prix`, `course`, `preview`, `idAuteur`)
						VALUES (?,?,?,0,?)'
					);
					$insertArt->execute(array($titre, $prix, $course['id'], $user['id']));

					$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
					$updCourse->execute(array($course['total'] + $prix, $course['id']));

					$reqInserted = $bdd->prepare('SELECT id, domaine FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
					$reqInserted->execute(array($course['id']));
					$inserted = $reqInserted->fetch();
					
					// http_response_code(200);
					echo json_encode([
						'status' => 200,
						'payload' => array(
							'id' => (int) $inserted['id'],
							'titre' => $titre,
							'prix' => $prix,
							'course' => (int) $course['id'],
							'id_domaine' => (int) $inserted['domaine']
						)
					]);
				
				} else {
					echo json_encode(array("status" => 400, "error" => "badValues"));
				}

			}
		} else {
			echo json_encode(array("status" => 400, "error" => "isold"));
		}
	});
}

function submitPreview($bdd, $user){
	checkCourse($bdd, $user, $_POST["courseId"], function($course) use ($bdd, $user){
		if(!$course["isold"]){
			if (isset($_POST['titre'])) {
				$titre = htmlspecialchars($_POST['titre']);

				$insertArt = $bdd->prepare(
					'INSERT INTO `articles`
					(`titre`, `prix`, `course`, `preview`, `idAuteur`)
					VALUES (?,0,?,1,?)'
				);
				$insertArt->execute(array($titre, $course['id'], $user['id']));

				$reqInserted = $bdd->prepare('SELECT id, domaine FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
				$reqInserted->execute(array($course['id']));
				$inserted = $reqInserted->fetch();

				// http_response_code(200);
				echo json_encode([
					'status' => 200,
					'payload' => array(
						'id'=> $inserted['id'],
						'titre'=> $titre,
						'course' => $course['id'],
						'id_domaine' => $inserted['domaine']
					)
				]);
			} else echo json_encode(array("status" => 400, "error" => "badReq"));
		} else {
			echo json_encode(array("status" => 400, "error" => "isold"));
		}
	});
}

function deleteArticle($bdd, $user){
	if(isset($_POST['id'])){

		$articleId = (int) $_POST["id"];

		$reqItem = $bdd->prepare('SELECT `id`, `prix`, `course` FROM `articles` WHERE `id` = ?');
		$reqItem->execute(array($articleId));
		
		if($reqItem->rowCount() == 1){
			$item = $reqItem->fetch();

			checkCourse($bdd, $user, $item['course'], function($course) use ($bdd, $user, $item) {
				if(!$course["isold"]){
		
					$reqDelete = $bdd->prepare('DELETE FROM `articles` WHERE id=:index');
					$reqDelete->bindParam(':index', $item['id'], PDO::PARAM_INT);
					$reqDelete->execute();

					$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
					$updCourse->execute(array($course['total'] - $item['prix'], $course['id']));

					echo json_encode(array('status' => 200, 'prix' => $item['prix']));

				} else {
					echo json_encode(array("status" => 400, "error" => "isold"));
				}
		
			});
		
		} else {
			echo json_encode(array("status" => 400, "error" => "notFound"));
		}

	} else echo json_encode(array("status" => 400, "error" => "badReq"));
}

function deletePreview($bdd, $user){
	if (isset($_POST['id'])) {

		$articleId = (int) $_POST["id"];

		$reqItem = $bdd->prepare('SELECT `id`, `course` FROM `articles` WHERE `id` = ?');
		$reqItem->execute(array($articleId));

		if($reqItem->rowCount() == 1){
			$item = $reqItem->fetch();

			checkCourse($bdd, $user, $item['course'], function($course) use ($bdd, $user, $item) {
				if(!$course["isold"]){
			
					$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
					$reqDelete->bindParam(':index', $item['id'], PDO::PARAM_INT);
					$reqDelete->execute();
			
					echo json_encode(array('status' => 200));
				} else {
					echo json_encode(array("status" => 400, "error" => "isold"));
				}

			});
		} else {
			echo json_encode(array("status" => 400, "error" => "notFound"));
		}
		
	} else echo json_encode(array("status" => 400, "error" => "badReq"));
}

function buyItem($bdd, $user){
	if(isset($_POST['itemId']) && isset($_POST['prix'])) {
		$itemId = (int) $_POST["itemId"];
		$prix = (float) $_POST["prix"];

		if($prix > 0){
			$reqOld = $bdd->prepare('SELECT * FROM `articles` WHERE id=?');
			$reqOld->execute(array($itemId));

			if($reqOld->rowCount() == 1){
				$old = $reqOld->fetch();

				checkCourse($bdd, $user, $old['course'], function($course) use ($bdd, $user, $old, $prix) {
					if(!$course["isold"]){
						$updTotal = (float) $course['total'] + $prix - (float) $old['prix'];

						$updItem = $bdd->prepare('UPDATE `articles` SET `preview`=0, `prix`=? WHERE `id`=?');
						$updItem->execute(array($prix, $old['id']));

						$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
						$updCourse->execute(array($updTotal, $course['id']));

						//http_response_code(200);
						echo json_encode(array(
							'status' => 200,
							'payload' => array(
								'id' => $old['id'],
								'titre' => $old['titre'],
								'prix' => $prix,
								'id_domaine' => $old['domaine']
							)
						));
					} else echo json_encode(array("status" => 400, "error" => "isold"));
				});
			} else echo json_encode(array("status" => 400, "error" => "notFound"));
			

		} else echo json_encode(array("status" => 400, "error" => "badValues"));
	
	}
}

function creerListe($bdd, $user){
	checkGroupe($bdd, $user, getPostGroupeId(), function($groupe) use ($user, $bdd){

		if(isset($_POST['titre']) && isset($_POST['maxPrice']) && isset($_POST['taxes'])){

			$titre = htmlspecialchars($_POST['titre']);
			$maxPrice = (float) $_POST['maxPrice'];
			$taxes = ((float) $_POST['taxes'])/100;

			if(strlen($titre) <= 80){

				// Les premiums ont 3 listes actives max, sinon 1
				$listesActivesMax = 2*$user["premium"]+1;
				$reqListesActives = $bdd->prepare("SELECT id FROM courses WHERE groupe=? AND isold=0");
				$reqListesActives->execute(array($groupe["id"]));

				if($reqListesActives->rowCount() < $listesActivesMax){

					$insert = $bdd->prepare('INSERT INTO `courses`
						(`nom`, `maxPrice`, `total`, `dateCreation`, `groupe`, `taxes`)
						VALUES (?,?,0,?,?,?)');
					$insert->execute(array($titre, $maxPrice, time(), $groupe['id'], $taxes));

					$reqInserted = $bdd->prepare('SELECT * FROM `courses` WHERE `groupe` = ? ORDER BY id DESC LIMIT 0,1');
					$reqInserted->execute(array($groupe['id']));
					if($reqInserted->rowCount() == 1){
						$inserted = $reqInserted->fetch();
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
						echo json_encode(array("status" => 500, "error" => "unknown"));
					}
				} else {
					echo json_encode(array("status" => 404, "error" => "tooManyActiveListes"));
				}
			} else {
				echo json_encode(array("status" => 400, "error" => "badValues"));

			}

		} else {
			echo json_encode(array("status" => 400, "error" => "badReq"));
		}
				
	});
}

function editCourse($bdd, $user){

	checkCourse($bdd, $user, getPostCourseId(), function($course) use ($bdd,$user){

		if(isset($_POST['titre']) && isset($_POST['maxPrice']) && isset($_POST['taxes']) && isset($_POST['date'])){

			$titre = htmlspecialchars($_POST['titre']);
			$budget = (float) $_POST['maxPrice'];
			$taxes = ((float) $_POST['taxes'])/100;
			$date = (int) $_POST['date'];

			if(strlen($titre) <= 80){
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
						"isold" => (int) $course["isold"],
						"maxPrice" => $budget,
						"nom" => $titre,
						"taxes" => $taxes,
						"total" => $course["total"]
					)
				));
			} else {
				echo json_encode(array("status" => 400, "error" => "badValues"));
			}
			
		} else {
			echo json_encode(array("status" => 400, "error" => "badReq"));
		}

	});

}

function newGroupe($bdd, $user){
	if(isset($_POST['titre'])){
		$titre = htmlspecialchars($_POST['titre']);
		if(strlen($titre) <= 50 && strlen($titre) >= 2){

			$nombreGroupesMax = 3*$user["premium"]+1;

			$recNbrGroupes = $bdd->prepare('SELECT COUNT(*) AS nbr FROM `gulinks` WHERE userId = ? AND `active` = 1');
			$recNbrGroupes->execute(array($user['id']));
			$resNbrGroupes = $recNbrGroupes->fetch();
			if($resNbrGroupes['nbr'] < $nombreGroupesMax) {
	
				$insertGroupe = $bdd->prepare('INSERT INTO `groupes` (`nom`) VALUES (?)');
				$insertGroupe->execute(array($titre));
		
				$reqGroupe = $bdd->prepare('SELECT * FROM `groupes` WHERE `nom` = ? ORDER BY `id` DESC LIMIT 0,1');
				$reqGroupe->execute(array($titre));
				$groupe = $reqGroupe->fetch();
		
				$createLink = $bdd->prepare('INSERT INTO `gulinks` (`groupeId`, `userId`, `active`) VALUES (?,?, 1)');
				$createLink->execute(array($groupe['id'], $user['id']));
		
				
				echo json_encode(array('status' => 200, "payload" => $groupe));

			} else echo json_encode(array('status' => 400, "error" => "tooManyGroups"));
		
			

		} else echo json_encode(array("status" => 400, "error" => "badValues"));
	} else {
		echo json_encode(array("status" => 400, "error" => "badReq"));
	}
}

function submitMessage($bdd, $user){
	if(isset($_POST['message']) && isset($_POST['idItem'])){
		
		$message = htmlspecialchars($_POST['message']);
		$idItem = (int) $_POST['idItem'];
		
		$reqItemsValidity = $bdd->prepare('SELECT Count(*) as nbr
			FROM `articles` as a
			INNER JOIN `courses` as c
				ON a.course = c.id
			INNER JOIN `gulinks` as lks
				ON c.groupe = lks.groupeId
			WHERE lks.userId = ? AND a.id = ?');
		$reqItemsValidity->execute(array($user['id'], $idItem));
		$resItemsValidity = $reqItemsValidity->fetch();
		if($resItemsValidity["nbr"] == 1){
			$reqSetMessage = $bdd->prepare('UPDATE `articles` SET `message` = ? WHERE `id` = ?');
			$reqSetMessage->execute(array($message, $idItem));
			echo json_encode(array('status' => 200, 'payload' => array('message' => $message)));
		} else {
			echo json_encode(array('status' => 400, 'error' => "notFound"));
		}

	} else echo json_encode(array("status" => 400, "error" => "badReq"));

}

function setItemType($bdd, $user){
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
			echo json_encode(array('status' => 400, "error" => "notFound"));
		}

	} else echo json_encode(array("status" => 400, "error" => "badReq"));
}


function deleteCourse($bdd, $user){
	if(isset($_POST["id"])){

		$idCourse = (int) $_POST['id'];

		$reqCourseValidity = $bdd->prepare('SELECT count(*) as nbr FROM `courses` c 
			INNER JOIN `gulinks` lks 
				ON c.groupe = lks.groupeId
			WHERE lks.userId = ? AND c.id = ?');
		$reqCourseValidity->execute(array($user["id"], $idCourse));
		$resCourseValidity = $reqCourseValidity->fetch();

		if($resCourseValidity["nbr"] == 1){

			$reqDelete = $bdd->prepare('DELETE FROM `courses` WHERE `id` = ?');
			$reqDelete->execute(array($idCourse));
			
			$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
			$delArticles->execute(array($idCourse));

			echo json_encode(array('status' => 200));

		} else echo json_encode(array("status" => 400, "error" => "notFound"));

	} else echo json_encode(array("status" => 400, "error" => "badReq"));
	

}

function leaveGroup($bdd, $user){
	checkGroupe($bdd, $user, getPostGroupeId(), function($groupe) use ($user, $bdd){
	
		$reqNbrMembres = $bdd->prepare('SELECT * FROM `gulinks` WHERE `groupeId` = ?');
		$reqNbrMembres->execute(array($groupe['id']));


		if($reqNbrMembres->rowCount() == 1){ // Supprimer toutes les infos du groupe si il n'a plus de membres

			$delgroupe = $bdd->prepare('DELETE a, c, g 
			FROM groupes g
			INNER JOIN courses c
				ON c.groupe = g.id
			INNER JOIN articles a
				ON a.course = c.id
			WHERE g.id = ?');
			$delgroupe->execute(array($groupe['id']));

		}

		$updateLink = $bdd->prepare('DELETE FROM `gulinks` WHERE `userId` = ? AND `groupeId` = ?');
		$updateLink->execute(array($user['id'], $groupe['id']));

		
		echo json_encode(array('status' => 200));

	});
}



login($bdd, function($user) use($bdd){
	if(isset($_POST["action"])){
		switch($_POST["action"]){
			case "submitArticle":
				submitArticle($bdd, $user);
				break;
			case "submitPreview":
				submitPreview($bdd, $user);
				break;
			case "deleteArticle":
				deleteArticle($bdd, $user);
				break;
			case "deletePreview":
				deletePreview($bdd, $user);
				break;
			case "buyItem":
				buyItem($bdd, $user);
				break;
			case "createListeCourses":
				creerListe($bdd, $user);
				break;
			case "editCourse":
				editCourse($bdd, $user);
				break;
			case "newGroupe":
				newGroupe($bdd,$user);
				break;
			case "submitMessage":
				submitMessage($bdd, $user);
				break;
			case "setItemType":
				setItemType($bdd, $user);
				break;
			case "deleteCourse":
				deleteCourse($bdd, $user);
				break;
			case "leaveGroup":
				leaveGroup($bdd, $user);
				break;
		}
	}
	
});

?>