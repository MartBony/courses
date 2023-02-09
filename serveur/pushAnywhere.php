<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/getLatestCourse.php');
require_once('checkers/checkGroupe.php');
require_once('checkers/checkCourse.php');

header('Content-type: application/json');

function submitArticle($bdd, $user){
	checkCourse($bdd, $user, $_POST["courseId"], function($course) use ($bdd, $user){
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

				$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
				$reqIdInserted->execute(array($course['id']));
				$idInserted = $reqIdInserted->fetch();
				
				// http_response_code(200);
				echo json_encode([
					'type' => 200,
					'payload' => array(
						'id' => $idInserted['id'],
						'titre' => $titre,
						'color' => $user['hueColor'],
						'prix' => $prix,
						'course' => $course['id']
					)
				]);
			
			} else {
				//http_response_code(400);
				echo(json_encode(array('type' => 201, 'error' => 'NegVal')));
			}

		}
	});
}

function submitPreview($bdd, $user){
	checkCourse($bdd, $user, $_POST["courseId"], function($course) use ($bdd, $user){
		$titre = htmlspecialchars($_POST['titre']);

		$insertArt = $bdd->prepare(
			'INSERT INTO `articles`
			(`titre`, `prix`, `course`, `preview`, `idAuteur`)
			VALUES (?,0,?,1,?)'
		);
		$insertArt->execute(array($titre, $course['id'], $user['id']));

		$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
		$reqIdInserted->execute(array($course['id']));
		$idInserted = $reqIdInserted->fetch();

		// http_response_code(200);
		echo json_encode([
			'type' => 200,
			'payload' => array(
				'id'=> $idInserted['id'],
				'titre'=> $titre,
				'color' => $user['hueColor'],
				'course' => $course['id']
			)
		]);
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
		
				$reqDelete = $bdd->prepare('DELETE FROM `articles` WHERE id=:index');
				$reqDelete->bindParam(':index', $item['id'], PDO::PARAM_INT);
				$reqDelete->execute();

				$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
				$updCourse->execute(array($course['total'] - $item['prix'], $course['id']));

				echo json_encode(array('type' => 200, 'prix' => $item['prix']));
		
			});
		
		} else {
			echo json_encode(array('type' => 204));
		}

	}
}

function deletePreview($bdd, $user){
	if (isset($_POST['id'])) {

		$articleId = (int) $_POST["id"];

		$reqItem = $bdd->prepare('SELECT `id`, `course` FROM `articles` WHERE `id` = ?');
		$reqItem->execute(array($articleId));

		if($reqItem->rowCount() == 1){
			$item = $reqItem->fetch();

			checkCourse($bdd, $user, $item['course'], function($course) use ($bdd, $user, $item) {
			
				$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
				$reqDelete->bindParam(':index', $item['id'], PDO::PARAM_INT);
				$reqDelete->execute();
		
				echo json_encode(array('type' => 200));

			});
		} else {
			echo json_encode(array('type' => 204));
		}
		
	}
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
					$updTotal = (float) $course['total'] + (float) $_POST['prix'] - (float) $old['prix'];

					$updItem = $bdd->prepare('UPDATE `articles` SET `preview`=0, `prix`=? WHERE `id`=?');
					$updItem->execute(array($prix, $old['id']));

					$updCourse = $bdd->prepare('UPDATE `courses` SET `total`=? WHERE `id`=?');
					$updCourse->execute(array($updTotal, $course['id']));

					//http_response_code(200);
					echo json_encode(array(
						'type' => 200,
						'payload' => array(
							'id' => $old['id'],
							'domaine' => $old['domaine'],
							'titre' => $old['titre'],
							'prix' => $prix,
							'color' => $user['hueColor'],
							'course' => $course['id']
						)
					));
				});
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
	if(isset($_POST["action"])){
		if($_POST["action"] == "submitArticle"){
			submitArticle($bdd, $user);
		} elseif ($_POST["action"] == "submitPreview"){
			submitPreview($bdd, $user);
		} elseif ($_POST["action"] == "deleteArticle"){
			deleteArticle($bdd, $user);
		} elseif ($_POST["action"] == "deletePreview"){
			deletePreview($bdd, $user);
		} elseif ($_POST["action"] == "buyItem"){
			buyItem($bdd, $user);
		}
	}
	
});

?>