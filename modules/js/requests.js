import UI from './UI.js';
import { fetcher } from './tools.js';

class Pull{
	static structure(app){
		return fetcher({
			method: 'POST',
			url: 'serveur/structure.php'
		}).then(res => {
			if(res.status == 200 && res.payload && res.payload.groupes && res.payload.id && res.payload.nom){
				return res.payload;
			} else if (res.status == 401) {
				UI.requireAuth();
				throw "Not Athenticated"
			} else {
				UI.message(
					"Vous êtes hors ligne", 
					"Certaines fonctionnalités seront limités, vos modifications seront synchronisées ulterieurement",
					null, 3000);
				throw "no App data"
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
			if(res.status == 200){
				if(res.payload && res.payload.id && res.payload.coursesList && res.payload.membres && res.payload.nom){
					return res.payload;
				} else if(!app.pullState.groupe) UI.offlineMsg(app, res)
			} else if (res.status == "Offline") UI.message(
				"Vous êtes hors ligne", 
				"Certaines fonctionnalités seront limités, vos modifications seront synchronisées ulterieurement",
				null, 3000);
		});
	}
	static course(idCourse){
		return fetcher({
			method: 'POST',
			url: 'serveur/pull.php',
			data: { course: idCourse }
		}).then(res => {
			if(res.status == 200){
				return res.payload;
			}
			else if(res.status == 204 || res.status == 403) throw "Course Not Found"
			else if(res.status == 204) throw "Course Not Found"
			else if (res.status == "Offline") UI.message(
				"Vous êtes hors ligne", 
				"Certaines fonctionnalités seront limités, vos modifications seront synchronisées ulterieurement",
				null, 3000);
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
			} else if(res.status && res.status == "offline"){
				throw "Offline"
			}

			throw "Require auth";

	}
}

export default Pull;