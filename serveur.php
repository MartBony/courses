<?php
require('dbConnect.php');

header('Content-type: application/json');

if(isset($_COOKIE['clefCourses'])){
	$requser = $bdd->prepare('SELECT * FROM securite WHERE clef = ?');
	$requser->execute(array(hash('sha512', (string) $_COOKIE['clefCourses'])));
	$userexist = $requser->rowCount();

	if ($userexist == 1) {
		$user = $requser->fetch();


		$update = $_POST['update']; 

		if ($update == 'true') {

			$reqUsedCourses = $bdd->prepare('SELECT * FROM courses WHERE groupe=? ORDER BY id DESC LIMIT 1');
			$reqUsedCourses->execute(array($user['groupe']));
			$usedCourse = $reqUsedCourses->fetch();

			if (isset($_POST['submitArticle'])) {
				$titre = htmlspecialchars((string) $_POST['titre']);
				$prix = (float) $_POST['prix'];

				$insertArt = $bdd->prepare('INSERT INTO articles (titre, prix, course, preview, idAuteur, groupe) VALUES (?,?,?,0,?,?)');
				$insertArt->execute(array($titre, $prix, $usedCourse['id'], $user['id'], $user['groupe']));

				$updCourse = $bdd->prepare('UPDATE courses SET depense=? WHERE id=?');
				$updCourse->execute(array($usedCourse['depense'] + $prix, $usedCourse['id']));

				$reqIdInserted = $bdd->prepare('SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
				$reqIdInserted->execute(array($usedCourse['id']));
				$idInserted = $reqIdInserted->fetch();
				echo json_encode(['prix'=>$prix, 'idArticle'=> $idInserted['id'], 'titre'=> $titre]);
			}
			elseif (isset($_POST['submitPreview'])) {
				$titre = htmlspecialchars((string) $_POST['titre']);

				$insertArt = $bdd->prepare('INSERT INTO articles (titre, prix, course, preview, idAuteur, groupe) VALUES (?,0,?,1,?,?)');
				$insertArt->execute(array($titre, $usedCourse['id'], $user['id'], $user['groupe']));

				$reqIdInserted = $bdd->prepare('
					SELECT id FROM articles WHERE course = ? ORDER BY id DESC LIMIT 1');
				$reqIdInserted->execute(array($usedCourse['id']));
				$idInserted = $reqIdInserted->fetch();
				echo json_encode(['idPreview'=> $idInserted['id'], 'titre'=> $titre, 'color' => $user['hexColor']]);
			}
			elseif (isset($_POST['deleteArticle'])) {
				$_POST['id'] = (int) $_POST['id'];

				$reqIdDeleted = $bdd->prepare('SELECT prix FROM articles WHERE id = ?');
				$reqIdDeleted->execute(array((int) $_POST['id']));
				$idDeleted = $reqIdDeleted->fetch();

				$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
				$reqDelete->bindParam(':index', $_POST['id'], PDO::PARAM_INT);
				$reqDelete->execute();

				$updCourse = $bdd->prepare('UPDATE courses SET depense=? WHERE id=?');
				$updCourse->execute(array($usedCourse['depense'] - $idDeleted['prix'], $usedCourse['id']));

				echo json_encode(['done', $idDeleted['prix']]);
			}
			elseif (isset($_POST['deletePreview'])) {
				$_POST['id'] = (int) $_POST['id'];

				$reqDelete = $bdd->prepare('DELETE FROM articles WHERE id=:index');
				$reqDelete->bindParam(':index', $_POST['id'], PDO::PARAM_INT);
				$reqDelete->execute();

				echo json_encode(['done']);
			}
			elseif(isset($_POST['submitCourse'])) {
				$titre = htmlspecialchars((string)  $_POST['titre']);
				$maxPrice = htmlspecialchars((string)  $_POST['maxPrice']);

				$insert = $bdd->prepare('INSERT INTO courses (nom, maxprice, groupe) VALUES (?,?,?)');
				$insert->execute(array($titre, $maxPrice, $user['groupe']));

				echo json_encode(['done']);

			}
			elseif(isset($_POST['buyPreview'])) {
				$updCourse = $bdd->prepare('UPDATE articles SET preview=0, prix=? WHERE id=?');
				$updCourse->execute(array((float) $_POST['prix'],(int) $_POST['id']));

				$updCourse = $bdd->prepare('UPDATE courses SET depense=? WHERE id=?');
				$updCourse->execute(array($usedCourse['depense'] + (float) $_POST['prix'], $usedCourse['id']));

				$reqIdInserted = $bdd->prepare('SELECT * FROM articles WHERE id=?');
				$reqIdInserted->execute(array((int) $_POST['id']));
				$idInserted = $reqIdInserted->fetch();
				echo json_encode(['prix'=>$idInserted['prix'], 'idArticle'=> (int) $_POST['id'], 'titre'=> $idInserted['titre'], 'prix2' => (float) $_POST['prix']]);
			}
			elseif(isset($_POST['activate'])) {
				$updCourse = $bdd->prepare('UPDATE courses SET dateStart=? WHERE id=?');
				$updCourse->execute(array(time(), (int) $_POST['id']));

				echo json_encode(['done']);
			}

		}

	}
}

?>