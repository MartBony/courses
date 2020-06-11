import UI from './UI.js';

class Pull{
	static course(app, idCourse, hasCached){
		return $.ajax({
			method: 'POST',
			url: 'serveur/pull.php',
			data: {id: idCourse}
		}).then(data => {
			data = JSON.parse(data);
			console.log('Network items fetched:', data);
			app.updateCourse(data, true);
		}).catch(err => {
			if (!hasCached) {
				UI.offlineMsg(app, err, app.errors.noAccess);
				$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
				setTimeout(function(){
					$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
				},2000);
			}
		});
	}
	static groupes(app, idGroupe, hasCached){
		return fetch('serveur/groupes.php').then(function(res) {
			return res.json();
		}).then(function(data) {
			console.log('Network groups fetched:', data);
			return app.updateGroups(data, idGroupe);
		}).catch(err => {
			if(!hasCached){
				UI.offlineMsg(app, err, app.errors.noAccess);
				$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
				setTimeout(function(){
					$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
				},2000);
			}
		});
	}
	static invitations(app){
		$.ajax({
			method: 'POST',
			url: 'serveur/invites.php',
			data: {pull: true}
		}).then(data => app.updateInvites(data))
		.catch(err => {
			console.log(err);
			$('#invitations div').html('Un problème est survenu');
		});
	}
}

export default Pull;