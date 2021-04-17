import Generate from './generate.js';
import { IndexedDbStorage, LocalStorage } from './storage.js';
import UI from './UI.js';

export default class Groupe{
	constructor(){
		this.id;
		this.nom;
		this.membres;
		this.courses = new Array();
	}
	update(groupe){
		this.id = parseInt(groupe.id);
		this.nom = groupe.nom;
		this.membres = groupe.membres;

		LocalStorage.setItem('usedGroupe', this.id);

		// UI
		Array.from(document.querySelectorAll('.groupe')).forEach(node => {
			node.classList.remove("opened");
			if(node.getAttribute('idGroupe') == groupe.id) node.classList.add('opened')
		});
	}
	updateCourses(app, courses, save = false){
		courses.forEach((course, index) => {
			const courseNode = document.querySelector(`.course[dbIndex="${course.id}"]`),
				courseNodeIndex = this.courseIndexOf(course);

			if(courseNodeIndex > -1){
				if(courseNodeIndex != index) courseNode.parentNode.insertBefore(courseNode, courseNode.parentNode.childNodes[index])
			} else {
				if(courseNode) courseNode.remove();
				this.insertCourse(index, course);
			}
		});

		this.coursesNodeList.slice(courses.length).forEach(courseNode => {
			courseNode.remove();
		});

		this.courses = courses;


		if(save){
			IndexedDbStorage.filterCursorwise("courses", null, null, (course) => {
				if(course.groupe == this.id){
					if(this.courseIndexOf(course) == -1) return false
				}
				return true;
			});

			
			courses.forEach(course => {
				if(course.id >= 0) IndexedDbStorage.put("courses", {...course, groupe: this.id})
			});
		}


		// UI
		Array.from(document.getElementsByClassName('noCourse')).forEach(node => node.remove());
		UI.closeModal();

		const monthStamp = 60*60*24*30,
		timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp,
		dayLeft = Math.round((timeMarker-(Date.now()/1000))/(60*60*24));

		document.getElementById("endmonth").innerHTML = dayLeft ? dayLeft +" Jours" : "Ajourd'hui";

		if(!courses.length) {
			// Array.from(document.querySelectorAll('#menu .course')).forEach(node => node.remove());
			Array.from(document.querySelectorAll('.main ul')).forEach(node => node.prepend(Generate.noCourse()));
			app.buttons = "hide";

			// this.usedGroupe = groupe;
			return false;
		}

	}
	filterCourse(course){
		if(course.id && course.maxPrice && course.nom) return true
		else console.log("Course requirements not fullfilled", course);
		return false
	}
	pushCourse(course){
		if(this.filterCourse(course)){
			this.insertCourse(0, course)
			this.courses.unshift({
				groupe: this.id,
				dateStart: course.dateStart || 0,
				id: course.id,
				maxPrice: course.maxPrice,
				nom: course.nom,
				taxes: course.taxes,
				total: course.total || 0
			});
		}
	}
	insertCourse(index, course){
		if(this.filterCourse(course)){
			const courseNode = Generate.course(course.id, course.nom);
			
			if(index) document.querySelector('#menu article').insertBefore(courseNode, this.coursesNodeList[index]);
			else document.querySelector('#menu article').prepend(courseNode);

		}
	}
	removeCourse(id){
		this.courses = this.courses.filter(course => course.id != id);
		document.querySelector(`.course[dbIndex="${id}"]`).remove();
	}
	courseIndexOf(course){
		return this.coursesNodeList
			.findIndex((courseNode, index) => parseInt(courseNode.getAttribute("dbIndex")) == course.id );
	}
	get coursesNodeList(){
		return Array.from(document.getElementsByClassName("course"));
	}
	get graphData(){
		// Update Chart
		const monthStamp = 60*60*24*30,
		timeMarker = (Date.now()/1000) - (Date.now()/1000)%(monthStamp) + monthStamp;

		let result = new Array(6).fill(0);

		this.courses.forEach((course) => {console.log(course);
			if(course.date) console.error("Inproper course", course);
			for (let i = 0; i < result.length; i++) {
				if(course.dateStart > timeMarker-(monthStamp*(i+1)) && course.dateStart < timeMarker-(monthStamp*i))  result[result.length-i-1] += parseFloat(course.total)
			}
			// document.querySelector('#menu article').appendChild(Generate.course(this, el.id, el.nom));
		})
		return result.map(valeur => parseFloat(valeur.toFixed(2)));
	}
}