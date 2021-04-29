import loadCss from './loadCss.js';
import onLoadCss from './onLoadCss.js';

const refLink = document.querySelectorAll('link')[1],
style = loadCss("styles/production.css", refLink);
loadCss("https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css", refLink);

onLoadCss(style, function() {
	document.body.classList.add("cssReady");
	const event = new CustomEvent("cssReady", {});
	document.body.dispatchEvent(event);
});
document.body.classList.add("cssReady");