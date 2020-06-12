<?php
	require('dbConnect.php');

	// Require https
	/*if ($_SERVER['HTTPS'] != "on") {
		$url = "https://". $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		header("Location: $url");
		exit;
	}*/

	if (isset($_GET['clef'])) {
		$requser = $bdd->prepare('SELECT * FROM `users` WHERE `clef` = ?');
		$requser->execute(array(hash('sha512', (string) $_GET['clef'])));
		if ($requser->rowCount() == 1) {
			setcookie("clefCourses", (string) $_GET['clef'], time() + 31*24*3600, '/', null, false, true);
		} else {
			header('Location: ../index.php');
		}
	} elseif(isset($_COOKIE['clefCourses'])) {
		$requser = $bdd->prepare('SELECT * FROM `users` WHERE `clef` = ?');
		$requser->execute(array(hash('sha512', (string) $_COOKIE['clefCourses'])));
		if ($requser->rowCount() == 1) {
			setcookie('clefCourses', $_COOKIE['clefCourses'], time() + 31*24*3600, '/', null, false, true);
		} else {
			header('Location: ../index.php');
		}
	} else {
		header('Location: ../index.php');
	}

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
		<header class="phones">
			<section id="touchSurface"></section>
			<h1 class="noselect">Panier</h1>
			<i class="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i>
		</header>
		<header class="tablet">
			<h1 class="noselect">Faire ses courses</h1>
			<i id="headRefresh" class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Settings" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i>
		</header>
		<h1>Panier</h1>
		<h1>Liste de course</h1>
		<section id="panier" class="main">
			<ul class="list"></ul>
			<button class="adder">Ajouter au panier</button>
		</section>
		<section id="liste" class="main">
			<ul class="prevList"></ul>
			<button class="adder">Ajouter à la liste</button>
		</section>
		
		<div class="add closed noselect"><i class="ms-Icon ms-Icon--ShoppingCart" aria-hidden="true"></i> Ajouter un article</div>
		<div id="refresh"><i class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i></div>
	</div>
	<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
	<script type="module" src="./modules/js/index.js"></script>
</body>
</html>