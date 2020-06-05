import Storage from './storage.js';
import UI from './UI.js';

class Pull{
	static course(app, idCourse, errMSG = `Vous êtes hors ligne, vous pouvez utiliser l'application consultation seulement`){
		return $.ajax({
			method: 'POST',
			url: 'serveur/pull.php',
			data: {id: idCourse}
		}).then(function(data) {
			data = JSON.parse(data);
			console.log('Network data fetched:', data);
			app.updateItems(data, true);
		}).catch(err => {
			console.log(err);
			if (!hasCached) {
				UI.offlineMsg(err, errMSG);
				$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
				setTimeout(function(){
					$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
				},2000);
			}
		});
	}
	static groupes(app){
		return fetch('serveur/groupes.php').then(function(res) {
			return res.json();
		}).then(function(data) {
			console.log('Network groups fetched:', data);
			return app.updateGroups(data);
		}).catch(err => {
			console.error("Erreur: request.js :", err);
		});
	}
	static storage(index){
		var storageUpdate = (Storage.getItem('items') || new Array(0));
		if (index == -1) {
			storageUpdate.forEach((el, i) => {
				if (el.idCourse > index) {
					index = el.idCourse;
				}
			});
		}
		console.log('Storage data fetched:', storageUpdate.filter(el => el.idCourse == index)[0]);
		return storageUpdate.filter(el => el.idCourse == index)[0];
	}
}

export default Pull;