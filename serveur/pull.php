<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkCourse.php');

function pull($user, $usedCourse, $bdd){
	$articles = array();
	$previews = array();


	$reqColor = $bdd->prepare('SELECT hexColor FROM securite WHERE id = ?');

	$reqItems = $bdd->prepare('SELECT * FROM `articles` WHERE `course` = ? ORDER BY id DESC');
	$reqItems->execute(array($_POST['id']));

	while($article = $reqItems->fetch()){
		if($article['preview'] == 1){
			$reqColor->execute(array($article['idAuteur']));
			$color = $reqColor->fetch();
			$reqColor->closecursor();

			array_push($previews, array(
				'id' => $article['id'],
				'color' => $color['hexColor'],
				'titre' => $article['titre']
			));
		} else {
			array_push($articles, array(
				'id' => $article['id'],
				'prix' => $article['prix'],
				'titre' => $article['titre']
			));
		}
	}

	echo json_encode(array(
		'status' => 200,
		'course' => array(
			'id' => $usedCourse['id'],
			'nom' => $usedCourse['nom'],
			'maxPrice' => $usedCourse['maxPrice'],
			'total' => $usedCourse['total'],
			'dateStart' => $usedCourse['dateStart'],
			'groupe' => $usedCourse['groupe'],
			'items' => array(
				'articles' => $articles,
				'previews' => $previews
			)
		)
	));
				
}

login($bdd, function($user, $bdd){
	checkCourse($user, $bdd, function($user ,$usedCourse , $bdd){
		pull($user ,$usedCourse, $bdd);
	});
});

?>