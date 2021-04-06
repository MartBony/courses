
import { LocalStorage, IndexedDbStorage } from './storage.js';
import UI from './UI.js';

class Offline{
	static async pull(app, idGroupe, idCourse){
		let update,
			course;
		IndexedDbStorage.get("structures", app.userId)
		.then(data => {
			if(!app.pullState.structure && data){ // If data hasn't been loaded via the network
				console.log('Local structure fetched:', data);
				app.pullState.structure = "idb";
				update = app.updateApp(data);
				if(update){
					idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || data.groupes[0].id;
					return IndexedDbStorage.get("groupes", idGroupe);
				}
			} else throw new Error('HaltStructure');
		})
		.then(data => {
			if(!app.pullState.groupe && data){
				console.log('Local groupe fetched:', data);
				app.pullState.groupe = "idb";
				update = app.updateGroupe(data);
				if(update){
					idCourse = idCourse || LocalStorage.getItem('usedCourse') || Math.max(...app.usedGroupe.coursesList.map(course => course.id));
					idCourse = Number(idCourse);
					// if(!idCourse) idCourse = app.usedGroupe.coursesList.length != 0 ? app.usedGroupe.coursesList[0].id : null;
					return IndexedDbStorage.get("courses", idCourse);
				}
			} else throw new Error('HaltGroupe');
		})
		.then(data => {
			if(!app.pullState.course && data && data.id){
				course = data;
				console.log('Fetching articles');
				return IndexedDbStorage.getCursorwise("items", "course", data.id);
			} else throw new Error('HaltCourses');
		})
		.then(items => {
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
				const cacheItems = app.updateCourse(course, true);
				return Offline.filterPendingRequests(app, cacheItems);
			} else throw new Error('HaltItems');
		})
		.then(items => {
			app.course.updateItemsModern(app, items.articles, items.previews, false)
		})
		.catch(err => {
			if(!["HaltItems", "HaltCourses", "HaltGroupe", "HaltStructure"].includes(err.message)){
				console.error(err);
				UI.erreur("Problème de cache local", "Nous n'avons pas pu acceder au stockage local du téléphone, certaines fonctionnalités hors ligne peuvent être affectées");
			}
		});
	}
	static async updateRequests(app){
		return IndexedDbStorage.getAll("requests")
		.then(reqs => {
			reqs.forEach(req => {
				switch(req.type){
					case "preview":
						if(req.data.groupe == app.usedGroupe.id){
							app.course.pushPreview({id: -req.reqId, titre: req.data.titre, color: req.data.color});
						}
						break;
					case "article":
						if(req.data.groupe == app.usedGroupe.id){
							app.course.pushArticle(app, {id: -req.reqId, titre: req.data.titre, color: req.data.color, prix: req.data.prix});
							app.total += req.data.prix;
						}
						break;
					case "delArticle":
						if(req.data.groupe == app.usedGroupe.id){
							let item = app.course.items.articles.filter(item => item.id == req.data.id)[0];
							if(item){
								let rank = app.course.items.articles.indexOf(item);
								UI.remove("article", rank);
								app.course.deleteArticle(app, {id: req.data.id, prix: req.data.prix});
							}
						}
					case "delArticle":
						if(req.data.groupe == app.usedGroupe.id){
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
	}
	static async filterPendingRequests(app, networkItems){
		return IndexedDbStorage.getAll("requests")
		.then(reqs => {
			reqs.forEach(req => {
				switch(req.type){
					case "preview":
						if(req.data.groupe == app.usedGroupe.id){
							networkItems.previews.unshift({
								id: -req.reqId,
								titre: req.data.titre,
								color: req.data.color
							});
						}
						break;
					case "article":
						if(req.data.groupe == app.usedGroupe.id){
							networkItems.articles.unshift({
								id: -req.reqId,
								titre: req.data.titre,
								color: req.data.color,
								prix: req.data.prix
							});
						}
						break;
					case "delArticle":
						networkItems.articles = networkItems.articles.filter(article => article.id != req.data.id);
					case "delArticle":
						networkItems.previews = networkItems.previews.filter(preview => preview.id != req.data.id);
				}
			});

			return networkItems;
		});
	}
}

export default Offline;