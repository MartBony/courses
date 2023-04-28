<?php
	require_once('../dbConnect.php');
	require_once('checkers/login.php');
	require_once('checkers/getLatestCourse.php');
	require_once('checkers/checkCourse.php');
	
	header('Content-type: application/json');

	login($bdd, function($user) use ($bdd){
		checkCourse($bdd, $user, getPostCourseId(), function($course) use ($user, $bdd){
			if(isset($_POST["action"])){
				if($_POST["action"] == "enfouir" && !$course['isold']){
					/* Get domain names */
					$reqDomaines = $bdd->prepare('SELECT nom FROM `domaines`');
					$reqDomaines->execute();

					$costsnames = array();
					$costs = array();


					while($domaines = $reqDomaines->fetch()){
						array_push($costsnames, $domaines[0]);
						array_push($costs, 0);
					}

					/* Calculate costs once again in case of errors, in each category */
					$reqCost = $bdd->prepare('SELECT SUM(`prix`), domaine FROM `articles` WHERE `course` = ? GROUP BY `domaine`');
					$reqCost->execute(array($course['id']));

					$sum = 0;
					$i = 0;
					while($cost = $reqCost->fetch()){
						$sum += $cost[0];
						$costs[$i] = $cost[0];
						$i += 1;
					}

					/* Update list to isold */
				
					$updatecourse = $bdd->prepare('UPDATE `courses` SET `total`= ?, `isold` = 1 WHERE `id` = ?');
					$updatecourse->execute(array($sum,$course['id']));
					
					/* Delete articles */
					$delArticles = $bdd->prepare('DELETE FROM `articles` WHERE `course` = ?');
					$delArticles->execute(array($course['id']));

					/* Add articles to remember the cost in each categories */
					for ($i=0; $i < count($costs); $i++) { 
						$insertArt = $bdd->prepare(
							'INSERT INTO `articles`
							(`titre`, `prix`, `course`, `domaine`, `idAuteur`, `preview`)
							VALUES (?,?,?,?,?,0)'
						);
						$insertArt->execute(array("Categorie : ". $costsnames[$i], $costs[$i], $course['id'], $i, $user['id']));
					}


					echo json_encode(array("done" => true));
				} else {
					echo json_encode(array("done" => False, "msg" => "La liste sélectionnée est déja isold"));
				}
			} else {
				getLatestCourse($bdd, $user, function($user, $latestCourse) use ($bdd, $course){ // CheckGroupe dans cette fonction
					
					$reqUpdateItems = $bdd->prepare('UPDATE `articles` SET `course`=:newCourseId WHERE `course`=:oldCourseId AND `preview`=1');
					$reqUpdateItems->execute(array(
						"newCourseId" => $latestCourse['id'],
						"oldCourseId" => $course['id']
					));
					echo json_encode(array("status" => 200));

				});
			}
		});
	});

?>