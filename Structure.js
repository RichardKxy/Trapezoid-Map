/// <reference path = "http://www.cnblogs.com/bbvi/p/5104916.html" />
var gameView = document.getElementById("gameView");
var scroll = document.getElementById("d");
var height = 50;//height
var width = 5;//width
var tops = 40;//distance between root and top
var foot = 40;//distance between tree and bottom
var spacing = 30;//distances between tree and two sides
var stagenode = [];

gameView.width = 900;
gameView.height = 480;

function Area(new_T) {
    var xt = [new_T.leftp[0], new_T.top.on_or_not(new_T.leftp)];
    var xb = [new_T.leftp[0], new_T.bottom.on_or_not(new_T.leftp)];
    var yb = [new_T.rightp[0], new_T.bottom.on_or_not(new_T.rightp)];
    var yt = [new_T.rightp[0], new_T.top.on_or_not(new_T.rightp)];
    new_T.area = [xt, xb, yb, yt];
}

//segment structure
function Segment(lp, rp) {
    this.leftend = lp;
    this.rightend = rp;
    this.upperlower = upperlower;
    this.on_or_not = ON;
}

function upperlower(data) {
    var y = (1.0 * this.leftend[1] - this.rightend[1]) / (1.0 * this.leftend[0] - this.rightend[0])
        * (1.0 * data[0] - this.leftend[0]) + this.leftend[1];
    if (y > data[1]) return true;
    else return false;
}

function ON(data) {
    var y = (1.0 * this.leftend[1] - this.rightend[1]) / (1.0 * this.leftend[0] - this.rightend[0])
        * (1.0 * data[0] - this.leftend[0]) + this.leftend[1];
    return y;
}

function intersect(p1,p2,p3,p4) {
    var ip=false;
    var slope1 = (1.0 * p1[1] - p2[1]) / (1.0 * p1[0] - p2[0]);
    var slope2 = (1.0 * p3[1] - p4[1]) / (1.0 * p3[0] - p4[0]);
    var rangey1l, rangey1r, rangey2l, rangey2r;
    var rangex1l, rangex1r, rangex2l, rangex2r;
    var x,y;

    if (Math.abs(slope1)<=2) {
        if (Math.abs(slope1 - slope2) >= 0.02) {
            x = (slope1 * p1[0] - slope2 * p3[0] + p3[1] - p1[1]) / (slope1 - slope2);
            y = slope1 * (x - p1[0]) + p1[1];
        }
        else ip = true;

        if (p1[1] < p2[1]) {
            rangey1l = p1[1];
            rangey1r = p2[1];
        }
        else {
            rangey1r = p1[1];
            rangey1l = p2[1];
        }
        if (p3[1] < p4[1]) {
            rangey2l = p3[1];
            rangey2r = p4[1];
        }
        else {
            rangey2r = p3[1];
            rangey2l = p4[1];
        }

        if (p1[0] < p2[0]) {
            rangex1l = p1[0];
            rangex1r = p2[0];
        }
        else {
            rangex1r = p1[0];
            rangex1l = p2[0];
        }
        if (p3[0] < p4[0]) {
            rangex2l = p3[0];
            rangex2r = p4[0];
        }
        else {
            rangex2r = p3[0];
            rangex2l = p4[0];
        }

        if ((rangex1l <= x && x <= rangex1r) && (rangex2l <= x && x <= rangex2r)
            && (rangey1l <= y && y <= rangey1r) && (rangey2l <= y && y <= rangey2r)) {
            ip = true;
        }
    }
    else
        ip=true;
    return ip;
}

//Trapezoid data structure
function Trapezoid_Node(leftp, rightp, toplseg, bottomlseg, neighbor, depth){
    this.top = toplseg;
    this.bottom = bottomlseg;
    this.leftp = leftp;
    this.rightp = rightp;
    this.rightneighbor = neighbor;
    this.depth = depth;
    this.area = [[0,0],[0,479],[639,479],[639,0]];
}

function Node(data, kind, left, right, depth) {
    this.data = data;
    this.kind = kind;
    this.left = left;
    this.right = right;
    this.depth = depth;
    this.pos = null;
    this.children = null;
}

//binary searching tree
function BST() {
    this.root = new Node( 0, "map", null, null, 1);
    this.maxlevel = 1;
}

//update BST structure
BST.prototype.Update = function (label, Trapezoid, node) {
    var current = this.root;
    while (current != null) {
        if (current.kind[0] == "p" || current.kind[0] == "q"){//locate point
            if (Trapezoid[label].leftp[0] < current.data[0])
                current = current.left;
            else if (Trapezoid[label].leftp[0] >= current.data[0])
                current = current.right;
        }
        else if (current.kind[0] == "s"){//locate segment
            var currentseg = new Segment(current.data[0],current.data[1]);
            var testy, absdis, maxdis=0, ud;
            for (var k=0; k<4; k++) {
                testy = currentseg.on_or_not(Trapezoid[label].area[k]);
                absdis = testy - Trapezoid[label].area[k][1];
                if (Math.abs(absdis) > maxdis) {
                    maxdis = Math.abs(absdis);
                    if (absdis > 0) ud = true;
                    else ud = false;
                }
            }
            if (ud)
                current = current.left;
            else
                current = current.right;
        }
        else if (current.kind == "map" && label == current.data) {//locate area
            current.data = node.data;
            current.kind = node.kind;
            current.left = node.left;
            current.right = node.right;
            break;
        }
    }
}

//get the new added structure
BST.prototype.Structure = function (lp, rp, intersection, Trapezoid, max, count, share) {
    if (intersection.length == 1) {// two points in the same area
        var label = intersection[0];
        var d = Trapezoid[label].depth;
        var seg = new Segment(lp, rp);
        var p1 = new Node(lp, "p"+count, null, null, d);
        var p2 = new Node(rp, "q"+count, null, null, d+1);
        var s1 = new Node([lp, rp], "s"+count, null, null, d+2);
        share["p"+count] = 0;share["q"+count] = 0;share["s"+count] = 0;
        p1.right = p2;
        p2.left = s1;
        p1.left = new Node(max + 4, "map", null, null, d+1);
        s1.left = new Node(max + 1, "map", null, null, d+3);
        s1.right = new Node(max + 2, "map", null, null, d+3);
        p2.right = new Node(max + 3, "map", null, null, d+2);
        this.Update(label, Trapezoid, p1);
        Trapezoid[max + 1] = new Trapezoid_Node(lp, rp, Trapezoid[label].top, seg, [max + 3, max + 3], d+3);
        Trapezoid[max + 2] = new Trapezoid_Node(lp, rp, seg, Trapezoid[label].bottom, [max + 3, max + 3], d+3);
        Trapezoid[max + 3] = new Trapezoid_Node(rp, Trapezoid[label].rightp, Trapezoid[label].top, Trapezoid[label].bottom,
            Trapezoid[label].rightneighbor, d+2);
        Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, lp, Trapezoid[label].top, Trapezoid[label].bottom,
            [max + 1, max + 2], d+1);
        Area(Trapezoid[max + 1]);Area(Trapezoid[max + 2]);Area(Trapezoid[max + 3]);Area(Trapezoid[label]);
        p1.left.data = label;
        share[max+1]=0; share[max+2]=0; share[max+3]=0;
        max = max + 3;
        if (this.maxlevel < d+3) this.maxlevel = d+3;
    }
    else {
        var seg = new Segment(lp, rp);
        var nodeup, nodedown, remain;
        for (var i = 0; i < intersection.length; i++) {
            var label = intersection[i];
            var d = Trapezoid[label].depth;
            if (i==0){ //left endpoint of segment
                var p1 = new Node(lp, "p"+count, null, null, d);
                var s1 = new Node([lp,rp], "s"+count, null, null, d+1);
                if (seg.upperlower(Trapezoid[label].rightp)) {// rightp is above the new segment
                    p1.right = s1;
                    p1.left = new Node(max+3, "map", null, null, d+1);
                    s1.left = new Node(max+1, "map", null, null, d+2);
                    s1.right = new Node(max+2, "map", null, null, d+2);
                    nodedown = s1.right;
                    this.Update(label, Trapezoid, p1);
                    Trapezoid[max+1] = new Trapezoid_Node(lp, Trapezoid[label].rightp, Trapezoid[label].top, seg,
                        Trapezoid[label].rightneighbor, d+2);
                    Trapezoid[max+2] = new Trapezoid_Node(lp, null, seg, Trapezoid[label].bottom, null, d+2);
                    remain = max + 2;
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, lp, Trapezoid[label].top,
                        Trapezoid[label].bottom, [max+1, max+2], d+1);
                    p1.left.data = label;
                    Area(Trapezoid[max+1]);
                }
                else{// rightp is below the new segment
                    p1.right = s1;
                    p1.left = new Node(max+3, "map", null, null, d+1);
                    s1.left = new Node(max+1, "map", null, null, d+2);
                    s1.right = new Node(max+2, "map", null, null, d+2);
                    nodeup = s1.left;
                    this.Update(label, Trapezoid, p1);
                    Trapezoid[max+1] = new Trapezoid_Node(lp, null, Trapezoid[label].top, seg, null, d+2);
                    remain = max + 1;
                    Trapezoid[max+2] = new Trapezoid_Node(lp, Trapezoid[label].rightp, seg, Trapezoid[label].bottom,
                        Trapezoid[label].rightneighbor, d+2);
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, lp, Trapezoid[label].top,
                        Trapezoid[label].bottom, [max+1,max+2], d+1);
                    p1.left.data = label;
                    Area(Trapezoid[max+2]);
                }
                Area(Trapezoid[label]);
                share["p"+count] = 0;share[max+1]=0;share[max+2]=0;
                max = max + 2;
                if (this.maxlevel < d+2) this.maxlevel = d+2;
            }
            else if (i == intersection.length - 1) { //right endpoint of segment
                var p1 = new Node(rp, "q"+count, null, null, d);
                var s1 = new Node([lp, rp], "s"+count, null, null, d+1);
                if (seg.upperlower(Trapezoid[label].leftp)) {// leftp is above the segment
                    p1.left = s1;
                    p1.right = new Node(max + 1, "map", null, null, d+1);
                    s1.left = new Node(max + 2, "map", null, null, d+2);
                    s1.right = nodedown;
                    this.Update(label, Trapezoid, p1);
                    Trapezoid[max + 1] = new Trapezoid_Node(rp, Trapezoid[label].rightp, Trapezoid[label].top,
                        Trapezoid[label].bottom, Trapezoid[label].rightneighbor, d+1);
                    Trapezoid[remain].rightp = rp;
                    Trapezoid[remain].rightneighbor = [max+1,max+1];
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, rp, Trapezoid[label].top,
                        seg, [max + 1, max + 1], d+2);
                    s1.left.data = label;
                }
                else{//leftp is below the segment
                    p1.left = s1;
                    p1.right = new Node(max+1, "map", null, null, d+1);
                    s1.right = new Node(max+2, "map", null, null, d+2);
                    s1.left = nodeup;
                    this.Update(label, Trapezoid, p1);
                    Trapezoid[max+1] = new Trapezoid_Node(rp, Trapezoid[label].rightp, Trapezoid[label].top,
                        Trapezoid[label].bottom, Trapezoid[label].rightneighbor, d+1);
                    Trapezoid[remain].rightp = rp;
                    Trapezoid[remain].rightneighbor = [max+1,max+1];
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, rp, seg, Trapezoid[label].bottom,
                        [max+1, max+1], d+2);
                    s1.right.data = label;
                }
                Area(Trapezoid[max+1]);Area(Trapezoid[remain]);Area(Trapezoid[label]);
                share["q"+count] = 0;share[max+1] = 0;
                max = max + 1;
                if (this.maxlevel < d+2) this.maxlevel = d+2;
            }
            else if (rp[0] > Trapezoid[label].rightp[0]){//no segment points
                var a = seg.upperlower(Trapezoid[label].leftp);
                var b = seg.upperlower(Trapezoid[label].rightp);
                var s1 = new Node([lp,rp], "s"+count, null, null, d);
                if(a && b){// l and r above
                    s1.left = new Node(max+1, "map", null, null, d+1);
                    s1.right = nodedown;
                    this.Update(label, Trapezoid, s1);
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, Trapezoid[label].rightp,
                        Trapezoid[label].top, seg, Trapezoid[label].rightneighbor, d+1);
                    s1.left.data = label;
                    Area(Trapezoid[label]);
                }
                else if (!a && !b){//l and r below
                    s1.right = new Node(max+1, "map", null, null, d+1);
                    s1.left = nodeup;
                    this.Update(label, Trapezoid, s1);
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, Trapezoid[label].rightp,
                        seg, Trapezoid[label].bottom, Trapezoid[label].rightneighbor, d+1);
                    s1.right.data = label;
                    Area(Trapezoid[label]);
                }
                else if (!a && b) {//l below and r above
                    s1.left = nodeup;
                    s1.right = new Node(max+1, "map", null, null, d+1);
                    this.Update(label, Trapezoid, s1);
                    nodedown = s1.right;
                    Trapezoid[remain].rightp = Trapezoid[label].rightp;
                    Trapezoid[remain].rightneighbor = Trapezoid[label].rightneighbor;
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, null, seg, Trapezoid[label].bottom, null, d+1);
                    s1.right.data = label;
                    Area(Trapezoid[remain]);
                    remain = label;
                }
                else if (a && !b) {//l above and r below
                    s1.left = new Node(max+1, "map", null, null, d+1);
                    s1.right = nodedown;
                    this.Update(label, Trapezoid, s1);
                    nodeup = s1.left;
                    Trapezoid[remain].rightp = Trapezoid[label].rightp;
                    Trapezoid[remain].rightneighbor = Trapezoid[label].rightneighbor;
                    Trapezoid[label] = new Trapezoid_Node(Trapezoid[label].leftp, null, Trapezoid[label].top, seg, null, d+1);
                    s1.left.data = label;
                    Area(Trapezoid[remain]);
                    remain = label;
                }
                if (this.maxlevel < d+1) this.maxlevel = d+1;
            }
        }
    }
    return max;
}

//locate left point of the new segment
BST.prototype.locate = function (current, lp, rp, seg) {
    if (current!=null) {
        if (current.kind[0] == "p" || current.kind[0] == "q") {
                for (var i in stagenode) {
                    if (stagenode[i].name == "point" && (stagenode[i].x == current.pos[0]) && (stagenode[i].y == current.pos[1])) {
                        stagenode[i].children[1].color = "#ff0000";
                        stagenode[i].children[0].graphics._fill.style = "#fff";
                        stagenode[i].children[1].name = "white";
                        break;
                    }
                }
                scroll.scrollTo(current.pos[0] - 300, current.pos[1] - 240);
            if (lp[0] < current.data[0])
                current = current.left;
            else
                current = current.right;
        }
        else if (current.kind[0] == "s") {
            var x = new Segment(current.data[0], current.data[1]);
            var y = x.upperlower(lp);
                for (var i in stagenode) {
                    if (stagenode[i].name == "point" && (stagenode[i].x == current.pos[0]) && (stagenode[i].y == current.pos[1])) {
                        stagenode[i].children[1].color = "#ff0000";
                        stagenode[i].children[0].graphics._fill.style = "#fff";
                        stagenode[i].children[1].name = "white";
                        break;
                    }
                }
                scroll.scrollTo(current.pos[0] - 300, current.pos[1] - 240);
            if (y == true)
                current = current.left;
            else
                current = current.right;
        }
        else if (current.kind == "map") {
            var label = current.data;
                for (var i in stagenode) {
                    if (stagenode[i].name == "point" && (stagenode[i].x == current.pos[0]) && (stagenode[i].y == current.pos[1])) {
                        stagenode[i].children[1].color = "#ff0000";
                        stagenode[i].children[0].graphics._fill.style = "#fff";
                        stagenode[i].children[1].name = "white";
                        break;
                    }
                }
                scroll.scrollTo(current.pos[0] - 300, current.pos[1] - 240);
            intersection.push(label);

            while ((rp[0] > Trapezoid[label].rightp[0]) && Trapezoid[label].rightneighbor != null) {//find all intersections

                if (seg.upperlower(Trapezoid[label].rightp))//above segment
                    label = Trapezoid[label].rightneighbor[1];
                else
                    label = Trapezoid[label].rightneighbor[0];
                intersection.push(label);
            }
            current = null;
        }
        stage.update();
    }
    return current;
}

BST.prototype.query = function (current, point) {
    if (current!=null) {
        if (current.kind[0] == "p" || current.kind[0] == "q") {
            for (var i in stagenode) {
                if (stagenode[i].name == "point" && (stagenode[i].x == current.pos[0]) && (stagenode[i].y == current.pos[1])){
                    stagenode[i].children[1].color = "#ff0000";
                    stagenode[i].children[0].graphics._fill.style = "#fff";
                    stagenode[i].children[1].name = "white";
                    route.push(i);
                    break;
                }
            }
            scroll.scrollTo(current.pos[0]-300, current.pos[1]-240);

            if (point[0] < current.data[0])
                current = current.left;
            else
                current = current.right;
        }
        else if (current.kind[0] == "s") {
            var x = new Segment(current.data[0], current.data[1]);
            var y = x.upperlower(point);
            for (var i in stagenode) {
                if (stagenode[i].name == "point" && (stagenode[i].x == current.pos[0]) && (stagenode[i].y == current.pos[1])){
                    stagenode[i].children[1].color = "#ff0000";
                    stagenode[i].children[0].graphics._fill.style = "#fff";
                    stagenode[i].children[1].name = "white";
                    route.push(i);
                    break;
                }
            }
            scroll.scrollTo(current.pos[0]-300, current.pos[1]-240);

            if (y == true)
                current = current.left;
            else
                current = current.right;
        }
        else if (current.kind == "map") {
            for (var i in stagenode) {
                if (stagenode[i].name == "point" && (stagenode[i].x == current.pos[0]) && (stagenode[i].y == current.pos[1])){
                    stagenode[i].children[1].color = "#ff0000";
                    stagenode[i].children[0].graphics._fill.style = "#fff";
                    stagenode[i].children[1].name = "white";
                    route.push(i);
                    break;
                }
            }
            scroll.scrollTo(current.pos[0]-300, current.pos[1]-240);
            current = null;
        }
        stage.update();
    }
    return current;
}

BST.prototype.getChildren = function (node) {
    var current = node;
    var children=[], leftchild, rightchild;
    if (current.kind == "map") {
        children.push(current.data);
        current.children = children;
    }
    if (current.left != null && current.right != null){
        leftchild = this.getChildren(current.left);
        rightchild = this.getChildren(current.right);
        children = leftchild.concat(rightchild);
        children = deleteRepeat(children);
        current.children = children;
    }
    return children;
}

BST.prototype.SetCanvasWidthHeight = function() {
    var level = this.maxlevel;
    var h = height * level + tops + foot;
    if (h > gameView.height) gameView.height = h;
    if (!WorstSignal) {
        var w = Math.pow(2, level + 1) * width + spacing * 2;
        if (w > gameView.width) gameView.width = w;
    }
}

BST.prototype.setpoint = function(share){
    var thisMaxLevel = this.maxlevel;
    var childQuanty = Math.pow(2, thisMaxLevel);
    var c = this.root;
    var point=0;
    var father_pos;
    var child_pos;
    var line;
    var container;
    var w=gameView.width / 2 + width * point;
    stagenode=[];

    if (WorstSignal) {
        childQuanty = 2;
        w=gameView.width / 2 + 20 * point;
    }
    if(c.kind != "map") {
        container = CreateNode(c.kind, w, ((c.depth - 1) * height + parseInt(tops)), "red", c.children);
        stage.addChild(container);
    }
    else{
        container = CreateNode(c.data, w, ((c.depth - 1) * height + parseInt(tops)), "red", c.children);
        stage.addChild(container);
    }
    father_pos = [w, (c.depth-1) * height + parseInt(tops)];
    c.pos = [w, (c.depth-1) * height + parseInt(tops)];
    if (container!=null)
        stagenode.push(container);

    if (c.left != null) {
        child_pos = setPointsLeft(c.left, -1 * childQuanty / 2, thisMaxLevel - 1, share);
        line = CreateLineTo(father_pos[0],father_pos[1],child_pos[0],child_pos[1]);
        stage.addChild(line);
        stagenode.push(line);
    }

    if (c.right != null) {
        child_pos = setPointsRight(c.right, childQuanty / 2, thisMaxLevel - 1, share);
        line = CreateLineTo(father_pos[0],father_pos[1],child_pos[0],child_pos[1]);
        stagenode.push(line);
        stage.addChild(line);
    }
    stage.update();
}

function deleteRepeat(children) {
    var child = {};
    var Children = [];
    for (var i = 0; i < children.length; i++) {
        if (!child[children[i]]) {
            child[children[i]] = children[i];
        }
    }
    for (var k in child) {
        Children.push(child[k]);
    }
    return Children
}

function setPointsLeft(node, point, thisMaxLevel, share) {
    var father_pos;
    var child_pos;
    var line;
    var container;
    var childQuanty;
    var w=gameView.width / 2 + width * point;

    if (WorstSignal) {
        w=gameView.width / 2 + 20 * point;
    }

    if(node.kind != "map") {
        if (share.hasOwnProperty(node.kind)){
            if (share[node.kind] == 0){
                container = CreateNode(node.kind, w, ((node.depth - 1) * height + parseInt(tops)), "red", node.children);
                stage.addChild(container);
                father_pos = [w, (node.depth-1) * height + parseInt(tops)];
                node.pos = [w, (node.depth-1) * height + parseInt(tops)];
                share[node.kind] = father_pos;
            }
            else{
                father_pos = share[node.kind];
            }
        }
        else {
            container = CreateNode(node.kind, w, ((node.depth - 1) * height + parseInt(tops)), "red", node.children);
            stage.addChild(container);
            father_pos = [w, (node.depth-1) * height + parseInt(tops)];
            node.pos = [w, (node.depth-1) * height + parseInt(tops)];
        }
    }
    else {
        if (share.hasOwnProperty(node.data)){
            if (share[node.data] == 0){
                container = CreateNode(node.data, w, ((node.depth - 1) * height + parseInt(tops)), "red", node.children);
                stage.addChild(container);
                father_pos = [w, (node.depth-1) * height + parseInt(tops)];
                node.pos = [w, (node.depth-1) * height + parseInt(tops)];
                share[node.data] = father_pos;
            }
            else{
                father_pos = share[node.data];
            }
        }
        else {
            container = CreateNode(node.data, w, ((node.depth - 1) * height + parseInt(tops)), "red", node.children);
            stage.addChild(container);
            father_pos = [w, (node.depth-1) * height + parseInt(tops)];
            node.pos = [w, (node.depth-1) * height + parseInt(tops)];
        }
    }
    if (container!=null)
        stagenode.push(container);

    if (node.left != null) {
        if (WorstSignal) childQuanty = point-1;
        else
            childQuanty = point - Math.pow(2, thisMaxLevel - node.depth + 1);
        child_pos = setPointsLeft(node.left, childQuanty, thisMaxLevel, share);
        line = CreateLineTo(father_pos[0],father_pos[1],child_pos[0],child_pos[1]);
        stage.addChild(line);
        stagenode.push(line);
    }

    if (node.right != null) {
        if (WorstSignal) childQuanty = point+1;
        else
            childQuanty = point + Math.pow(2, thisMaxLevel - node.depth + 1);
        child_pos = setPointsLeft(node.right, childQuanty, thisMaxLevel, share);
        line = CreateLineTo(father_pos[0],father_pos[1],child_pos[0],child_pos[1]);
        stage.addChild(line);
        stagenode.push(line);
    }
    return father_pos;
}

function setPointsRight(node, point, thisMaxLevel, share) {
    var father_pos;
    var child_pos;
    var line;
    var container;
    var childQuanty;
    var w=gameView.width / 2 + width * point;

    if (WorstSignal) {
        w=gameView.width / 2 + 20 * point;
    }

    if(node.kind != "map") {
        if (share.hasOwnProperty(node.kind)){
            if (share[node.kind] == 0){
                container = CreateNode(node.kind, w, ((node.depth - 1) * height + parseInt(tops)), "red", node.children);
                stage.addChild(container);
                father_pos = [w, (node.depth-1) * height + parseInt(tops)];
                node.pos = [w, (node.depth-1) * height + parseInt(tops)];
                share[node.kind] = father_pos;
            }
            else{
                father_pos = share[node.kind];
            }
        }
        else {
            container = CreateNode(node.kind, w, ((node.depth - 1) * height + parseInt(tops)), "red", node.children);
            stage.addChild(container);
            father_pos = [w, (node.depth-1) * height + parseInt(tops)];
            node.pos = [w, (node.depth-1) * height + parseInt(tops)];
        }
    }
    else {
        if (share.hasOwnProperty(node.data)){
            if (share[node.data] == 0){
                container = CreateNode(node.data, w, (node.depth - 1) * height + parseInt(tops), "red", node.children);
                stage.addChild(container);
                father_pos = [w, (node.depth-1) * height + parseInt(tops)];
                node.pos = [w, (node.depth-1) * height + parseInt(tops)];
                share[node.data] = father_pos;
            }
            else{
                father_pos = share[node.data];
            }
        }
        else {
            container = CreateNode(node.data, w, (node.depth - 1) * height + parseInt(tops), "red", node.children);
            stage.addChild(container);
            father_pos = [w, (node.depth-1) * height + parseInt(tops)];
            node.pos = [w, (node.depth-1) * height + parseInt(tops)];
        }
    }
    if (container!=null)
        stagenode.push(container);

    if (node.left != null) {
        if (WorstSignal) childQuanty = point-1;
        else
            childQuanty = point - Math.pow(2, thisMaxLevel - node.depth + 1);

        child_pos = setPointsRight(node.left, childQuanty, thisMaxLevel, share);
        line = CreateLineTo(father_pos[0],father_pos[1],child_pos[0],child_pos[1]);
        stage.addChild(line);
        stagenode.push(line);
    }

    if (node.right != null) {
        if (WorstSignal) childQuanty = point+1;
        else
            childQuanty = point + Math.pow(2, thisMaxLevel - node.depth + 1);

        child_pos = setPointsRight(node.right, childQuanty, thisMaxLevel, share);
        line = CreateLineTo(father_pos[0],father_pos[1],child_pos[0],child_pos[1]);
        stage.addChild(line);
        stagenode.push(line);
    }
    return father_pos;
}

//color=gray red yellow blue  black
function CreateNode(value, x, y, color, children) {
    var textX = 0;
    if (typeof value == "number") {
        if (value <10) textX = -5;
        else textX = -9;
    }
    else if (typeof value == "string"){
        if (value.length == 2) textX = -9;
        else textX = -14;
    }
    if (color == "red") {
        var text = new createjs.Text(value, "16px Arial", "#ffffff");
    }
    else
        var text = new createjs.Text(value, "16px Arial", "#ff0000");
    text.name = color;
    text.x = textX;
    text.y = -8;

    var graphics = new createjs.Graphics();
    graphics.setStrokeStyle(1);
    graphics.beginStroke(createjs.Graphics.getRGB(0, 0, 255));
    graphics.beginFill(color);

    graphics.drawCircle(0, 0, 15);
    var shape = new createjs.Shape(graphics);
    shape.name = children;

    var container = new createjs.Container();
    container.x = x;
    container.y = y;
    container.name = "point";
    container.addChild(shape, text);

    stage.enableMouseOver();
    container.addEventListener("mouseover", function() {
        if (container.children[1].name == "red" && !signal) {
            container.children[1].color = "#ff0000";
            container.children[0].graphics._fill.style = "#fff";
            ClearCanvas();
            for (var i in container.children[0].name){
                DrawTrapezoid(Trapezoid[container.children[0].name[i]].area);
            }
            Dashline(Trapezoid, max);
            stage.update();
        }
    });
    container.addEventListener("mouseout", function() {
        if (container.children[1].name == "red" && !signal) {
            container.children[1].color = "#fff";
            container.children[0].graphics._fill.style = "#ff0000";
            ClearCanvas();
            Dashline(Trapezoid, max);
            stage.update();
        }
    });
    return container;
}

function CreateLineTo(fatherNodex, fatherNodey, childrenNodex, childrenNodey) {
    var sp = new createjs.Shape();
    sp.name = "line";
    sp.graphics.s("blue").ss(2).mt(fatherNodex, fatherNodey + 15).lt(childrenNodex, childrenNodey - 15).es();//draw line
    return sp;
}