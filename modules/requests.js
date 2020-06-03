import Storage from './storage.js';

export function requestData(app, dest, refresh, hasCached = false, errMSG = `Vous êtes hors ligne, vous pouvez utiliser l'application consultation seulement`){
	var networkUpdate = fetch(dest).then(function(res) {
		return res.json();
	}).then(function(data) {
		console.log('Network data fetched:', data);
		app.updatePage(data, true, refresh, true);
	}).catch(err => {
		if (!hasCached) {
			app.offlineMsg(err, errMSG);
			$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
			setTimeout(function(){
				$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
			},2000);
		}
	});
}


export function requestStorage(index){
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