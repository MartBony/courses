import UI from './UI.js';

class Pull{
	static course(app, idCourse, hasCached, callback){
		callback = callback || function(){};
		return $.ajax({
			method: 'POST',
			url: 'serveur/pull.php',
			data: {id: idCourse}
		}).then(data => {
			data = JSON.parse(data);
			console.log('Network items fetched:', data);
			app.updateCourse(data, true);
			callback();
		}).catch(err => {
			if (!hasCached) UI.offlineMsg(app, err)
			else {UI.offlineMsg(app, err, "Vous êtes déconnectés, la page est en lecture seule et certains éléments peuvent ne pas être à jour"); callback();}
		});
	}
	static groupes(app, idGroupe, hasCached){
		return fetch('serveur/groupes.php').then(function(res) {
			return res.json();
		}).then(function(data) {
			console.log('Network groups fetched:', data);
			return app.updateGroups(data, idGroupe);
		}).catch(err => {
			if(!hasCached) UI.offlineMsg(app, err)	
		 	else UI.offlineMsg(app, err, "Vous êtes déconnectés, la page ne peut pas être actualisée")
		});
	}
	static invitations(app){
		$.ajax({
			method: 'POST',
			url: 'serveur/invites.php',
			data: {pull: true}
		}).then(data => app.updateInvites(data))
		.catch(err => {
			$('#invitations div').html('Un problème est survenu');
		});
	}
}

export default Pull;