import Storage from './storage.js';
import UI from './UI.js';
import Generate from './generate.js';

class Pull{
	static course(app, idCourse, hasCached = false){
		return $.ajax({
			method: 'POST',
			url: 'serveur/pull.php',
			data: {id: idCourse}
		}).then(function(data) {
			data = JSON.parse(data);
			console.log('Network items fetched:', data);
			app.updateItems(data, true);
		}).catch(err => {
			$('.loader').removeClass('opened');
			if (!hasCached) {
				UI.offlineMsg(err, app.errors.noAccess);
				$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
				setTimeout(function(){
					$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
				},2000);
			}
		});
	}
	static groupes(app, hasCached = false){
		return fetch('serveur/groupes.php').then(function(res) {
			return res.json();
		}).then(function(data) {
			console.log('Network groups fetched:', data);
			return app.updateGroups(data);
		}).catch(err => {
			if(!hasCached){
				UI.offlineMsg(err, app.errors.noAccess);
				$('.activate, .noCourse, noGroupe').remove();
				$('.add, .calcul').css({'visibility':'hidden'});
				$('.main ul').prepend(Generate.noGroupe());
				$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
				setTimeout(function(){
					$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
				},2000);
			}
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