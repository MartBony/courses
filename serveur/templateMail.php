<?php 
$message .= '

<section style="background: #eee;padding: 20px 10px;">
		<header style="width: 100%;margin-bottom: 20px;">
			<h1 style="display:inline;margin: 0px;text-transform: uppercase; font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif; font-weight: 700; font-size: 2.5em; color: #0078d4;">Courses</h1>
		</header><br><br><br>
		<section style="margin-top: 30px;width: 100%;">
			<p style="margin: 0px;box-sizing: border-box;color: #333;font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif; font-weight: 700; font-size: 1.5em;">Vous pouvez des a present acceder a votre compte avec ce lien</p> <br>

			<a style="color: white;font-size: 1.5em;font-weight:600;background: #0078d4;text-decoration: none;font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif;padding: 5px;" href="http://mprojects.fr/index.php?mail='.$mail.'&auth='.$clef.'">Cliquez ici</a> <br> <br>
			<hr> <br>
			<a style="color: black;font-size: 1.5em;font-family: Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif; font-weight: 700;color: #666;">Ou copiez/collez ce lien dans votre navigateur http://mprojects.fr/index.php?mail='.$mail.'&auth='.$clef.'</a><br><br><br><br>
			<span style="display: block;margin-top: 60px;font-style: 1em;">Ceci est un mail automatique, Merci de ne pas y repondre.;</span>
		</section>
	</section>

'; ?>