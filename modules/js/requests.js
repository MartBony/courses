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
			} else if (res.status == "offline") UI.msgIsOffline();
			else throw res;
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
			} else if (res.status == "offline") UI.msgIsOffline();
			else throw res;
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
			} else if (res.status == "offline") UI.msgIsOffline();
			else throw res;
		});
	}
	static invitations(app){
		fetcher({
			method: 'POST',
			url: 'serveur/invites.php',
			data: {pull: true}
		}).then(data => app.updateInvites(data))
		.catch(res => {
			if (res.responseJSON && res.responseJSON.notAuthed){
				UI.requireAuth();
			} else $('#invitations div').html('Un problème est survenu');
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