<section id="prices" class="fromContainer">
	<div class="blur"></div>
	<div class="titrePrice"><i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i></div>
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
	<form>				
		<label for="aprix">Prix de l'article</label>
		<div class="setPrixFlex">
			<input id="newPrice" type="double" name="aprix" required />
			€
		</div>
		<input class="submit" type="submit" name="submit" id="setPrice" value="Ajouter">
	</form>
	<ul></ul>
</section>
<section id="addarticle" class="fromContainer">
	<div class="blur"></div>
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
	<form>
		<label for="titre">Titre de l'article</label>
		<input maxlength="50" id="titreA" type="text" name="titre" required />
		<label for="prix">Prix de l'article</label>
		<div class="prixFlex">
			<input id="prix" type="double" name="prix" required />
			€
		</div>
		<input class="submit" type="submit" name="submit" id="submitArticle" value="Ajouter">
	</form>
</section>
<section id="addpreview" class="fromContainer">
	<div class="blur"></div>
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
	<form>
		<label for="titreP">Titre de l'article</label>
		<input maxlength="50" id="titreP" type="text" name="titreP" required />
		<input class="submit" type="submit" name="submit" id="submitPreview" value="Ajouter">
	</form>
</section>
<section id="addCourse" class="fromContainer">
	<div class="blur"></div>
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
		<input class="submit" type="submit" name="submitCourse" id="submitCourse" value="Créer">
	</form>
</section>
<section id="addGroupe" class="fromContainer">
	<div class="blur"></div>
	<h1>Créer un groupe</h1>
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
	<form>
		<p>Nombre de groupe maximum: 5</p>
		<label for="titreG">Titre du groupe</label>
		<input maxlength="20" id="titreG" type="text" name="titreG" required />
		<input class="submit" type="submit" name="submitGroupe" id="submitGroupe" value="Créer">
	</form>
</section>
<section id="invitation" class="fromContainer">
	<div class="blur"></div>
	<h1>Inviter - <span></span></h1>
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
	<form>
		<label for="nomInv">Nom du compte</label>
		<input maxlength="50" id="nomInv" type="text" name="nomInv" required />
		<label for="keyInv">Id temporaire</label>
		<input max="999999" id="keyInv" type="number" name="keyInv" required />
		<input class="submit" type="submit" name="sendInv" id="sendInv" value="Inviter">
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