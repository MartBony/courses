<div class="notification" id="message">
	<h2></h2>
	<p></p>
	<div></div>
</div>
<div class="notification" id="erreur">
	<h2></h2>
	<p></p>
	<div></div>
</div>
<item-options>
	<article>
		<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
		<h2>Aucun article sélectionné</h2>
		<i id="colorEtiquette"></i>
		<h3 id="articlePrix"><span>0€</span> (<span>0€</span> HT)</h3>
		<p>Attendez que votre article soit synchronisé avec le serveur pour lui assigner un message.</p>
		<form id="item-message">
			<textarea placeholder="Pas de notes" name="message" rows="3" maxlength="130"></textarea>
			<div id="msg-action">
				<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
				<button><i class="ms-Icon ms-Icon--Save" aria-hidden="true"></i></button>
			</div>
		</form>
		<ul>
			<li><i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i></li>
			<li><i class="ms-Icon ms-Icon--Shop" aria-hidden="true"></i></li>
		</ul>
	</article>
</item-options>
<!-- <section class="install">
	<i class="ms-Icon ms-Icon--Cancel" aria-hidden="true"></i>
	<div class="logo">
		<img src="images/logos/logo_bg.png">
		<img src="images/logos/logo_bt.png">
		<img src="images/logos/logo_md.png">
		<img src="images/logos/logo_tp.png">
	</div>
	<button>Télécharger l'application</button>
</section> -->
<section class="loader">
	<div class="logo">
		<img src="images/logos/logo_bg.png">
		<img src="images/logos/logo_bt.png">
		<img src="images/logos/logo_md.png">
		<img src="images/logos/logo_tp.png">
	</div>
	<h1>En cours</h1>
</section>
<section id="modal">
	<article id="leaveGroupe">
		<h2>Confirmez pour quitter le groupe</h2>
		<p>Si vous étiez le dernier participant, le groupe et toutes les informations de courses liées seront supprimées</p>
		<div></div>
		<footer>
			<button class="confirmLeaveGroupe">Quitter</button>
			<button class="back">Retour</button>
		</footer>
	</article>
	<article id="noGroupe">
		<h2>Créez ou rejoignez un groupe pour utiliser l'application</h2>
		<p>Les différents participants à un groupe peuvent collaborer sur leurs courses</p>
		<footer>
			<button class="lienParams">Aller aux paramètres</button>
		</footer>
	</article>
	<article id="deleteCourse">
		<h2>Confirmez pour supprimer la course</h2>
		<p>Tous les articles de la course seront supprimées. Les calculs ne prendrons plus en compte les dépenses liées à cette course</p>
		<footer>
			<button class="supprConfCourse">Confirmer</button>
			<button class="back">Annuler</button>
		</footer>
	</article>
	<article id="deleteAll">
		<h2>Confirmez pour supprimer le compte</h2>
		<p>Les groupes dont vous étiez le dernier participant seront supprimés avec leurs courses et articles. <br>
		Les groupes encore partagés sont conservés mais votre nom n'y apparait plus. <br>
		Les données sur votre email, votre nom et votre mot de passe sont supprimées</p>
		<footer>
			<button class="supprConf">Confirmer</button>
			<button class="back">Annuler</button>
		</footer>
	</article>
</section>