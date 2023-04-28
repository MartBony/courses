<div id="buttons">
	<button class="adder" id="addPrev" aria-label="Nouvel article"><i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i></button>
	<button class="adder" id="addArt" aria-label="Nouvel article"><i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i></button>
	<button id="addCourse">
		<i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i>
		Nouvelle Liste
	</button>
</div>
<div id="menubar">
	<ul>
		<li linkTo="panier"><i class="ms-Icon ms-Icon--ShoppingCart" aria-hidden="true"></i></li>
		<li linkTo="liste"><i class="ms-Icon ms-Icon--ShopServer" aria-hidden="true"></i></li>
		<li linkTo="calcul"><i class="ms-Icon ms-Icon--Calculator" aria-hidden="true"></i></li>
		<li linkTo="menu"><img src="images/logos/logo144.png" alt="Logo du site"></li>
	</ul>
</div>
<div id="menus">
	<section id="compteContainer">
		<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
		<h2>Compte</h2>
		<div>
			<article id="privateData">
				<h3>Vos informations personnelles</h3>
			</article>
			<article id="dataHandling">
				<h3>Gestion de vos données</h3>
				<h4>Confidentialité</h4>
				<p>
					Les informations que vous entrez sur l'application sont envoyées sur nos serveurs sur des connections cryptées et sécurisées. 
					Mais attention, vos informations ne sont pas stockées de manière cryptées une fois sur nos serveurs.
					Pour des raisons de sureté et de confidentialité, ne divulgez pas d'informations sensibles dans vos entrées dans l'application.
				</p>
				<h4>Sécurité</h4>
				<p>Nous ne stockons pas votre mot de passe directement.</p>
			</article>
			<article id="premium">
				<h3>Fonctionnalités principales</h3>
				<p>
					Pour prévoir à l'avance vos achats, créez à l'avance vos listes de courses,
					puis une fois chez votre fournisseur, entrez les coûts de vos articles. <br>
					Pour s'organiser sans friction, collaborez sur vos listes à plusieurs sur vos appareils. Chacun peut apporter ses idées à vos listes d'achats <br> <br>

					Pour mieux gérer vos dépenses, fixez vous un objectif de coût à ne pas dépasser lors de la création de vos listes. <br>
					Pour avoir une vision globale de vos habitudes d'achats, la section calcul vous fait un compte rendu visuel.					
				</p>
				<h3>Avantages Premiums</h3>
				<h4>Version gratuite</h4>
				<p>
					Vous pouvez utiliser l'application gratuitement en utilisant deux groupes d'achats,
					avec la possibilité d'inviter une personne supplémentaire dans votre groupe.
				</p>
				<h4>Version premium</h4>
				<p>En s'abonnant à la version premium, les fonctionnalités suivantes sont débloquées :</p>
				<ul>
					<li>Accédez à une analyse avancée de vos courses.</li>
					<li>Rejoignez jusqu'à 5 groupes d'achats pour faire vos listes ensemble.</li>
					<li>Invitez jusqu'a 10 participants dans n'importe lequel de vos groupes d'achats.</li>
					<li>Créez jusqu'à 5 listes de courses consécutives.</li>
				</ul>
				<button id="getPremium">Obtenir les avantages</button>
			</article>
			<article id="conn">
				<h3>Actions du compte</h3>
				<button id="logout">Se déconnecter</button>
				<button id="supprCompte">Supprimer le compte</button>
			</article>
		</div>
	</section>
	<section id="params">
		<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
		<h2>Paramètres</h2>
		<div>
			<article id="interfaceSwitches">
				<h3>Interface</h3>
				<div class="ticket">
					<span class="switch">
						<input type="checkbox" name="currency" id="currency">
						<span class="slider"></span>
					</span>
					<label for="currency">Utiliser le dollar américain</label>
				</div>
			</article><!-- 
			<article id="groupes">
				<h3>Mes groupes</h3>
				<button id="newgroupe"><i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i> Nouveau groupe</button>
			</article> -->
			<article id="invitations">
				<h3>Invitations</h3>
				<p>Acceptez ou refusez vos invitations à rejoindre un groupe</p>
				<div></div>
				<button>Actualiser</button>
			</article>
			<article id="appHandling">
				<h3>Paramères avancés</h3>
				<button id="refreshCache">Actualiser le cache d'application.</button>
			</article>
			<article id="compte">
				<h3>Sécurité</h3>
				<h4>Nom du compte : <em></em></h4>
				<h4>Generer une clef pour rejoindre un groupe</h4>
				<div id="idInvit">
					<button id="generateId">Genérer</button>
					<h4 id="idPrompt"></h4>
				</div>
				
			</article>
		</div>
	</section>
</div>