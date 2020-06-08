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
		<div id="update">
			<p>Une mise à jour est disponible</p>
			<button>Installer</button>
		</div>
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
		<section id="leaveGrp">
			<article>
				<h2>Confirmez pour quitter le groupe</h2>
				<p>Si vous étiez le dernier participant, le groupe et toutes les informations de courses liées seront supprimées</p>
				<div></div>
				<footer>
					<button class="leaveGrp">Quitter</button>
					<button class="back">Retour</button>
				</footer>
			</article>
		</section>	
		<section id="noGroupe">
			<article>
				<h2>Créez ou rejoignez un groupe pour utiliser l'application</h2>
				<p>Les différents participants à un groupe peuvent collaborer sur leurs courses</p>
				<footer>
					<button class="lienParams">Aller aux paramètres</button>
				</footer>
			</article>
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
			<section>
				<article>
					<h3>Interface</h3>
					<div class="switch">
						<input type="checkbox" name="currency" id="currency">
						<span class="slider"></span>
					</div>
					<label for="currency">Utiliser le dollar américain</label>
				</article>
				<article id="groupes">
					<h3>Mes groupes</h3>
					<button id="newgroupe"><i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i> Nouveau groupe</button>
				</article>
				<article id="invitations">
					<h3>Invitations</h3>
					<p>Tapez pour rejoindre</p>
					<div></div>
					<button>Actualiser</button>
				</article>
				<article id="compte">
					<h3>Mon compte</h3>
					<h4>Nom du compte : <em></em></h4>
					<h4>Generer une clef pour rejoindre un groupe</h4>
					<div id="idInvit">
						<button id="generateId">Generer</button>
						<h4 id="idPrompt"></h4>
					</div>
				</article>
			</section>
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
			<h1>Créer une course</h1>
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>
				<label for="titreC">Titre de la course</label>
				<input maxlength="15" id="titreC" type="text" name="titreC" required />
				<label for="maxPrice">Prix à ne pas dépasser</label>
				<div class="prixFlex">
					<input id="maxPrice" type="double" name="maxPrice" required />
					€
				</div>
				<input type="submit" name="submitCourse" id="submitCourse" value="Créer">
			</form>
		</section>
		<section id="addGroupe">
			<h1>Créer un groupe</h1>
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>
				<p>Nombre de groupe maximum: 5</p>
				<label for="titreG">Titre du groupe</label>
				<input maxlength="20" id="titreG" type="text" name="titreG" required />
				<input type="submit" name="submitGroupe" id="submitGroupe" value="Créer">
			</form>
		</section>
		<section id="invitation">
			<h1>Inviter - <span></span></h1>
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			<form>
				<label for="nomInv">Nom du compte</label>
				<input maxlength="50" id="nomInv" type="text" name="nomInv" required />
				<label for="keyInv">Id temporaire</label>
				<input max="999999" id="keyInv" type="number" name="keyInv" required />
				<input type="submit" name="sendInv" id="sendInv" value="Inviter">
			</form>
			<article>
				<h2>Procédure</h2>
				<p>Pour inviter un nouveau participant dans le groupe :</p>
				<ul>
					<li>Generez une clef d'identification dans les paramètres de l'invité</li>
					<li>Renseignez le nom et la clef de l'invité ci-dessus</li>
					<li>Confirmez l'invitation sur l'appareil de l'invité</li>
				</ul>
			</article>
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
			<h3 class="maxim">Limite envisagée :</h3>
			<p id="maxprice"></p>
			<h3>Total :</h3>
			<p id="totalDep"></p>
			<h3>Dépenses du dernier mois:</h3>
			<p id="moiDep"></p>
			<h3>Dépenses par mois envisagées:</h3>
			<p id="moiPrev"></p>
			<h3>Dépenses par an envisagées:</h3>
			<p id="anPrev"></p>
		</section>
	</div>
	<script type="text/javascript" src="../jquery-3.5.0.min.js"></script>
	<script type="module" src="./modules/index.js"></script>
</body>
</html>