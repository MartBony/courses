<?php
require_once('../dbConnect.php');
require_once('checkers/login.php');
require_once('checkers/checkCourse.php');

header("Content-Type: application/json");


login($bdd, function($user) use($bdd){
	checkCourse($bdd, $user, getPostCourseId(), function($course) use ($user, $bdd){

		$articles = array();
		$previews = array();
		
		$reqItems = $bdd->prepare('
			SELECT a.id, a.titre, a.prix, a.course, a.preview, a.message, u.hueColor, d.id id_domaine, d.couleur couleur_domaine
			FROM `articles` a 
			INNER JOIN `users` u
			ON a.idAuteur = u.id
			INNER JOIN `domaines` d
			ON d.id = a.domaine
			WHERE `course` = ? ORDER BY id DESC
		');
		$reqItems->execute(array($course['id']));

		$total = 0;

		while($article = $reqItems->fetch()){			

			if($article['preview'] == 1){
				
				array_push($previews, array(
					'id' => $article['id'],
					'titre' => $article['titre'],
					'message' => $article['message'],
					'id_domaine' => $article["id_domaine"]
				));
			} else {
				array_push($articles, array(
					'id' => $article['id'],
					'prix' => (float) $article['prix'],
					'titre' => $article['titre'],
					'message' => $article['message'],
					'id_domaine' => $article["id_domaine"]
				));
				$total += (float) $article['prix'];
			}
		}
		
		echo json_encode(array(
			'status' => 200,
			'payload' => array(
				'id' => (int) $course['id'],
				'nom' => $course['nom'],
				'maxPrice' => (float) $course['maxPrice'],
				'total' => $total,
				'dateCreation' => (int) $course['dateCreation'],
				'groupe' => (int) $course['groupe'],
				'taxes' => (float) $course['taxes'],
				'isold' => (float) $course['isold'],
				'items' => array(
					'articles' => $articles,
					'previews' => $previews
				)
			)
		));	
		
	});
});

?>