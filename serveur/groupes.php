<?php
require('../dbConnect.php');

if(isset($_COOKIE['clefCourses'])){
	$requser = $bdd->prepare('SELECT * FROM securite WHERE clef = ?');
	$requser->execute(array(hash('sha512', (string) $_COOKIE['clefCourses'])));
	$userexist = $requser->rowCount();

	if ($userexist == 1) {
		$user = $requser->fetch();// Logged in
		$groupsInfo = array();

		$reqAllUsers = $bdd->prepare('SELECT nom, groupe FROM securite');

		foreach(str_split($user['groupe']) as $grpId){
			$membres = array();

			// Pulling group info
			$reqgp = $bdd->prepare('SELECT * FROM groupes WHERE id = ?');
			$reqgp->execute(array($grpId));
			$data = $reqgp->fetch();
			$reqgp->closeCursor();

			$reqAllUsers->execute();
			// Pulling membres info
			while($allUsers = $reqAllUsers->fetch()){
				if (strpos($allUsers['groupe'], $grpId) !== false) {
					array_push($membres, $allUsers['nom']);
				}
			}

			if($data != false){
				$data['membres'] = $membres;
				array_push($groupsInfo, $data);
			}
		}

		echo json_encode(array(
			'state' => 200,
			'groupes' => $groupsInfo
		));
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