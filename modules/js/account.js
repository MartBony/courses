import UI from './UI.js';
import Storage from './storage.js';

export default class Account{
	static auth(){
		return $.ajax({
			method: "POST",
			url: "serveur/auth.php",
			data: { tryCookiesAuth: true }
		}).then(data => {
			if (data && data.status == 200){
				return data.id;
			} else {
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			}
		}).catch(err => {
			if(Storage.getItem('userId')) return Storage.getItem('userId');
			else console.log(err);
		});
	}
}