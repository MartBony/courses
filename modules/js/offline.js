
import { LocalStorage, idbStorage } from './storage.js';
import UI from './UI.js';

class Offline{
	static async pull(app, idGroupe, idCourse){
		let update;
		idbStorage.get("structures", app.userId)
			.then(data => {
				if(!app.pullState.structure && data){ // If data hasn't been loaded via the network
					console.log('Local structure fetched:', data);
					app.pullState.structure = "idb";
					update = app.updateApp(data);
					if(update){
						idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || data.groupes[0].id;
						return idbStorage.get("groupes", idGroupe);
					}
				}
			})
			.then(data => {
				if(!app.pullState.groupe && data){
					console.log('Local groupe fetched:', data);
					app.pullState.groupe = "idb";
					update = app.updateGroupe(data);
					if(update){
						idCourse = idCourse || LocalStorage.getItem('usedCourse') || app.usedGroupe.coursesList[0].id;
						idCourse = Number(idCourse);
						// if(!idCourse) idCourse = app.usedGroupe.coursesList.length != 0 ? app.usedGroupe.coursesList[0].id : null;
						return idbStorage.get("courses", idCourse);
					}
				}
			})
			.then(data => {
				if(!app.pullState.course && data){
					console.log('Local course fetched:', data);
					app.pullState.course = "idb";
					update = app.updateCourse(data, true);
				}
			})
			.catch(err => {
				console.log(err);
				UI.erreur("Problème de cache local", "Nous n'avons pas pu acceder au stockage local du téléphone, certaines fonctionnalités hors ligne peuvent être affectées");
			});
	}
}

export default Offline;