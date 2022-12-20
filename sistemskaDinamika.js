//Sistemska dinamika
class Stanje {
    //razred Stanje
    constructor() {
        this.vrednost = 0; //koliko tekočine je v posodi, vrednsot stanj
        tabelaStanj.push(this);
    }
    funkcijaZenačboPritokovInOdtokov() { }

    preračunajVrednostObNaslednjemKoraku() {
        //Eulerjeva diskretna numerična integracijska metoda za določitev vrednosti ob naslednjjem časovnem koraku
        this.vrednost += dt * this.funkcijaZenačboPritokovInOdtokov();
    }
}

class Pretok {
    //razred za odtoke in pritoke
    constructor() {
        this.vrednost = 0; //koliko tekočine je v posodi, vrednsot stanj
        tabelaPretokov.push(this);
    }
    enacbaPretoka() { } //tu napovemo, da bomo zapisali funkcijo, ki opredeli od česa je pretok odvisen

    preracunajVrednost() {
        this.vrednost = this.enacbaPretoka(); //vrednost pretoka določimo glede na podano enačbo pretoka
    }
}
class PomoznaSpremenljivka {
    //razred za pomožne spremenljivke
    constructor() {
        this.vrednost = 0; //koliko pomožne spremenljivke
        tabelaPomoznihSpremenljivk.push(this);
    }
    enacbaPomozneSpremenljivke() { } //tu napovemo, da bomo zapisali funkcijo

    preracunajVrednost() {
        this.vrednost = this.enacbaPomozneSpremenljivke(); //vrednost pomone spremenljivke določimo glede na podano enačbo pretoka
    }
}

//***********************************************************************************************************************************************************
//Definicija modela - ZAČETEK
//***********************************************************************************************************************************************************
//vrstni red spremenljivk je pomemben, preračuni v tabeli morajo biti po vrsti, da jih lahko ob naslednjem koraku pravilno preračunamo
//Na začetku so inicializirana le stanja in tako lahko določimo le tiste spremenljivke, ki so vezane na stanja
//Zaporedje preraćuna je določeno s stanji, preračun pričnemo z elementi, ki so vezani na stanja

var tabelaStanj = new Array(); //tabela s stanji
var tabelaPretokov = new Array();
var tabelaPomoznihSpremenljivk = new Array();

var k = 0; // diskretni korak preračuna
var t = 0; // v primeru, da je časovni korak dt = 1 enak k, sicer pa je odvisen od dt; če je dt = 0.5 je t = 0, 0.5, 1, 1.5,..
var dt = 1; // časovni korak

var intenzivnostKontaktov = 1;

var aktiven;
var gumbStartPritisnjen = 0;
var iniciZastavica = 0; //ali smo model že inicializirali

var stevecSimTekov = 1;

var tabelaVrednosti;

var dovzetni = new Stanje(); // stanje, ki predtavlja število dovzetnih
var okuzeni = new Stanje(); // stanje, ki predtavlja število okuženih

var N = new Pretok(); //pretok od ovzetnih k okuženim [človek/dan]

var vsotaDovzetnihInOkuzenih = new PomoznaSpremenljivka(); //pomožna spremenljivka za vsoto dovzetnih in okuženih
var koncentracijaDovzetnihZaOkuzbo = new PomoznaSpremenljivka(); //pomožna spremenljivka za koncentracijo dovzetnih

//pomožna spremenljivka ~ v tem delu zapišemo defenicijo za pomožne spremenljivke
vsotaDovzetnihInOkuzenih.enacbaPomozneSpremenljivke = function () {
    return dovzetni.vrednost + okuzeni.vrednost;
};
koncentracijaDovzetnihZaOkuzbo.enacbaPomozneSpremenljivke = function () {
    return dovzetni.vrednost / vsotaDovzetnihInOkuzenih.vrednost;
};

//v tem delu zapipšemo definicije pretokov(pritokov in odtokov)
N.enacbaPretoka = function () {
    return (
        okuzeni.vrednost *
        intenzivnostKontaktov *
        koncentracijaDovzetnihZaOkuzbo.vrednost
    );
};

//v tem delu zapišemo definicije stanj
dovzetni.funkcijaZenačboPritokovInOdtokov = function () {
    return -N.vrednost;
};
okuzeni.funkcijaZenačboPritokovInOdtokov = function () {
    return N.vrednost;
};

//***********************************************************************************************************************************************************
//Definicija modela - KONEC
//***********************************************************************************************************************************************************


//***********************************************************************************************************************************************************
//Inicializacija modela - ZAČETEK
//***********************************************************************************************************************************************************

function init(iDovzetni, iOkuzeni, hitrosPrenosa) {
    t = 0;
    k = 0;

    intenzivnostKontaktov = hitrosPrenosa;

    dovzetni.vrednost = iDovzetni;
    okuzeni.vrednost = iOkuzeni;

    defeiniraneBarve = graphColors[stevecSimTekov % graphColors.length];

    for (var i = 0; i < tabelaPomoznihSpremenljivk.length; i++) {
        //gremo po tabeli pretokokv - uporabimo zanko
        tabelaPomoznihSpremenljivk[i].preracunajVrednost();
    }
    for (var i = 0; i < tabelaPretokov.length; i++) {
        //gremo po tabeli pretokokv - uporabimo zanko
        tabelaPretokov[i].preracunajVrednost();
    }
}

function zanka() {
    t = t + dt; //čas povečamo za dt
    k++;

    for (var i = 0; i < tabelaStanj.length; i++) {
        tabelaStanj[i].preračunajVrednostObNaslednjemKoraku();
    }

    for (var i = 0; i < tabelaPomoznihSpremenljivk.length; i++) {
        //gremo po tabeli pretokokv - uporabimo zanko
        tabelaPomoznihSpremenljivk[i].preracunajVrednost();
    }

    for (var i = 0; i < tabelaPretokov.length; i++) {
        tabelaPretokov[i].preracunajVrednost();
    }

    return okuzeni.vrednost;
}

//***********************************************************************************************************************************************************
//Inicializacija modela - KONEC
//***********************************************************************************************************************************************************