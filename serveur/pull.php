<?php
require('../dbConnect.php');

if(isset($_COOKIE['clefCourses'])){
	$requser = $bdd->prepare('SELECT * FROM securite WHERE clef = ?');
	$requser->execute(array(hash('sha512', (string) $_COOKIE['clefCourses'])));
	$userexist = $requser->rowCount();

	if ($userexist == 1) {
		$user = $requser->fetch();// Logged in

		if (isset($_GET['course'])) {

			$reqUsedCourses = $bdd->prepare('SELECT * FROM courses WHERE id = ? AND groupe=?');
			$reqUsedCourses->execute(array((int) $_GET['course'], $user['groupe']));

		}
		else
		{
			$reqUsedCourses = $bdd->prepare('SELECT * FROM courses WHERE groupe=? ORDER BY id DESC LIMIT 1');
			$reqUsedCourses->execute(array(substr($user['groupe'], 0, 1)));
		}
		$usedCourse = $reqUsedCourses->fetch();


		$reqcourses = $bdd->prepare('SELECT * FROM courses WHERE groupe=? ORDER BY id DESC');
		$reqcourses->execute(array(substr($user['groupe'], 0, 1)));

		$maxId = -1;
		$monthlyPaid = 0;
		$allTimeNumCourses = 0;
		$firstDate = time();
		$coursesList = array();

		while ($courses = $reqcourses->fetch()) { 
			$maxId = max($maxId,$courses['id']);
			if (time() - $courses['dateStart'] < 31*24*60*60 || $courses['id'] == $usedCourse['id']) {// Si la course à été faite lors du dernier mois
				$monthlyPaid += $courses['depense'];
			}
			$allTimeNumCourses++;
			if ($courses['dateStart'] != 0) {
				$firstDate = min($courses['dateStart'], $firstDate);
			}

			array_push($coursesList, ['id' => $courses['id'], 'nom' => $courses['nom']]);
		}

		if ($maxId > 0) {
				
			if (time() - $firstDate > 31*24*60*60) {
				$nbrMoyCourses = max(1,$allTimeNumCourses*(31*24*60*60)/(time() - $firstDate));
			}
			else{
				$nbrMoyCourses = 2.5;
			}

			
			$hasStarted = false;

			if ($usedCourse['id'] != $maxId) { // Si la course utilisée n' est pas la plus récente
				$oldCourse = true;
			}
			else{
				$oldCourse = false;

				if ($usedCourse['dateStart'] != 0) {
					$hasStarted = true;
				}
			}

			$reqarticles = $bdd->prepare('SELECT id, prix, titre FROM articles WHERE course = ? AND preview = 0 ORDER BY id DESC');
			$reqarticles->execute(array($usedCourse['id'])); // A faire -> faire une requête croisée avec Join
			
			$reqpreview = $bdd->prepare('
				SELECT a.titre, a.id, s.hexColor
				FROM articles a
				INNER JOIN securite s
				ON a.idAuteur = s.id
				WHERE a.course = ? AND a.preview = 1
				ORDER BY id DESC
			');
			$reqpreview->execute(array($usedCourse['id']));

			$resArticles = array();
			$resPreview = array();

			while ($aData = $reqarticles->fetch()) {
				array_push($resArticles, ['id' => $aData['id'], 'titre' => $aData['titre'], 'prix' => $aData['prix']]);
			}

			while ($pData = $reqpreview->fetch()) {
				array_push($resPreview, ['id' => $pData['id'], 'titre' => $pData['titre'], 'color' => $pData['hexColor']]);
			}

			echo json_encode([
				'0'=> 'done',
				'startedState' => $hasStarted,
				'coursesList' => $coursesList,
				'oldCourse' => $oldCourse,
				'idCourse' => (int) $usedCourse['id'],
				'articles' => $resArticles,
				'previews' => $resPreview,
				'monthly' => $monthlyPaid,
				'total' => (float) $usedCourse['depense'],
				'coef' => $nbrMoyCourses,
				'max' => (int) $usedCourse['maxprice']
			]);
	
		}
		else{
			echo json_encode(['exception', 'noCourses']);
		}
	}
	else
	{
		echo json_encode(['error', 'login']);
	}
}
else
{
	echo json_encode(['error', 'login']);
}

?>