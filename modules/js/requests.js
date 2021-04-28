import UI from './UI.js';
import { fetcher } from './tools.js';

class Pull{
	static structure(app){
		return fetcher({
			method: 'POST',
			url: 'serveur/structure.php'
		}).then(res => {
			if(res.action && res.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
			if(res.status == 200){
				return res.payload;
			} else if (res.status == "offline") {
				UI.msgIsOffline();
				return true;
			} else {
				UI.erreur(err.payload ? err.payload.message : null);
				throw res;
			}
		});
	}
	static groupe(app, idGroupe){
		return fetcher({
			method: 'POST',
			url: 'serveur/groupe.php',
			data: { groupe: idGroupe }
		})
		.then(res => {
			if(res.action && res.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
			if(res.status == 200){
				return res.payload;
			} else if (res.status == "offline") {
				UI.msgIsOffline();
				return true;
			} else {
				UI.erreur(err.payload ? err.payload.message : null);
				throw res;
			}
		});
	}
	static course(idCourse){
		return fetcher({
			method: 'POST',
			url: 'serveur/pull.php',
			data: { course: idCourse }
		}).then(res => {
			if(res.action && res.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
			if(res.status == 200){
				return res.payload;
			} else if (res.status == "offline") {
				UI.msgIsOffline();
				return true;
			} else{
				UI.erreur(err.payload ? err.payload.message : null);
				throw res;
			}
		});
	}
	static invitations(app){
		fetcher({
			method: 'POST',
			url: 'serveur/invites.php',
			body: { pull: true }
		}).then(res => {
			if(res.status == 200) app.updateInvites(res.payload)
			else if(res.payload){
				UI.erreur(res.payload.message)
			} else UI.erreur()
		});
	}
	static async authRequest(){
		const res = await fetcher({
			method: "POST",
			url: "serveur/auth.php",
			data: { tryCookiesAuth: true }
		})
		
		if(res.status == 200 && res.payload && res.payload.userId){
			return res.payload.userId;
		}
		throw res;

	}
}

export default Pull;