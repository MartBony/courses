<?php
require_once('../dbConnect.php');

function getItems($courseId){
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
	$resPreviewd = array();

	while ($aData = $reqarticles->fetch()) {
		array_push($resArticles, ['id' => $aData['id'], 'titre' => $aData['titre'], 'prix' => $aData['prix']]);
	}

	while ($pData = $reqpreview->fetch()) {
		array_push($resPreviewd, ['id' => $pData['id'], 'titre' => $pData['titre'], 'color' => $pData['hexColor']]);
	}

	return array('articles' => $reqarticles, 'previews' => $resPreviewd);
}
?>