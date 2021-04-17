<section id="mainPanel">
	<section id="panier" class="main">
		<header class="phones">
			<h1 class="noselect">Panier</h1>
		</header>
		<ul></ul>
		<article class="options">
			<h4>4€ HT</h4>
			<h4>4.1€</h4>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		</article>
	</section>
	<section id="liste" class="main">
		<header class="phones">
			<h1 class="noselect">Liste</h1>
		</header>
		<button id="recycle">Reprendre la liste</button>
		<ul></ul> 
		<article class="options">
			<i class="ms-Icon ms-Icon--Shop" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		</article>
	</section>
	<section id="calcul">
		<header class="phones">
			<h1 class="noselect">Calculer</h1>
		</header>
		<article>
			<h3 class="maxim">Limite envisagée :</h3>
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
			</div>
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
		<header class="phones">
			<h1 class="noselect">Menu</h1>
			<i class="ms-Icon ms-Icon--Settings" aria-hidden="true"></i>
		</header>
		<h2>Historique</h2>
		<article></article>
	</section>
</section>