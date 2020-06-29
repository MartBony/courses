<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkCourse.php');

header("Content-Type: application/json");


login($bdd, function($user) use($bdd){
	checkCourse($user, $bdd, function($user, $course) use($bdd){

		$articles = array();
		$previews = array();


		$reqColor = $bdd->prepare('SELECT `hueColor` FROM `users` WHERE id = ?');

		$reqItems = $bdd->prepare('SELECT * FROM `articles` WHERE `course` = ? ORDER BY id DESC');
		$reqItems->execute(array($course['id']));

		while($article = $reqItems->fetch()){
			if($article['preview'] == 1){
				$reqColor->execute(array($article['idAuteur']));
				$color = $reqColor->fetch();
				$reqColor->closecursor();
				
				array_push($previews, array(
					'id' => $article['id'],
					'color' => $color['hueColor'],
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
				'id' => (int) $course['id'],
				'nom' => $course['nom'],
				'maxPrice' => (float) $course['maxPrice'],
				'total' => (float) $course['total'],
				'dateStart' => (int) $course['dateStart'],
				'groupe' => (int) $course['groupe'],
				'taxes' => (float) $course['taxes'],
				'items' => array(
					'articles' => $articles,
					'previews' => $previews
				)
			)
		));	
		
	});
});

?>