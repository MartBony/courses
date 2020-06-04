<?php
	require('dbConnect.php');

	// Require https
	/*if ($_SERVER['HTTPS'] != "on") {
		$url = "https://". $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		header("Location: $url");
		exit;
	}*/

	if (isset($_GET['clef'])) {
		$requser = $bdd->prepare('SELECT * FROM securite WHERE clef = ?');
		$requser->execute(array(hash('sha512', (string) $_GET['clef'])));
		$userexist = $requser->rowCount();

		if ($userexist == 1) {
			$user = $requser->fetch();
			$updateActivity = $bdd->prepare('UPDATE securite SET activity=? WHERE id=?');
			$updateActivity->execute(array(date("Y-m-d"), $user['id']));

			setcookie("clefCourses", (string) $_GET['clef'], time() + 31*24*3600, '/', null, false, true);
			setcookie("selfColorCourses", (string) $user['hexColor'], time() + 31*24*3600, '/', null, false, true);

		}
		else
		{
			header('Location: ../index.php');
		}
	}
	elseif(isset($_COOKIE['clefCourses'])){
		$requser = $bdd->prepare('SELECT * FROM securite WHERE clef = ?');
		$requser->execute(array(hash('sha512', (string) $_COOKIE['clefCourses'])));
		$userexist = $requser->rowCount();

		if ($userexist == 1) {
			$user = $requser->fetch();
			$updateActivity = $bdd->prepare('UPDATE securite SET activity=? WHERE id=?');
			$updateActivity->execute(array(date("Y-m-d"), $user['id']));

			setcookie('clefCourses', $_COOKIE['clefCourses'], time() + 31*24*3600, '/', null, false, true);
			setcookie("selfColorCourses", $user['hexColor'], time() + 31*24*3600, '/', null, false, true);// On reajoute du temps
		}
		else
		{
			header('Location: ../index.php');
		}
	}
	else
	{
		header('Location: ../index.php');
	}

	/*if (isset($_GET['course'])) {
		$courseIndex = (int) $_GET['course'];
		$reqUsedCourses = $bdd->prepare('SELECT * FROM courses WHERE id = ?');
		$reqUsedCourses->execute(array($courseIndex));
	}
	else
	{
		$reqUsedCourses = $bdd->query('SELECT * FROM courses ORDER BY id DESC LIMIT 1');
	}

	$usedCourse = $reqUsedCourses->fetch();
	if ($usedCourse == '' || $usedCourse == null) {
		$maxPrice = 0;
	}
	else{
		$maxPrice = $usedCourse['maxprice'];
	}

	$reqcourses = $bdd->query('SELECT * FROM courses ORDER BY id DESC');*/
	

?>
<!DOCTYPE html>
<html>
<head>
	<title>Faire ses courses</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="style.css">
	<link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />
	<?php include("cssfavicone.html"); ?>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="manifest" href="manifest.json"></link>
</head>
<body>
	<div class="overflowed">
		<section class="install">
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
			<div class="logo">
				<img src="images/logo_bg.png">
				<img src="images/logo_bt.png">
				<img src="images/logo_md.png">
				<img src="images/logo_tp.png">
			</div>
			<button>
				Télécharger l'application
			</button>
		</section>
		<section class="loader">
			<div></div>
			Synchronisation
		</section>
		<section class="menu">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Settings" aria-hidden="true"></i>
			<h1>Historique des courses</h1>
			<article>
				<button class="newCourse">
					<i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i>
					Nouvelle Course
				</button>
			</article>
		</section>
		<section id="params">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<h2>Paramètres</h2>
			<article>
				<h3>Interface</h3>
				<div class="switch">
					<input type="checkbox" name="currency" id="currency">
					<span class="slider"></span>
				</div>
				<label for="currency">Utiliser le dollar américain</label>
			</article>
			<article id="groupes">
				<h3>Vos groupes</h3>
				<button class="groupe opened">
					<h4>Famille</h4>
					<ul>
						<li>Moi</li>
						<li>Véro</li>
					</ul>
				</button>
				<button class="groupe">
					<h4>Famille</h4>
					<ul>
						<li>Moi</li>
						<li>Véro</li>
					</ul>
				</button>
				<button id="newgroupe"><i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i> Ajouter un groupe</button>
			</article>
		</section>
		<section id="prices">
			<div class="titrePrice"><i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i></div>
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>				
				<label for="aprix">Prix de l'article</label>
				<div class="setPrixFlex">
					<input id="newPrice" type="double" name="aprix" required />
					€
				</div>
				<input type="submit" name="submit" id="setPrice" value="Ajouter">
			</form>
			<ul></ul>
		</section>
		<section id="addarticle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>
				<label for="titre">Titre de l'article</label>
				<input maxlength="50" id="titreA" type="text" name="titre" required />
				<label for="prix">Prix de l'article</label>
				<div class="prixFlex">
					<input id="prix" type="double" name="prix" required />
					€
				</div>
				<input type="submit" name="submit" id="submitArticle" value="Ajouter">
			</form>
		</section>
		<section id="addpreview">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>
				<label for="titreP">Titre de l'article</label>
				<input maxlength="50" id="titreP" type="text" name="titreP" required />
				<input type="submit" name="submit" id="submitPreview" value="Ajouter">
			</form>
		</section>
		<section id="addCourse">
			<h1>Ajouter une course</h1>
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>
				<label for="titreC">Titre de la course</label>
				<input maxlength="50" id="titreC" type="text" name="titreC" required />
				<label for="maxPrice">Prix à ne pas dépasser</label>
				<div class="prixFlex">
					<input id="maxPrice" type="double" name="maxPrice" required />
					€
				</div>
				<input type="submit" name="submitCourse" id="submitCourse" value="Ajouter">
			</form>
		</section>
		<div class="error">
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
			<h1><i class="ms-Icon ms-Icon--NetworkTower" aria-hidden="true"></i> Oups, problème de réseau</h1>
			<p></p>
			<button>M'avertir lorsque le réseau est de retour</button>
		</div>
			<header>
				<section id="touchSurface"></section>
				<h1 class="noselect">Panier</h1>
				<i class="ms-Icon ms-Icon--GlobalNavButton" aria-hidden="true"></i>
			</header>
		<section class="main">
			<ul class="list"></ul>
		</section>
		<section class="main" style="display: none">
			<ul class="prevList"></ul>
		</section>
		
		<div class="add closed noselect"><i class="ms-Icon ms-Icon--ShoppingCart" aria-hidden="true"></i> Ajouter un article</div>
		<div id="refresh"><i class="ms-Icon ms-Icon--Refresh" aria-hidden="true"></i></div>
		<section id="backTouchSurf"></section>
		<section id="btTouchSurf"></section>
		<section class="calcul">
			<div class="grip"></div>
			<h2 class="noselect">Calculer</h2>
			<h3 class="maxim">Dépenses maximum autorisées :</h3>
			<p id="maxprice"></p>
			<h3>Total :</h3>
			<p id="totalDep"></p>
			<h3>Dépenses lors du dernier mois:</h3>
			<p id="moiDep"></p>
			<h3>Dépenses par mois prévues:</h3>
			<p id="moiPrev"></p>
			<h3>Dépenses par an prévues:</h3>
			<p id="anPrev"></p>
		</section>
	</div>
	<script type="text/javascript" src="../jquery-3.5.0.min.js"></script>
	<script type="module" src="./modules/index.js"></script>
	<!-- <script type="text/javascript" src="js/storage.js"></script>
	<script type="text/javascript" src="js/touch.js"></script>
	<script type="text/javascript" src="js/ui.js"></script>
	<script type="text/javascript" src="js/refresh.js"></script>
	<script type="text/javascript" src="js/controls.js"></script>
	<script type="text/javascript" src="js/onload.js"></script> -->
</body>
</html>