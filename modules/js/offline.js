
import { LocalStorage, IndexedDbStorage } from './storage.js';
import UI from './UI.js';

class Offline{
	static async pull(app, idGroupe, idCourse){
		let update,
			structure,
			groupe,
			course;
			
		IndexedDbStorage.get("structures", app.user.id)
		.then(data => {
			if(!data) throw new Error("No Structure Data");
			if(!app.pullState.structure){ // If data hasn't been loaded via the network
				structure = data;

				// structure.groupes est une liste d'ids, on cherche les informations des groupes
				return Promise.all(structure.groupes.map(grpid => IndexedDbStorage.get("groupes", parseInt(grpid))));
			} else throw new Error('HaltGroupesFetch');
		})
		.then(groupes => {
			groupes = groupes.filter(groupe => groupe).sort((i1,i2) => i1.id - i2.id); // Filter in case 
			if(!app.pullState.structure){
				structure.groupes = groupes;
				app.updateApp(structure);

				console.log('Local structure fetched:', structure);
				app.pullState.structure = "idb";

				idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || groupes[0].id;
				return groupes.filter(grp => grp.id == idGroupe)[0];

				
			} else throw new Error('HaltStructure');
		})
		.then(res => {
			if(!app.pullState.groupe && res){
				groupe = res;

				return IndexedDbStorage.getCursorwise("courses", "groupe", res.id, "prev");
			} else throw new Error('HaltCoursesFetch');
		})
		.then(arrayCourses => {
			arrayCourses = arrayCourses.sort((i1,i2) => i2.id - i1.id);
			const courses = new Array(arrayCourses.filter(crs => !crs.isold), arrayCourses.filter(crs => crs.isold));
			if(!app.pullState.groupe){
				groupe.coursesList = courses || {};
			
				console.log('Local groupe fetched:', groupe);
				app.pullState.groupe = "idb";


				if(!app.groupe || app.groupe.id != groupe.id){
					idCourse = groupe.defaultId;
				}
				idCourse = idCourse || LocalStorage.getItem('currentListeId') || groupe.defaultId;

				app.updateGroupe(groupe);


				// if(!idCourse) idCourse = app.groupe.coursesList.length != 0 ? app.groupe.coursesList[0].id : null;
				return IndexedDbStorage.get("courses", parseInt(idCourse));
		
			} else throw new Error('HaltGroupe');
		})
		.then(res => {
			if(!res) throw new Error("No Course Data");
			if(!app.pullState.course && res && res.id){
				course = res;
				return IndexedDbStorage.getCursorwise("items", "course", res.id, "prev");
			} else throw new Error('HaltItemsFetch');
		})
		.then(items => {
			items = items.sort((i1,i2) => i2.id - i1.id);
			if(!app.pullState.course){
				if(items){
					course.items = {
						previews: items.filter(item => item.type == "preview"),
						articles: items.filter(item => item.type == "article")
					};
				}
				else items = {articles: [], previews: []}
				console.log('Local course fetched:', course);
				app.pullState.course = "idb";
				const cacheItems = app.updateCourse(course);
				return Offline.filterPendingRequests(app, cacheItems);
			} else throw new Error('HaltItems');
		})
		.then(items => {
			app.course.updateItemsModern(items.articles, items.previews, {save: false});
		})
		.catch(err => {
			if(err.action != "noPrompt"){
				if(["No Structure Data", "No Course Data"].includes(err.message)){
					throw err;
				}
				else if(!["HaltItems", "HaltItemsFetch", "HaltCourses", "HaltCoursesFetch", "HaltGroupe", "HaltGroupesFetch", "HaltStructure"].includes(err.message)){
					console.warn(err);
					if(err.payload){
						if(err.type == "ERROR") UI.erreur(err.payload.message);
					} else UI.erreur("Problème de cache local", "Nous n'avons pas pu acceder au stockage local du téléphone, certaines fonctionnalités hors ligne peuvent être affectées")
				} else console.log(err);
			}

		});
	}
	/* static async updateRequests(app){
		return IndexedDbStorage.getAll("requests")
		.then(reqs => {
			reqs.forEach(req => {
				switch(req.type){
					case "preview":
						if(req.data.groupe == app.groupe.id){
							app.course.pushPreview({id: -req.reqId, titre: req.data.titre, color: req.data.color});
						}
						break;
					case "article":
						if(req.data.groupe == app.groupe.id){
							app.course.pushArticle(app, {id: -req.reqId, titre: req.data.titre, color: req.data.color, prix: req.data.prix});
						}
						break;
					case "delArticle":
						if(req.data.groupe == app.groupe.id){
							let item = app.course.items.articles.filter(item => item.id == req.data.id)[0];
							if(item){
								let rank = app.course.items.articles.indexOf(item);
								UI.remove("article", rank);
								app.course.deleteArticle(app, {id: req.data.id, prix: req.data.prix});
							}
						}
					case "delArticle":
						if(req.data.groupe == app.groupe.id){
							let item = app.course.items.previews.filter(item => item.id == req.data.id)[0];
							if(item){
								let rank = app.course.items.previews.indexOf(item);
								UI.remove("preview", rank);
								app.course.deletePreview(app, req.data.id);
							}
						}
				}
			});
		});
	} */
	static async filterPendingRequests(app, networkItems){
		return IndexedDbStorage.getAll("requests")
		.then(reqs => {
			reqs.forEach(req => {
				switch(req.type){
					case "preview":
						if(req.data.groupe == app.groupe.id){
							networkItems.previews.unshift({
								id: -req.reqId,
								titre: req.data.titre,
								color: req.data.color
							});
						}
						break;
					case "article":
						if(req.data.groupe == app.groupe.id){
							networkItems.articles.unshift({
								id: -req.reqId,
								titre: req.data.titre,
								color: req.data.color,
								prix: req.data.prix
							});
						}
						break;
					case "buy":
						if(req.data.groupe == app.groupe.id){
							const item =  networkItems.previews.filter(preview => preview.id == req.data.id)[0];
							if(item){
								networkItems.previews = networkItems.previews.filter(preview => preview.id != req.data.id);
								networkItems.articles.unshift({
									id: -req.reqId,
									titre: item.titre,
									color: item.color,
									prix: req.data.prix
								});
							}
						}
						break;
					case "delArticle":
						networkItems.articles = networkItems.articles.filter(article => article.id != req.data.id);
						break;
					case "delPreview":
						networkItems.previews = networkItems.previews.filter(preview => preview.id != req.data.id);
						break;
				}
			});

			return networkItems;
		});
	}
}

export default Offline;