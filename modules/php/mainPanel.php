<section id="mainPanel">
	<section id="panier" class="main">
		<header>
			<h1 class="noselect">Panier</h1>
		</header>
		<state-card>
			<span>
				<h2>Chargement</h2>
				<p>Veuillez patienter</p>
			</span>
			<span>
				<h2>🛒 Votre avancement : <strong id="avancementprc">0%</strong></h2>
				<div><span></span></div>
			</span>
			<span>
				<h2>Cette liste est achevée</h2>
				<p>Ses éléments ont étés supprimés mais son prix total à été conservé</p>
			</span>
			<span>
				<h2>Aucune liste séléctionnée.</h2>
				<p>Rendez-vous dans le menu des listes pour créer une nuvelle liste !</p>
			</span>
		</state-card>
		<ul></ul>
		<article class="options">
			<h4>4€ HT</h4>
			<h4>4.1€</h4>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		</article>
	</section>
	<section id="liste" class="main">
		<header>
			<h1 class="noselect">Liste</h1>
		</header>
		<!-- <button id="recycle">Reprendre la liste</button> -->
		<ul></ul> 
		<article class="options">
			<i class="ms-Icon ms-Icon--Shop" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		</article>
	</section>
	<section id="calcul">
		<header>
			<h1 class="noselect">Calculer</h1>
		</header>
		<article>
			<ul>
				<li><div><span id="average">0</span><span class="currency">€</span></div> Prix moyen d'un article  (TTC)</li>
				<li><div id="nbrarticles">0</div> Nombre d'articles dans le panier</li>
			</ul>
			<ul>
				<li>Total (TTC) <div><span id="total">0</span><span class="currency">€</span></div></li>
				<li>Objectif <div><span id="objectif">0</span><span class="currency">€</span></div></li>			
			</ul>
			<ul>
				<li><div><span id="averagecourses">0</span><span class="currency">€</span></div> Coût moyen d'une course sur les derniers mois</li>
				<li><div id="endmonth">0 Jours</div> Restant ce mois-ci</li>
			</ul>
			<!-- <h3 class="maxim">Limite envisagée :</h3>
			<p id="maxprice"></p>
			<div class="flex">
				<div class="card">
					<h3>Total sans taxes</h3>
					<p id="totalDep"></p>
				</div>
				<div class="card">
					<h3>Total avec taxes</h3>
					<p id="totalTaxDep"></p>
				</div>
				<div class="card">
					<h3>Fin du mois dans</h3>
					<p id="endmonth"></p>
				</div>
			</div> -->
		</article>
		<!-- <h3>Dépenses du dernier mois:</h3>
		<p id="moiDep"></p>
		<h3>Dépenses par mois envisagées:</h3>
		<p id="moiPrev"></p>
		<h3>Dépenses par an envisagées:</h3>
		<p id="anPrev"></p> -->
		<canvas id="depensesChart" width="400" height="400"></canvas>
	</section>
	<section id="menu">
		<header>
			<h1 class="noselect">Menu</h1>
		</header>
		<article id="optsButtons">
			<button id="paramsOpener"><i class="ms-Icon ms-Icon--Settings" aria-hidden="true"></i> Paramètres</button>
			<button id="compteOpener"><i class="ms-Icon ms-Icon--Contact" aria-hidden="true"></i> Compte</button>
		</article>
		<article id="groupesContainer">
			<h2>Mes groupes</h2>
			<div></div>
			<button><i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i> Nouveau groupe</button>
		</article>
		<article id="coursesContainer">
			<h2>Mes Listes</h2>
			<h3>En cours</h3>
			<span><h5>Rien pour l'instant</h5> <p>Ici, retouvez les courses actives, vous pouvez les modifier à tout moment.</p></span>
			<div id="runninglists"></div>
			<h3>Achevées</h3>
			<span><h5>Rien pour l'instant</h5> <p>Ici, retouvez les courses terminées, plus anciennes</p></span>
			<div id="oldlists"></div>
		</article>
	</section>
</section>