var Canvas=document.getElementById("myCanvas");
var gameView = document.getElementById("gameView");
var scroll = document.getElementById("d");
var Location = document.getElementById('Location');
var Update = document.getElementById('Update');
var Refresh = document.getElementById('Refresh');
var Mode = document.getElementById('Mode');
var Query = document.getElementById('Query');
var Random = document.getElementById('Random');
var Worstcase = document.getElementById('Worstcase');
document.getElementById("Query").disabled=true;
var stage = new createjs.Stage(gameView);
var inputstage = new createjs.Stage(Canvas);
createjs.Touch.enable(inputstage);

var state = true;
var max = 0;//the total number of the partition area
var count = 0;//the number of segments
var min = 10;
var max_x = 630;
var max_y = 470;
var P, Q, R;
var queryp;
var current;
var seg;
var signal;
var WorstSignal = false;
var RandomSignal = false;
var list=[];//the coordinate of all segments
var intersection=[];//the area that new segment intersects
var disabled = false;
var points = [];
var lines = [];
var labels = [];
var route = [];
var dashlines = [];
var worstcase = [[150,340],[500,340],[248,266],[424,266],[308,207],[362,207]];

function ClearCanvas() {
    inputstage.removeAllChildren();
    inputstage.update();
}

function Point(e, flag) {
    var point;
    if (!WorstSignal && !RandomSignal) {
        point = Array(e.clientX - Canvas.offsetLeft, e.clientY - Canvas.offsetTop);
    }
    else
        point = e;
    var obj = new createjs.Shape();
    var graphics = obj.graphics;
    graphics.beginFill("red");
    graphics.drawCircle(point[0],point[1],2);
    inputstage.addChild(obj);
    inputstage.update();
    flag = typeof(flag) == 'undefined' ? true : flag;
    if (flag) {
        points.push(obj);
    }
    else {
        queryp = obj;
    }
    return point;
}

function Line(P, Q) {
    var obj = new createjs.Shape();
    var graphics = obj.graphics;

    graphics.beginStroke("black");
    graphics.setStrokeStyle(2);
    graphics.moveTo(P[0],P[1]);
    graphics.lineTo(Q[0],Q[1]);
    inputstage.addChild(obj);
    inputstage.update();
    lines.push(obj);
}

function Label(label) {
    var text = new createjs.Text(label, "16px Arial", "blue");
    // four corner points
    var area = Trapezoid[label].area;
    text.x = (Trapezoid[label].leftp[0] + Trapezoid[label].rightp[0]) / 2 - 7;
    text.y = (area[0][1]+area[1][1]+area[2][1]+area[3][1]) / 4;

    inputstage.addChild(text);
    inputstage.update();
    labels.push(text);
}

function Dashline() {
    for (var i = 0; i < max +1; i++){
        Label(i);
        var area = Trapezoid[i].area;
        if (area[0][0] != 0) {
            var linel = new createjs.Shape();
            linel.graphics.setStrokeDash([2, 2], 0).setStrokeStyle(1).beginStroke('grey').moveTo(area[0][0], area[0][1]).lineTo(area[1][0], area[1][1]);
            inputstage.addChild(linel);
            dashlines.push(linel);
        }
        if (area[2][0] != 639) {
            var liner = new createjs.Shape();
            liner.graphics.setStrokeDash([2, 2], 0).setStrokeStyle(1).beginStroke('grey').moveTo(area[2][0], area[2][1]).lineTo(area[3][0], area[3][1]);
            inputstage.addChild(liner);
            dashlines.push(liner);
        }
    }
    for (var i = 0; i < points.length; i++) {
        inputstage.addChild(points[i]);
    }
    for (var i = 0; i < lines.length; i++) {
        inputstage.addChild(lines[i]);
    }
    inputstage.update();
}

function DrawTrapezoid(area) {
    var obj = new createjs.Shape();
    var graphics = obj.graphics;

    graphics.beginFill('#fff893');
    graphics.moveTo(area[0][0],area[0][1]);
    graphics.lineTo(area[1][0],area[1][1]);
    graphics.lineTo(area[2][0],area[2][1]);
    graphics.lineTo(area[3][0],area[3][1]);
    graphics.lineTo(area[0][0],area[0][1]);
    inputstage.addChild(obj);
}

var topseg = new Segment([0, 0], [639, 0]);
var bottomseg = new Segment([0, 479], [639, 479]);
var map = new Trapezoid_Node([0, 0], [639, 0], topseg, bottomseg, null, 1);
var Trapezoid = {0: map};
var Data_structure = new BST();
var share = {0: 0};
Data_structure.root.children = [0];
Data_structure.setpoint(share);
scroll.scrollTo(gameView.width/2-300, gameView.height/2-240);
Label(0);

window.onload = function() {
    Canvas.onmousedown = function (e) {
        e = e || event;
        if (!WorstSignal) {
            if (!disabled) {
                if (state) {//left point
                    P = Point(e);
                    state = false;
                }
                else {//right point
                    Q = Point(e);
                    if (P[0] > Q[0]) {
                        var tmp = Q;
                        Q = P;
                        P = tmp;
                    }
                    Line(P, Q);
                    state = true;
                    current = Data_structure.root;
                    seg = new Segment(P, Q);
                    count++;
                }
            }
            else {
                R = Point(e, false);
                current = Data_structure.root;
            }
        }
    }
};

Location.addEventListener('click', function() {//locate left point of the new segment
    if (current!=null) {
        signal = true;
        var child = [];
        child = child.concat(current.children);
        ClearCanvas();
        var i = 0;
        while (child[i] != null) {
            DrawTrapezoid(Trapezoid[child[i]].area);
            i++;
        }
        Dashline(Trapezoid, max);
        current = Data_structure.locate(current, P, Q, seg);
    }
},false);

Update.addEventListener('click', function() {//get the new structure
    if (current==null){
        ClearCanvas();
        max = Data_structure.Structure(P, Q, intersection, Trapezoid, max, count, share);
        stage.removeAllChildren();
        inputstage.removeAllChildren();
        Data_structure.SetCanvasWidthHeight();
        Data_structure.getChildren(Data_structure.root);
        Data_structure.setpoint(share);
        Dashline(Trapezoid, max);
        intersection = [];
        for (var key in share){
            share[key] = 0;
        }
        signal = false;
    }
},false);

Refresh.addEventListener('click', function () {//refresh
    ClearCanvas();
    gameView.width = 900;
    gameView.height = 480;
    stage.removeAllChildren();
    inputstage.removeAllChildren();
    map = new Trapezoid_Node([0, 0], [639, 0], topseg, bottomseg, null, 1);
    Trapezoid = {0: map};
    Data_structure = new BST();
    share = {0: 0};
    Data_structure.root.children = [0];
    Data_structure.setpoint(share);
    scroll.scrollTo(gameView.width/2-300, gameView.height/2-240);
    Label(0);
    state = true;disabled = false; WorstSignal = false;
    max = 0;
    count = 0;
    list=[];intersection=[];points = [];lines = [];labels = [];dashlines = [];stagenode=[];
    document.getElementById("Location").disabled=false;
    document.getElementById("Update").disabled=false;
    document.getElementById("Query").disabled=true;
    document.getElementById("Random").disabled=false;
    document.getElementById("Worstcase").disabled=false;
    document.getElementById("Mode").value="Mode:Build";
},false);

Mode.addEventListener('click', function () {
    if (!disabled){
        document.getElementById("Location").disabled=true;
        document.getElementById("Update").disabled=true;
        document.getElementById("Query").disabled=false;
        document.getElementById("Random").disabled=true;
        document.getElementById("Worstcase").disabled=true;
        disabled = true;
        signal = true;
        document.getElementById("Mode").value="Mode:Query";
        inputstage.removeAllChildren();
        Dashline(Trapezoid, max);
    }
    else {
        document.getElementById("Location").disabled=false;
        document.getElementById("Update").disabled=false;
        document.getElementById("Query").disabled=true;
        document.getElementById("Random").disabled=false;
        document.getElementById("Worstcase").disabled=false;
        disabled = false;
        signal = false;
        document.getElementById("Mode").value="Mode:Build";
        inputstage.removeAllChildren();
        Dashline(Trapezoid, max);

        var i = 0;
        for (var key in stagenode){
            if (i < route.length && key == route[i]) {
                stagenode[key].children[1].color = "#fff";
                stagenode[key].children[0].graphics._fill.style = "#ff0000";
                stagenode[key].children[1].name = "red";
                i++;
            }
        }
        route=[];
        stage.update();
    }
},false);

Query.addEventListener('click', function() {
    if (current == null) {
        inputstage.removeAllChildren();
        Dashline(Trapezoid, max);

        var i = 0;
        for (var key in stagenode){
            if (i < route.length && key == route[i]) {
                stagenode[key].children[1].color = "#fff";
                stagenode[key].children[0].graphics._fill.style = "#ff0000";
                stagenode[key].children[1].name = "red";
                i++;
            }
        }
        route = [];
        stage.update();
    }
    else {
        var child = [];
        child = child.concat(current.children);
        ClearCanvas();
        var i = 0;
        while (child[i] != null) {
            DrawTrapezoid(Trapezoid[child[i]].area);
            i++;
        }
        inputstage.addChild(queryp);
        Dashline(Trapezoid, max);
        current = Data_structure.query(current, R);
    }
},false);

Random.addEventListener('click', function() {
    RandomSignal = true;
    var ip;
    var x1, y1, x2, y2;
    var slope;
    var randompoint = [];
    Refresh.click();
    for (var i = 0; i < 4; i++) {
        ip = false;
        x1 = 0;y1 = 0;
        x2 = 0;y2 = 0;
        slope = 5;
        y1 = Math.floor(parseInt(Math.random() * (max_y - min + 1) + min, 10));
        y2 = Math.floor(parseInt(Math.random() * (max_y - min + 1) + min, 10));
        while (Math.abs(x1 - x2) <= 20 || Math.abs(slope) > 2) {
            x1 = Math.floor(parseInt(Math.random() * (max_x - min + 1) + min, 10));
            x2 = Math.floor(parseInt(Math.random() * (max_x - min + 1) + min, 10));
            if (x1!=x2)
                slope = (1.0 * y1 - y2) / (1.0 * x1 - x2);
        }

        if (i == 0) {
            randompoint.push([x1, y1]);
            randompoint.push([x2, y2]);
        }
        else {
            var j = 0;
            while (!ip && j < randompoint.length) {
                ip = intersect(randompoint[j],randompoint[j+1],[x1,y1],[x2,y2]);
                j+=2;
                if (ip == true) {
                    i--;
                    break;
                }
            }
            if (ip == false) {
                randompoint.push([x1, y1]);
                randompoint.push([x2, y2]);
            }
        }
    }

    for (var k=0; k<8; k+=2) {
        P = Point(randompoint[k]);
        Q = Point(randompoint[k+1]);
        if (P[0] > Q[0]) {
            var tmp = Q;
            Q = P;
            P = tmp;
        }
        Line(P,Q);
        current = Data_structure.root;
        seg = new Segment(P, Q);
        count++;
        while (current!=null)
            Location.click();
        Update.click();
    }
    scroll.scrollTo(Data_structure.root.pos[0]-300, 0);
    RandomSignal = false;
},false);

Worstcase.addEventListener('click', function() {
    Refresh.click();
    WorstSignal = true;

    for (var i = 0; i < worstcase.length; i += 2) {
        P = Point(worstcase[i]);
        Q = Point(worstcase[i+1]);
        Line(P, Q);

        current = Data_structure.root;
        seg = new Segment(P, Q);
        count++;
        while (current!=null)
            Location.click();
        Update.click();
    }
    scroll.scrollTo(gameView.width/2, 0);
},false);