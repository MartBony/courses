<?php
	require('dbConnect.php');

	// Require https
/* 	if ($_SERVER['HTTPS'] != "on") {
		$url = "https://". $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		header("Location: $url");
		exit;
	} */

?>
<!DOCTYPE html>
<html lang="fr" class="theme-light">
<head>
	<title>Faire ses courses</title>
	<meta charset="utf-8">
	<meta name="Description" content="Une application pour rassembler, organiser et partager ses courses">
	<link type="text/css" href="styles/preload.css" rel="stylesheet"/>
	<link type="text/css" href="styles/style.css" rel="preload" as="style" onload="this.rel='stylesheet'" />
	<link type="text/css" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" rel="preload" as="style" onload="this.rel='stylesheet'" />
	<?php include("cssfavicone.html"); ?>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="manifest" href="manifest.json"></link>
</head>
<body>
	<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
	<script type="module" src="./modules/js/index.js" async></script>
	<?php require('modules/php/preload.php'); ?>
	<?php require('modules/php/popups.php'); ?>
	<?php require('modules/php/menus.php'); ?>
	<?php require('modules/php/forms.php'); ?>
	<header class="phones">
		<section id="touchSurface"></section>
		<h1 class="noselect">Panier</h1>
		<i class="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i>
	</header>
	<header class="tablet">
		<h1 class="noselect">Faire ses courses</h1>
		<i class="ms-Icon ms-Icon--Calculator" aria-hidden="true"></i>
		<i class="ms-Icon ms-Icon--Settings" aria-hidden="true"></i>
		<i id="headRefresh" class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i>
		<i class="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i>
	</header>
	<h1>Panier</h1>
	<h1>Liste de course</h1>
	<section id="panier" class="main">
		<ul></ul>
		<button class="adder">Ajouter au panier</button>
		<article class="options">
			<h4>4€ HT</h4>
			<h4>4.1€</h4>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		</article>
	</section>
	<section id="liste" class="main">
		<ul></ul>
		<button class="adder">Ajouter à la liste</button>
		<article class="options">
			<i class="ms-Icon ms-Icon--Shop" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		</article>
	</section>
	
	<div id="add" class="add closed noselect"><i class="ms-Icon ms-Icon--ShoppingCart" aria-hidden="true"></i> Ajouter un article</div>
	<div id="refresh"><i class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i></div>
</body>
</html>