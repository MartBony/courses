<div id="modernForms">
	<!-- <section id="modernTransitionner" class="formContainer">
		<h3 class="modernFormTitle">...</h3>
	</section> -->
	<section id="modernArticleAdder" class="formContainer">
		<div class="formsPanel">
			<article>
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
							<input id="prix" type="number" step="0.01" min="0" name="prix" required />
							€
						</div>
					</div>
					<div class="formflex">
						<label for="quantA">Quantité</label>
						<input id="quantA" type="float" name="quantA" required value="1" />
					</div>
					<input class="submit" type="submit" name="submit" id="submitArticle" value="Ajouter">
				</form>
			</article>
		</div>
	</section>
	<section id="modernPreviewAdder" class="formContainer">
		<div class="formsPanel">
			<article>
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
			</article>
		</div>
	</section>
	<section id="modernCourseAdder" class="formContainer">
		<div class="formsPanel">
			<article>
				<h3 class="modernFormTitle">
					<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
					Créer une liste
				</h3>
				<form>
					<div class="formflex">	
						<label>Titre de la liste
							<input maxlength="30" type="text" name="titre" required />
						</label>
					</div>
					<div class="formflex">	
						<label>Budget
							<div class="prixFlex">
								<input type="number" step="0.01" min="0" name="prixMax" required />
								€
							</div>
						</label>
					</div>
					<div class="formflex">	
						<label>Taxes
							<div class="prixFlex">
								<input type="number" step="0.01" min="0" name="taxes" value="0" required />
								%
							</div>
						</label>
					</div>
					<input class="submit" type="submit" name="submitCourse" id="submitCourse" value="Créer">
				</form>
			</article>
		</div>
	</section>
	<section id="courseEditor" class="formContainer">
		<div class="formsPanel">
			<article>
				<h3 class="modernFormTitle">
					<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
					Modifier la liste
				</h3>
				<form>
					<div class="formflex">	
						<label>Titre de la liste
							<input maxlength="30" type="text" name="titre" required />
						</label>
					</div>
					<div class="formflex">	
						<label>Budget
							<div class="prixFlex">
								<input type="number" step="0.01" min="0" name="prixMax" required />
								€
							</div>
						</label>
					</div>
					<div class="formflex">	
						<label>Date
							<input type="date" name="date" value="0" required />	
						</label>
					</div>
					<div class="formflex">	
						<label>Taxes
							<div class="prixFlex">
								<input type="number" step="0.01" min="0" name="taxes" value="0" required />
								%
							</div>
						</label>
					</div>
					<input class="submit" type="submit" name="submitCourseEdit" id="submitCourseEdit" value="Modifier">
				</form>
			</article>
			<article>
				<button id="enfouir">Archiver la liste</button>
				<p>Vous pouvez archiver une liste une fois que vos courses sont terminées. Archiver une liste supprime les articles de la liste mais conserve son coût total.</p>
			</article>
		</div>
	</section>
	<section id="modernBuyer" class="formContainer">
		<div class="formsPanel">
			<article>
				<h3 class="modernFormTitle">
					<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
					Acheter un article
				</h3>
				<form>
					<h2>Article non définit</h2>
					<div class="formflex">
						<label for="newPrice">Prix hors taxes (par unité)</label>
						<div class="prixFlex">
							<input id="newPrice" type="number" step="0.01" min="0" name="newPrice" required />
							€
						</div>
					</div>
					<div class="formflex">	
						<label for="quantP">Quantité</label>
						<input id="quantP" type="number" name="quantP" required value="1" />
					</div>
					<input class="submit" type="submit" name="submit" id="setPrice" value="Acheter">
				</form>
			</article>
		</div>
	</section>
	<section id="modernGroupeAdder" class="formContainer">
		<div class="formsPanel">
			<article>
				<h3 class="modernFormTitle">
					<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
					Créer un groupe
				</h3>
				<form>
					<div class="formflex">	
						<label>Titre du groupe
							<input maxlength="50" minlength="2" type="text" name="titre" required />
						</label>
					</div>
					<input type="submit" name="submit" value="Créer">
				</form>
			</article>
		</div>
	</section>
	<section id="modernInviteur" class="formContainer">
		<div class="formsPanel">
			<article>
				<h3 class="modernFormTitle">
					<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
					Ajouter un membre
				</h3>
				<form>
					<h2>Groupe non défini</h2>
					<div class="formflex">
						<label>Nom de l'invité
							<input type="number" step="0.01" min="0" name="nom" required />
						</label>
					</div>
					<div class="formflex">	
						<label>Code de sécurité (à genérer sur le compte de l'invité)
							<input type="number" name="code" required/>
						</label>
					</div>
					<input type="submit" value="Envoyer">
				</form>
			</article>
		</div>
	</section>
</div>