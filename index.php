<?php
	require('dbConnect.php');
	
	// Require https
	if ((!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] != "on") && $_SERVER['SERVER_NAME'] != "localhost") {
		$url = "https://". $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		header("Location: $url", true, 301);
		exit;
	}

?>
<!DOCTYPE html>
<html lang="fr" class="theme-light">
<head>
	<meta charset="utf-8">
	<!-- <script type="module" src="./scripts/load/loadHandler.js"></script> -->
	<title>Faire ses courses</title>
	<meta name="Description" content="Une application pour rassembler, organiser et partager ses courses">
	<link type="text/css" href="styles/preload.css" rel="stylesheet"/>
	<link type="text/css" href="styles/style.css" rel="preload" as="style" onload="this.rel='stylesheet'" />
	<link type="text/css" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" rel="preload" as="style" onload="this.rel='stylesheet'" />
	<link rel="manifest" href="manifest.webmanifest"></link>
	<?php include("cssfavicone.html"); ?>
	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
	<!-- <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script> -->
	<!-- <script src="scripts/jquery-3.5.0.min.js"></script> -->
	<script src="scripts/chart.js"></script>
	<script type="module" src="./modules/js/index.js" defer></script>
	<?php require('modules/php/preload.php'); ?>
	<app-window>
		<?php require('modules/php/auth.php'); ?>
		<?php require('modules/php/popups.php'); ?>
		<?php require('modules/php/menus.php'); ?>
		<?php require('modules/php/forms.php'); ?>
		<?php require('modules/php/mainPanel.php') ?>
		<div id="refresh"><i class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i></div>
	</app-window>
</body>
</html>