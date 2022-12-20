//barve
let graphColors = ["Red", "Green", "Blue", "Yellow", "Violet", "Pink", "Black", "Orange", "Brown", "Grey"];

//**********
//** GRAF **
//**********
class Graf {
    constructor(idPlatna, maxGrafX, maxGrafY, naslov) {
        // "boilerplate" koda za platno
        this.can1 = document.getElementById(idPlatna); // v html delu poiščemo platno1; spremenljivka can1 sedaj predstavlja platno1
        this.plat1 = this.can1.getContext("2d"); // od tu dalje delamo s spremenljivo plat1 (za izris na platnu iz id "platno1")

        this.plat1.strokeStyle = "#ff0000"; // določimo barvo polnila, hex oblika #RRGGBB

        this.y = new Array(); // ustvarimo novo tabelo y (polje), lahko bi zapisali tudi var y = []; (spremenljivka tipa Array)

        this.maxGrafX = maxGrafX; // maksimum po abscisi
        this.maxGrafY = maxGrafY; // maksimum po ordinati

        this.naslov = naslov;
    }


    //dodajanje vrednosti
    dodajVrednost(vrednost) {
        if (this.y.length >= this.maxGrafX + 1) this.y.splice(0, 1);
        this.y[this.y.length] = vrednost;

        this.refreshGraph();
    }

    refreshGraph() {
        // izris
        // clear graph canvas
        this.plat1.clearRect(0, 0, this.can1.width, this.can1.height);
        this.drawGraph(this.y);
        this.drawLabels();
    }

    drawLabels() {
        // Y axis lable
        this.plat1.fillStyle = "white";
        this.plat1.font = "11px Arial";
        this.plat1.fillText(this.maxGrafY, 5, 10);
        this.plat1.fillText("0", 5, this.can1.height - 5);
        this.plat1.fillText(this.maxGrafX, this.can1.width - 30, this.can1.height - 5);

        // Title
        this.plat1.fillText(this.naslov, 50, 10);
    }

    drawLineTo(x, y) {
        this.plat1.lineTo(
            x / (this.maxGrafX / this.can1.width),
            this.can1.height - y * (this.can1.height / this.maxGrafY)
        );
    }

    drawGraph(graphArr, color = "red") {
        this.plat1.beginPath();

        this.plat1.strokeStyle = color;

        // for all points draw line to them
        for (let i = 0; i < graphArr.length; i++) {
            this.drawLineTo(i, graphArr[i]);
        }

        // end line
        this.plat1.stroke();
    }
}


//več grafov na enem platnu
class MultiGraph extends Graf {
    constructor(idPlatna, maxXPoints, maxYValue, naslov) {
        super(idPlatna, maxXPoints, maxYValue, naslov);
        this.grafCount = -1;
        this.colorArr = [];
    }

    dodajVrednost(vrednost, graphNum = 0) {
        if (this.y[graphNum] == undefined) {
            this.y[graphNum] = new Array();
            this.colorArr.push(defeiniraneBarve);
        }

        if (this.y[graphNum].length >= this.maxGrafX + 1)
            this.y[graphNum].splice(0, 1);
        this.y[graphNum][this.y[graphNum].length] = vrednost;

        this.refreshGraph();
    }

    refreshGraph() {
        // clear graph canvas
        this.plat1.clearRect(0, 0, this.can1.width, this.can1.height);

        let tmpGraph = this;

        this.y.forEach(function (arr, i) {
            tmpGraph.drawGraph(arr, tmpGraph.colorArr[i]);
        });

        this.drawLabels();
    }
}

//**************
//** END GRAF **
//**************