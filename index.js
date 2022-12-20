let activePage = NaN;

function test(param) {
	console.log("Test " + param);
}

$(document).ready(function () {
	$(".loader").hide();
	$("#navigacija").hide();
});

function changePage(page) {
	$("#navigacija").show();

	if (page == 1 && activePage != 1) {
		activePage = $("#title").html("Simulacija s pomočjo sistemske dinamike");
		$("#opis").html(
			"Ta stran s pomočjo sistemske dinamike poišče parameter hitrosti prenosa R, ki ustrezajo krivulji z realnega sveta. Odstopanje simulacijskega modela od realnosti je prikazano na spodnjem grafu."
		);
		$("#opisI").html(
			"Stanje(k+1) = Stanje(k) + &#916t * (Pritok(k) - Odtok(k))<br>&#916t = 1 <br>  "
		);
		$("#dLabelAux").html(
			"Kvadrat razlike med realnimi in simuliranimi podatki"
		);
		$("#GrafOkuzenih").html(
			'|\
		<label style="color:red">API - Realni</label>\
		|\
		<label style="color:green">Sistemska dinamika</label>\
		|'
		);
	} else if (page == 1 && activePage == 1) {
		page = NaN;
		$("#navigacija").hide();
	}

	if (page == 2 && activePage != 2) {
		$("#Title").html("Simulacija s pomočjo agentnega modela");
		$("#opis").html(
			"Agenti, njihove hitrosti in pozicije se generirajo naključno. Agenti se vsak korak pomaknejo za določeno razdaljo, če pri tem trčita rdeč in zelen, se zelen spremeni v rdečega. Zgornji graf prikazuje število rdečih agentov v nekem koraku."
		);
		$("#opisI").html(
			"Ta stran s pomočjo agentnega modela simulira rast okužb. Na koncu agentni simulacijski model lahko primerjamo z sistemsko dinamiko ter realnim svetom."
		);
		$("#dLabelAux").html("Simulacija trkov agentnega modela");
		$("#GrafOkuzenihD").html(
			'|\
		<label style="color:red">API - Realni</label>\
		|\
		<label style="color:green">Sistemska dinamika</label>\
		|\
		<label style="color:grey">Agentni model</label>\
		|'
		);
	} else if (page == 2 && activePage == 2) {
		page = NaN;
		$("#navigacija").hide();
	}

	activePage = page;

	let inData = $("#drzava").val();
	let data = inData.split(" ");
	let startDate = new Date(data[1]);
	let endDate = new Date(data[3]);
	$("#zacetek").val(startDate.toISOString().substring(0, 10));
	$("#konec").val(endDate.toISOString().substring(0, 10));

	$("canvas").each(function (i, can) {
		can.getContext("2d").clearRect(0, 0, can.width, can.height);
	});

	stop();
}

let grafOkuzenih;
let grafKvadRaz;
let APITabelaOkuzeni = new Array();

function ChangedSelection() {
	let inData = $("#drzava").val();
	let data = inData.split(" ");
	let startDate = new Date(data[1]);
	let endDate = new Date(data[3]);

	// Placeholder
	// let width = parseInt(data[6]);
	// let height = parseInt(data[7]);

	$("#zacetek").val(startDate.toISOString().substring(0, 10));
	$("#konec").val(endDate.toISOString().substring(0, 10));
}

function Start() {
	$(".loader").show();

	if (activePage == 1) {
		initPage1();
	} else {
		initPage2();
	}
}

function createAndInitGraph(canvasName, xLen, yLen, Name) {
	let outGraph = new MultiGraph(canvasName, xLen, yLen, Name);
	outGraph.drawLabels();
	outGraph.can1.getContext("2d").lineWidth = "1";

	return outGraph;
}

function CreateGraphs(graphLen, okuzeniKonec, startDT, endDT) {
	// Create graphs

	grafOkuzenih = createAndInitGraph(
		"GrafOkuzenih",
		graphLen,
		okuzeniKonec,
		"Okuzeni od " +
			startDT.toLocaleDateString() +
			" to " +
			endDT.toLocaleDateString()
	);

	grafKvadRaz = createAndInitGraph(
		"cGraphAux",
		graphLen,
		okuzeniKonec,
		"Kvadrat razlik"
	);
}

function drawArrayOnGraph(graph, arr, series) {
	arr.forEach(function (value) {
		graph.dodajVrednost(value, series);
	});
}

const getCovidStats = async (url, startDate, endDate, onFinish) => {
	try {
		// poizkusimo prebrati podatek iz spletne strani api.covid19api.com ->

		const response = await fetch(
			// "https://api.covid19api.com/dayone/country/slovenia"
			// "https://api.covid19api.com/dayone/country/new-zealand"
			url
		);
		const APIPodatki = await response.json();
		let dataCnt = -1;
		let prevDate = new Date("1900-01-01");

		APITabelaOkuzeni = [];

		for (var i = 0; i < APIPodatki.length; i++) {
			let date = new Date(APIPodatki[i].Date);
			if (date >= startDate) {
				if (date > endDate) break;

				if (date > prevDate) {
					dataCnt++;
					prevDate = date;
					APITabelaOkuzeni[dataCnt] = 0;
				}

				APITabelaOkuzeni[dataCnt] += APIPodatki[i].Confirmed;
			}
		}

		onFinish();
	} catch (err) {
		// v primeru napake izpišemo obvestilo o napaki
		console.log("Napaka pri dostopu do spletne strani.");
		console.log(err);
	} finally {
		$(".loader").hide();
	}
};

// ******************************************************************************************************
//											PAGE 1
//******************************************************************************************************
const totalRRuns = 300;
const RMult = 0.001;

function initPage1() {
	let inData = $("#drzava").val();
	let data = inData.split(" ");
	let startDate = new Date($("#zacetek").val());
	let endDate = new Date($("#konec").val());
	let okuzeni = parseInt(data[2]);
	let okuzeniKonec = parseInt(data[4]);
	let population = parseInt(data[6]);
	let url = data[5];

	getCovidStats(url, startDate, endDate, function () {
		// Create graphs
		let numDays = APITabelaOkuzeni.length;
		okuzeniKonec = APITabelaOkuzeni[APITabelaOkuzeni.length - 1];
		CreateGraphs(numDays - 1, okuzeniKonec, startDate, endDate);
		// Draw API data on grafOkuzenih
		definedColor = "red";
		drawArrayOnGraph(grafOkuzenih, APITabelaOkuzeni, 0);

		// calculate
		let ret = tryToFit(okuzeni, okuzeniKonec, numDays);

		// output
		console.log("Pop: " + ret[0] + " R: " + ret[1]);
		$("#podnaslov").html(
			"Pop: " + (ret[0] / population).toFixed(4) + " R: " + ret[1].toFixed(2)
		);
	});
}

function tryToFit(okuzeni, okuzeniKonec, numDays, drawDiff = true) {
	let bestPass = NaN;
	let bestPop = NaN;
	let bestR = NaN;

	let pop = okuzeniKonec;
	for (let r = 0; r < totalRRuns; r++) {
		let tmpPassArr = executeSymRun(pop, okuzeni, r * RMult, numDays);

		let diffArr = new Array();
		let diff = calculateFit(APITabelaOkuzeni, tmpPassArr, diffArr);

		if (isNaN(bestPass) || diff < bestPass) {
			bestPass = diff;
			bestPop = pop;
			bestR = r * RMult;

			definedColor = "Green";
			drawArrayOnGraph(grafOkuzenih, tmpPassArr, 1);
			if (drawDiff == true) {
				drawArrayOnGraph(grafKvadRaz, diffArr, 0);
			}
		}
	}

	return [bestPop, bestR];
}

function executeSymRun(iDovzetni, iOkuzeni, iHitrostPrenosa, numDays) {
	// simulationPass++;

	let passArr = new Array();

	init(iDovzetni, iOkuzeni, iHitrostPrenosa);

	while (t < numDays) {
		passArr.push(zanka());
	}

	return passArr;
}

function calculateFit(iBaselineArr, iTmpArr, diffArr) {
	let diff = 0;
	if (iBaselineArr.length > iTmpArr.length) return Number.MAX_VALUE;

	for (let i = 0; i < iTmpArr.length; i++) {
		let pointDiff = Math.abs(iBaselineArr[i] - iTmpArr[i]);
		diff += pointDiff;
		if (diffArr != null) diffArr.push(pointDiff);
	}

	return diff;
}

// ******************************************************************************************************
//											PAGE 2
//******************************************************************************************************

let plat1;
let can1;

let numDays;
let bestR = 0.2;

function initPage2() {
	let inData = $("#drzava").val();
	let data = inData.split(" ");
	let startDate = new Date($("#zacetek").val());
	let endDate = new Date($("#konec").val());
	let okuzeni = parseInt(data[2]);
	let okuzeniKonec = parseInt(data[4]);
	let population = parseInt(data[6]);
	let url = data[5];
	let area = data[7];

	getCovidStats(url, startDate, endDate, function () {
		numDays = APITabelaOkuzeni.length;
		okuzeniKonec = APITabelaOkuzeni[APITabelaOkuzeni.length - 1];

		// Create graphs
		grafOkuzenih = createAndInitGraph(
			"GrafOkuzenih",
			numDays - 1,
			okuzeniKonec,
			"Okuzbe"
		);

		// Draw API data on grafOkuzenih
		definedColor = "red";
		drawArrayOnGraph(grafOkuzenih, APITabelaOkuzeni, 0);

		// calculate
		let ret = tryToFit(okuzeni, okuzeniKonec, numDays, false);

		$(".loader").hide();

		bestR = ret[1];
		$("#podnaslov").html(
			"Ena pika je enaka " +
				(okuzeniKonec / steviloAgentov).toFixed(3) +
				" ljudem in vsak piksel reprezentira " +
				(area / (grafOkuzenih.can1.width * grafOkuzenih.can1.height)).toFixed(
					2
				) +
				"km2"
		);
		startAgentSimulation(okuzeniKonec, Math.ceil(okuzeni / steviloAgentov));
	});
}

function startAgentSimulation(okuzeniKonec, okuzeniZacetek) {
	resetAgentSim();

	globalOkuzeniKonec = okuzeniKonec;

	definedColor = "grey";

	can1 = document.getElementById("cGraphAux");
	plat1 = can1.getContext("2d");

	for (let i = 0; i < steviloAgentov; i++) {
		let tmpAgent = new Agent(
			Math.random() * (can1.width - agentSize),
			Math.random() * (can1.height - agentSize),
			Math.random() * 2 - 1,
			Math.random() * 2 - 1,
			"Green"
		);
		// console.log(tmpAgent);
		agentiTabela.push(tmpAgent);
	}

	for (let i = 0; i < okuzeniZacetek; i++) agentiTabela[i].barva = "Red";
	start();
}