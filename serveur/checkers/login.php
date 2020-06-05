<?php

function login( PDO $bdd, $callback){
	if(isset($_COOKIE['clefCourses'])){
		$requser = $bdd->prepare('SELECT * FROM securite WHERE clef = ?');
		$requser->execute(array(hash('sha512', (string) $_COOKIE['clefCourses'])));
		$userexist = $requser->rowCount();

		if ($userexist == 1) {
			$user = $requser->fetch();
			call_user_func($callback, $user, $bdd);

		} else {
			echo json_encode(array('status' => 401));
		}
	} else {
		echo json_encode(array('status' => 401));
	}
}

?>