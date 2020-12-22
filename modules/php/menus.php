<div id="menubar">
	<ul>
		<li linkTo="panier"><i class="ms-Icon ms-Icon--ShoppingCart" aria-hidden="true"></i></li>
		<li linkTo="liste"><i class="ms-Icon ms-Icon--ShopServer" aria-hidden="true"></i></li>
		<li linkTo="calcul"><i class="ms-Icon ms-Icon--Calculator" aria-hidden="true"></i></li>
		<li linkTo="menu"><img src="images/logo144.png" alt="Logo du site"></li>
	</ul>
</div>
<div id="menus">
	<section id="params">
		<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
		<h2>Paramètres</h2>
		<section>
			<article id="interfaceSwitches">
				<h3>Interface</h3>
				<div class="ticket">
					<span class="switch">
						<input type="checkbox" name="currency" id="currency">
						<span class="slider"></span>
					</span>
					<label for="currency">Utiliser le dollar américain</label>
				</div>
				<!-- <div class="ticket">
					<span class="switch">
						<input type="checkbox" name="theme" id="theme">
						<span class="slider"></span>
					</span>
					<label for="theme">Thème sombre</label>
				</div> -->
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
</div>