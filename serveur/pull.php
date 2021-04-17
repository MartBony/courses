<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkCourse.php');

header("Content-Type: application/json");


login($bdd, function($user) use($bdd){
	checkCourse($bdd, $user, getPostCourseId(), function($user, $course) use($bdd){

		$articles = array();
		$previews = array();
		
		$reqItems = $bdd->prepare('
			SELECT a.id, a.titre, a.prix, a.course, a.preview, u.hueColor
			FROM `articles` a 
			INNER JOIN `users` u
			ON a.idAuteur = u.id
			WHERE `course` = ? ORDER BY id DESC
		');
		$reqItems->execute(array($course['id']));

		while($article = $reqItems->fetch()){
			if($article['preview'] == 1){
				
				array_push($previews, array(
					'id' => $article['id'],
					'color' => $article['hueColor'],
					'titre' => $article['titre']
				));
			} else {
				array_push($articles, array(
					'id' => $article['id'],
					'prix' => $article['prix'],
					'color' => $article['hueColor'],
					'titre' => $article['titre']
				));
			}
		}
		
		echo json_encode(array(
			'status' => 200,
			'payload' => array(
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