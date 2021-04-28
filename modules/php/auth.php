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
		<label>Email
		<input required type="email" name="email" autocomplete="email"></label>
		<label>Mot de passe
		<input required minlength="6" type="password" name="password" autocomplete="new-password"></label>
		<label>Confirmez le mot de passe
		<input required type="password" name="passwordVer" autocomplete="new-password"></label>
		<label for="iNom">Votre nom
		<input required minlength="2" maxlength="20" type="text" name="nom" autocomplete="name"></label>
		<button class="submit">Envoyer</button>
	</form>
</section>