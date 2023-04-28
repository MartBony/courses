import Generate from './generate.js';
import { IndexedDbStorage, LocalStorage } from './storage.js';

export default class Groupe{
	id;
	nom;
	membres;
	courses;
	allLists;
	defaultListId = -1;
	constructor(){
		this.courses = [new Array(), new Array()];
		this.allLists = new Array();
	}
	update(groupe, save){
		this.id = parseInt(groupe.id);
		this.nom = groupe.nom;
		this.membres = groupe.membres;
		this.defaultListId = groupe.defaultId;

		LocalStorage.setItem('usedGroupe', this.id);

		// groupes UI
		Array.from(document.querySelectorAll('.groupe')).forEach(node => {
			node.classList.remove("opened");
			if(node.getAttribute('idGroupe') == groupe.id) {
				node.classList.add('opened');
				// setTimeout(() => {node.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})}, 200);
			}
		});

		// Afficher le nombre de jours restant dans le mois
		const monthStamp = 60*60*24*30,
		timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp,
		dayLeft = Math.round((timeMarker-(Date.now()/1000))/(60*60*24));

		document.getElementById("endmonth").innerHTML = dayLeft ? dayLeft +" Jours" : "Ajourd'hui";

		if(save) IndexedDbStorage.put("groupes", groupe);

	}
	updateCourses(courses, save = false, preselect = -1){

		/* Afficher des banderoles si le contenu est vide */
		const banners = Array.from(document.querySelectorAll("#coursesContainer > span")),
			containers = Array.from(document.querySelectorAll('#coursesContainer > div')),
			allLists = new Array();
			banners.forEach(node => node.style.display = "block");


		
		courses.forEach((array, iter) => {
			banners[iter].style.display = array.length ? "none" : "block";
		});

		// CoursesList UI
		containers.forEach((container) => {
			Array.from(container.childNodes).forEach(node => node.remove());
		});

		courses.forEach((array, type) => {
			array.forEach(liste => {
				const listeNode = Generate.course(liste.id, liste.nom);
				if(liste.id == preselect){
					listeNode.classList.add("opened");
				}
				containers[type].appendChild(listeNode);

				if(save) allLists.push(liste);
			});
		});

		this.courses = courses;

		if(save){
			IndexedDbStorage.filterCursorwise("courses", null, null, listIter => listIter.groupe != this.id);

			allLists.forEach(liste => {
				if(liste.id >= 0) IndexedDbStorage.put("courses", {...liste, groupe: this.id})
			});
		}
		

	}
	filterCourse(course){
		if(course.id && course.maxPrice && course.nom && course.isold) return true
		else console.log("Course requirements not fullfilled", course);
		return false
	}
	editCourse(data){ // REDO
		// Update data of lists array
		this.courses.forEach(array =>{
			array.splice(array.findIndex(course => course.id === data.id), 1);
		});
		this.courses[data.isold].push(data);

		// Update UI in lists menu
		const courseUi = Array.from(document.querySelectorAll("#coursesContainer button")).filter(uiItem => uiItem.getAttribute("dbindex") == data.id)[0];
		if(courseUi){
			courseUi.firstChild.textContent = data.nom;
		}
	}
	editCourseCosts(id, costs){
		const innerIndex = this.courses[0].findIndex(course => course.id == id);
		if(innerIndex > -1) this.courses[0][innerIndex].totalCategories = costs;
	}
	removeCourse(id){
		this.courses = this.courses.filter(course => course.id != id);
		document.querySelector(`.course[dbIndex="${id}"]`).remove();
	}
	courseIndexOf(course, container){
		return this.coursesNodeList[type].findIndex((courseNode) => parseInt(courseNode.getAttribute("dbIndex")) == course.id);
	}
	get coursesNodeList(){
		return [
			Array.from(document.getElementById('runninglists').getElementsByClassName("course")),
			Array.from(document.getElementById('oldlists').getElementsByClassName("course"))
		];
	}
	get graphData(){
		// Update Chart
		// On définit un mois comme 30 jours
		const monthStamp = 60*60*24*30,
		// On définit un marqueur temporel dans le futur qui correspond à un changement de mois
		timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp,
		length = 6;

		let result = new Array(4);
		for (let index = 0; index < result.length; index++) {
			result[index] = new Array(length).fill(0);
		}

		this.courses[0].concat(this.courses[1]).forEach((course) => {
			// Calculer le mois auquel la course appartient
			const index = Math.floor((timeMarker-course.dateCreation)/monthStamp);
			if(index < result.length){
				for (let rank = 0; rank < 4; rank++) {
					result[rank][length-index-1] += course.totalCategories[rank];
				}
			}
		});

		return result;
	}
	get averageCoursesCost(){
		const monthStamp = 60*60*24*30,
		timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp;
		var sum = 0, len = 0;
		this.courses[0].concat(this.courses[1]).forEach((course) => {
			if(course.dateCreation > timeMarker-(monthStamp*(6))) {
				sum += course.total;
				len++;
			}
			// document.querySelector('#menu article').appendChild(Generate.course(this, el.id, el.nom));
		});
		return len ? (sum / len).toFixed(1) : 0;
	}
}