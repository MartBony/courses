<div id="modernForms">
	<!-- <section id="modernTransitionner" class="formContainer">
		<h3 class="modernFormTitle">...</h3>
	</section> -->
	<section id="modernArticleAdder" class="formContainer">
		<h3 class="modernFormTitle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			Acheter un article
		</h3>
		<form>
			<div class="formflex">	
				<label for="titreA">Nom</label>
				<input maxlength="50" id="titreA" type="text" name="titreA" required />
			</div>
			<div class="formflex">	
				<label for="prix">Prix (HT, par unité)</label>
				<div class="prixFlex">
					<input id="prix" type="double" name="prix" required />
					€
				</div>
			</div>
			<div class="formflex">
				<label for="quantA">Quantité</label>
				<input id="quantA" type="float" name="quantA" required value="1" />
			</div>
			<input class="submit" type="submit" name="submit" id="submitArticle" value="Ajouter">
		</form>
	</section>
	<section id="modernPreviewAdder" class="formContainer">
		<h3 class="modernFormTitle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			Ajouter un article
		</h3>
		<form>
			<div class="formflex">	
				<label for="titreP">Nom</label>
				<input maxlength="50" id="titreP" type="text" name="titreP" required />
			</div>
			<input class="submit" type="submit" name="submit" id="submitPreview" value="Ajouter">
		</form>
	</section>
	<section id="modernCourseAdder" class="formContainer">
		<h3 class="modernFormTitle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			Créer une course
		</h3>
		<form>
			<div class="formflex">	
				<label>Titre de la course
					<input maxlength="15" type="text" name="titre" required />
				</label>
			</div>
			<div class="formflex">	
				<label>Budget
					<div class="prixFlex">
						<input type="double" name="prixMax" required />
						€
					</div>
				</label>
			</div>
			<div class="formflex">	
				<label>Taxes
					<div class="prixFlex">
						<input type="double" name="taxes" value="0" required />
						%
					</div>
				</label>
			</div>
			<input class="submit" type="submit" name="submitCourse" id="submitCourse" value="Créer">
		</form>
	</section>
	<section id="modernBuyer" class="formContainer">
		<h3 class="modernFormTitle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			Acheter un article
		</h3>
		<form>
			<h2>Article non définit</h2>
			<div class="formflex">
				<label for="newPrice">Prix hors taxes (par unité)</label>
				<div class="prixFlex">
					<input id="newPrice" type="double" name="newPrice" required />
					€
				</div>
			</div>
			<div class="formflex">	
				<label for="quantP">Quantité</label>
				<input id="quantP" type="number" name="quantP" required value="1" />
			</div>
			<input class="submit" type="submit" name="submit" id="setPrice" value="Acheter">
		</form>
	</section>
	<section id="modernGroupeAdder" class="formContainer">
		<h3 class="modernFormTitle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			Créer un groupe
		</h3>
		<form>
			<div class="formflex">	
				<label>Titre du groupe
					<input maxlength="50" type="text" name="titre" required />
				</label>
			</div>
			<input type="submit" name="submit" value="Créer">
		</form>
	</section>
	<section id="modernInviteur" class="formContainer">
		<h3 class="modernFormTitle">
			<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
			Ajouter un membre
		</h3>
		<form>
			<h2>Groupe non défini</h2>
			<div class="formflex">
				<label>Nom de l'invité
					<input type="double" name="nom" required />
				</label>
			</div>
			<div class="formflex">	
				<label>Code de sécurité (à genérer sur le compte de l'invité)
					<input type="number" name="code" required/>
				</label>
			</div>
			<input type="submit" value="Envoyer">
		</form>
	</section>
</div>
<div id="forms">
	<!-- <section id="prices" class="fromContainer">
		<div class="blur"></div>
		<div class="titrePrice"><i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i></div>
		<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
		<form>				
			<label for="newPrice">Prix hors taxes (unitaire)</label>
			<div class="setPrixFlex">
				<input id="newPrice" type="double" name="newPrice" required />
				€
			</div>
			<label for="quantP">Quantité</label>
			<input id="quantP" type="number" name="quantP" required value="1" />
			<input class="submit" type="submit" name="submit" id="setPrice" value="Ajouter">
		</form>
		<ul></ul>
	</section>
	<section id="addArticle" class="fromContainer">
		<div class="blur"></div>
		<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
		<form>
			<label for="titreA">Titre de l'article</label>
			<input maxlength="50" id="titreA" type="text" name="titreA" required />
			<label for="prix">Prix hors taxes (unitaire)</label>
			<div class="prixFlex">
				<input id="prix" type="double" name="prix" required />
				€
			</div>
			<label for="quantA">Quantité</label>
			<input id="quantA" type="number" name="quantA" required value="1" />
			<input class="submit" type="submit" name="submit" id="submitArticle" value="Ajouter">
		</form>
	</section>
	<section id="addPreview" class="fromContainer">
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
			<label for="maxPrice">Budget</label>
			<div class="prixFlex">
				<input id="maxPrice" type="double" name="maxPrice" required />
				€
			</div>
			<label for="cTaxes">Taxes</label>
			<div class="prixFlex">
				<input id="cTaxes" type="double" name="cTaxes" value="0" required />
				%
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
			<input minlength="2" maxlength="20" id="titreG" type="text" name="titreG" required />
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
	</section> -->
</div>