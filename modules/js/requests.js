import UI from './UI.js';
import { fetcher } from './tools.js';

class Pull{
	static structure(app){
		return fetcher({
			method: 'POST',
			url: 'serveur/structure.php'
		}).then(res => {
			if(res && res.groupes && res.id && res.nom){
				return res;
			} else if (res.status == 401) {
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			} else {
				if(!app.pullState.structure) UI.offlineMsg(app, res)	
				else UI.offlineMsg(app, res, "Vous êtes déconnectés. La page est en lecture seule et certains éléments peuvent ne pas être à jour.")
			}
		});
	}
	static groupe(app, idGroupe){
		return fetcher({
			method: 'POST',
			url: 'serveur/groupe.php',
			data: {groupe: idGroupe}
		}).then(res => {
			if(res && res.id && res.coursesList && res.membres && res.nom){
				return res;
			} else if(!app.pullState.groupe) UI.offlineMsg(app, res)	
		 	else UI.offlineMsg(app, res, "Vous êtes déconnectés. La page est en lecture seule et certains éléments peuvent ne pas être à jour.")
		});
	}
	static course(app, idCourse){
		return fetcher({
			method: 'POST',
			url: 'serveur/pull.php',
			data: {course: idCourse}
		}).then(res => {
			if(res && res.id) {
				return res;
			} else if (!app.pullState.course) UI.offlineMsg(app, res)
			else UI.offlineMsg(app, res, "Vous êtes déconnecté. La page est en lecture seule et certains éléments peuvent ne pas être à jour.")
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
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			} else $('#invitations div').html('Un problème est survenu');
		});
	}
}

export default Pull;