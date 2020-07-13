<section id="authContainer">
	<i class="ms-Icon ms-Icon--Back" aria-hidden="true"></i>
	<h1>S'inscrire</h1>
	<h1>Se connecter</h1>
	<form class="inscipt">
		<label for="iEmail">Email</label>
		<input required type="email" id="iEmail" autocomplete="email">
		<label for="iPass">Mot de passe</label>
		<input required minlength="6" type="password" id="iPass" autocomplete="new-password">
		<label for="iPassConf">Confirmez le mot de passe</label>
		<input required type="password" id="iPassConf" autocomplete="new-password">
		<label for="iNom">Votre nom</label>
		<input required minlength="2" maxlength="20" type="text" id="iNom" autocomplete="name">
		<button class="submit">Envoyer</button>
	</form>
	<form class="connect">
		<label for="cEmail">Email</label>
		<input required type="email" id="cEmail" autocomplete="email">
		<label for="cPass">Mot de passe</label>
		<input required type="password" id="cPass" autocomplete="current-password">
		<button class="submit">Envoyer</button>
	</form>
</section>