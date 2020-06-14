<?php
	require('dbConnect.php');

	// Require https
	/*if ($_SERVER['HTTPS'] != "on") {
		$url = "https://". $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		header("Location: $url");
		exit;
	}*/

?>
<!DOCTYPE html>
<html>
<head>
	<title>Faire ses courses</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="styles/style.css">
	<link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />
	<?php include("cssfavicone.html"); ?>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="manifest" href="manifest.json"></link>
</head>
<body>
	<div class="overflowed">
		<?php require('modules/php/popups.php'); ?>
		<?php require('modules/php/menus.php'); ?>
		<?php require('modules/php/forms.php'); ?>
		<header>
			<section id="touchSurface"></section>
			<h1 class="noselect">Panier</h1>
			<i class="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i>
		</header>
		<section class="main"><ul class="list"></ul></section>
		<section class="main" style="display: none"><ul class="prevList"></ul></section>
		
		<div class="add closed noselect"><i class="ms-Icon ms-Icon--ShoppingCart" aria-hidden="true"></i> Ajouter un article</div>
		<div id="refresh"><i class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i></div>
	</div>
	<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
	<script type="module" src="./modules/js/index.js"></script>
</body>
</html>