import UI from './UI.js';

class Pull{
	static structure(app){
		return $.ajax({
			method: 'POST',
			url: 'serveur/structure.php'
		}).catch(err => {
			if (err.status == 401) {
				UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
					{ texte:"Se connecter", action : () => window.location = "/index.php?auth=courses"}
				]);
			} else {
				if(!app.pullState.structure) UI.offlineMsg(app, err)	
				else UI.offlineMsg(app, err, "Vous êtes déconnectés. La page est en lecture seule et certains éléments peuvent ne pas être à jour.")
			}
		});
	}
	static groupe(app, idGroupe){
		return $.ajax({
			method: 'POST',
			url: 'serveur/groupe.php',
			data: {groupe: idGroupe}
		}).catch(err => {
			if(!app.pullState.groupe) UI.offlineMsg(app, err)	
		 	else UI.offlineMsg(app, err, "Vous êtes déconnectés. La page est en lecture seule et certains éléments peuvent ne pas être à jour.")
		});
	}
	static course(app, idCourse){
		return $.ajax({
			method: 'POST',
			url: 'serveur/pull.php',
			data: {course: idCourse}
		}).catch(err => {
			if (!app.pullState.course) UI.offlineMsg(app, err)
			else UI.offlineMsg(app, err, "Vous êtes déconnecté. La page est en lecture seule et certains éléments peuvent ne pas être à jour.")
		});
	}
	static invitations(app){
		$.ajax({
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