var agentiTabela = []; // spremenljivka s tabelo ("Array") agentov (polje agentov)
var steviloAgentov = 100; // določimo število agentov

var cas = 0; // spremenljivka za spremljanje koraka simulacije
var stevecRdecih = 0; // števec rdečih agentov
var stevecZelenih = 0; // števec zelenih agentov
var steviloTrkovVKoraku = 0;
var steviloTrkovRdecegaZzelenimVkoraku = 0;

var aktiven; //kontrola izvedbe zanke start/stop
var stikaloKoracniZagon = 0;
var gumbStartPritisnjen = 0; // onememogočimo večkratni zagon casovnika
var stopCas = 2000; //prekinitveni cas

class Agent {

    constructor(x, y, xVel, yVel, barva) { // konstruktorska funkcija (ustvari agenta, t.j. poda pozicijo x, y ter hitrosti xVel, yVel)

        this.x = x; // spremenjivka za x koordinato
        this.y = y; // spremenljivka za y koordinato
        this.xVel = xVel; // sprememba x koordinate (dx - diferenca x-a)
        this.yVel = yVel; // sprememba y koordinate (dy - diferenca y-a)
        this.barva = barva; // določimo barvo agenta
        this.trk = 0;
    }

    osvezi() {

        this.x = this.x + this.xVel;
        this.y = this.y + this.yVel;

        if (this.x > can1.width - 10 || this.x < 0) { // če smo na desni ali levi strani na robu platna
            this.xVel = -this.xVel; // obrnemo smer
        }

        if (this.y > can1.height - 10 || this.y < 0) { // če smo na spodnjem ali zgornjem delu platna
            this.yVel = -this.yVel; // obrnemo smer, če pridemo do konca robu platna zg. ali sp.
        }

        // če je x manjši od 0 ga postavimo na 0 (da se agent ne potopi v steno)
        if (this.x < 0) { this.x = 0 };

        // če je y manjši od 0 ga postavimo na 0 (da se agent ne potopi v steno)
        if (this.y < 0) { this.y = 0 };

        // podobno na drugem koncu platna, če je koordinata večja od širine oz. višine
        if (this.x > can1.width - 10) {
            this.x = can1.width - 10
        }; // 10 je širina agenta

        if (this.y > can1.height - 10) {
            this.y = can1.height - 10
        }; // 10 je širina agenta
    }
}

// funkcija, ki preveri bližino agentov
// določimo razdaljo med agenti
// preverimo razdaljo vsakega agenta z vsakim agentom
// v primeru, da sta agenta blizu, glede na podano razdaljo trka, izvedemo trk
function preveriBllizinoAgentov() {

    agentiTabela.forEach(function (agent) {
        agent.trk = 0;
    })
    steviloTrkovVKoraku = 0; //ob vsakem ga ponastavimo
    steviloTrkovRdecegaZzelenimVkoraku = 0;

    for (var i = 0; i < steviloAgentov; i++) {

        var A = agentiTabela[i]; // uvedemo novo spremenljivko zaradi berljivosti kode

        for (var j = i + 1; j < steviloAgentov; j++) {
            var B = agentiTabela[j];

            // izračunamo razlike koordinat
            var dx = B.x - A.x;
            var dy = B.y - A.y;
            var dist = Math.sqrt(dx * dx + dy * dy); // določimo razdaljo po Pitagorovem izreku

            // če je razlika v razdalji med agentoma manjša od 10 izvedemo trk
            if (dist < 10) { // če je pogoj, da sta agenta dovolj blizu izpolnjen
                A.trk = 1;
                B.trk = 1;
                steviloTrkovVKoraku++; //povečamo števec za 1
                izvediTrk(i, j); // izvedemo trk med agentoma z indeksoma i in j
            }
        }
    }

    return steviloTrkovVKoraku;
}

// funkcija, ki izvede trk med agentoma z indeksoma i in j

function izvediTrk(indeksPrvega, indeksDrugega) {

    var x1 = agentiTabela[indeksPrvega].x; // uvedemo novo spr. zaradi boljše berljivosti kode
    var y1 = agentiTabela[indeksPrvega].y;
    var x2 = agentiTabela[indeksDrugega].x;
    var y2 = agentiTabela[indeksDrugega].y;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);

    var razdaljaOdboja = 6; // spr., ki določa za koliko se agenta ob trku odbijeta oz. razmakneta

    // izračunamo normalizirano razdaljo
    var normX = dx / dist;
    var normY = dy / dist;

    // določimo sredinsko točko
    var sredinskaTočkaX = (x1 + x2) / 2;
    var sredinskaTočkaY = (y1 + y2) / 2;

    // določimo nove pozicije
    agentiTabela[indeksPrvega].x = sredinskaTočkaX - normX * razdaljaOdboja;
    agentiTabela[indeksPrvega].y = sredinskaTočkaY - normY * razdaljaOdboja;
    agentiTabela[indeksDrugega].x = sredinskaTočkaX + normX * razdaljaOdboja;
    agentiTabela[indeksDrugega].y = sredinskaTočkaY + normY * razdaljaOdboja;

    // izmenjamo hitrosti
    var tempX = agentiTabela[indeksPrvega].xVel;
    var tempY = agentiTabela[indeksPrvega].yVel;
    agentiTabela[indeksPrvega].xVel = agentiTabela[indeksDrugega].xVel;
    agentiTabela[indeksPrvega].yVel = agentiTabela[indeksDrugega].yVel;
    agentiTabela[indeksDrugega].xVel = tempX;
    agentiTabela[indeksDrugega].yVel = tempY;

    // če trčita rdeči in zeleni, zeleni postane rdeč
    // če je prvi rdeč ("#ff0000") in drugi zelen ("#00ff00")
    if (agentiTabela[indeksPrvega].barva == "#ff0000" && agentiTabela[indeksDrugega].barva == "#00ff00") {
        agentiTabela[indeksDrugega].barva = "#ff0000"; // drugega agenta, ki je bil zelen pobarvamo rdeče
        steviloTrkovRdecegaZzelenimVkoraku++;
    }

    // če je prvi zelen ("#00ff00") in drugi rdeč ("#ff0000")
    if (agentiTabela[indeksPrvega].barva == "#00ff00" && agentiTabela[indeksDrugega].barva == "#ff0000") {
        agentiTabela[indeksPrvega].barva = "#ff0000"; // prvega agenta, ki je bil zelen pobarvamo rdeče
        steviloTrkovRdecegaZzelenimVkoraku++;
    }
}

function izrisiAgente(agenti) {
    agenti.forEach(function (agent) {
        if (agent.barva == "#ff0000") {
            stevecRdecih++;
        }

        if (agent.barva == "#00ff00") {
            stevecZelenih++;
        }

        plat1.fillStyle = agent.barva; // določimo barvo izrisa glede na lastnost agenta
        plat1.fillRect(agent.x, agent.y, 10, 10); // x zg. L kot, y zg. L kot, širina, višina

        if (agent.trk == 1) {
            plat1.beginPath();
            plat1.lineWidth = "3";
            plat1.strokeStyle = "blue";
            plat1.rect(agent.x, agent.y, 10, 10);
            plat1.stroke();
        }
    });
}

function Agentzanka() {
    plat1.clearRect(0, 0, can1.width, can1.height); // brišemo celotno platno

    // števca rdečih in zelenih postavimo na 0
    stevecRdecih = 0;
    stevecZelenih = 0;

    //izpišemo število trkov
    var steviloTrkov = preveriBllizinoAgentov();
    document.getElementById("stevilo-Trkov").value = steviloTrkov;

    for (var i = 0; i < steviloAgentov; i++) {
        agentiTabela[i].osveži(); // imamo več agentov (z indeksom i)
    }

    izrisiAgente(agentiTabela); //izrišemo agente

    cas++; // cas ob vsakem klicu funkcije zanka za ena povečamo

    document.getElementById("polje-s-casom").value = cas;
    document.getElementById("število-rdečih").value = stevecRdecih;
    document.getElementById("število-zelenih").value = stevecZelenih;

    //če smo v modusu koračne izvedbe
    if (stikaloKoracniZagon == 1) {
        clearTimeout(aktiven);
    }
}

for (var i = 0; i < steviloAgentov; i++) {
    // v tabelo agentov vpišemo agente z naključnimi koordinatami
    // ter hitrostmi med -1 in +1
    // agenti imajo pri kreiranju zeleno barvo
    agentiTabela[i] = new Agent(Math.random() * (can1.width - 10), Math.random() * (can1.height - 10), 1 * Math.random() - 0.5, 1 * Math.random() - 0.5, "#00ff00");

}

agentiTabela[0].barva = "#ff0000"; // prvemu agentu v tabeli agentov določimo rdečo barvo

//funkcija, ki preverja ali je bil gumb start že pritisnjen
//če je bil že pritisnjen preprečimo ponoven zagon casovnika
function startGumb() {
    stopCas = document.getElementById("stop-cas").value; //prebermo iz vmesnika
    if (gumbStartPritisnjen == 0) { //gumb za start še ni bil pritisnjen
        gumbStartPritisnjen == 1;
        start();
    }
}

//funkcija za zagon modela
function start() {
    if (cas >= stopCas) {
        stikaloKoracniZagon = 1;
        clearTimeout(aktiven);
    }
    else {
        Agentzanka(); // klic funkcije zanka
        aktiven = setTimeout(start, 4); // po casu 40 ms se izvede funkcija zanka, casovnik je v spremenljivki aktiven
    }
}