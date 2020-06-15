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
			<p>Acceptez ou refusez vos invitations à rejoindre un groupe</p>
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
		<article id="conn">
			<h3>Connection</h3>
			<button id="deconnect">Se déconnecter</button>
			<button id="supprCompte">Supprimer le compte</button>
		</article>
	</section>
</section>
<section id="backTouchSurf"></section>
<section id="btTouchSurf"></section>
<section id="calcul">
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
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