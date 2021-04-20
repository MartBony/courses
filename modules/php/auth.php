<section id="authContainer">
	<img draggable="false"  src="images/logos/logo72.png" alt="Logo de l'application.">
	<form class="login">
		<h2>Se connecter</h2>
		<label>Email
			<input required type="email" name="email" autocomplete="email">
		</label>
		<label for="cPass">Mot de passe
			<input required type="password" name="password" autocomplete="current-password">
		</label>
		<button class="submit">Envoyer</button>
	</form>
	<form class="signup">
		<h2>S'inscrire</h2>
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
</section>