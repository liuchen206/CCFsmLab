// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        debug: true,
        inputAllowed: true,
        bezierCtrlToCenter:90,
        dropToMix:cc.Node,
        fillColor:cc.Color,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    onDestroy () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    onKeyDown: function (event) {
        if(this.inputAllowed === false){
            return;
        }
        var stepLength = 5;
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                // console.log('Press a key');
                this.node.x -= stepLength;
                break;
            case cc.macro.KEY.d:
                // console.log('Press d key');
                this.node.x += stepLength;
                break;
            case cc.macro.KEY.w:
                // console.log('Press w key');
                this.node.y += stepLength;
                break;
            case cc.macro.KEY.s:
                // console.log('Press s key');
                this.node.y -= stepLength;
                break;
        }
    },
    start () {
        this.graphics = this.getComponent(cc.Graphics);

        this.nodes = [];
        this.color = { r: 0, g: 0, b: 0, a: 255 };

        this.createBezierNodes();

        // this.nodes[0].x -= 120;
        var shortestRadius = 99999;
        for(var N = 0; N < this.nodes.length; N++) {
            var currentIndex = this.nodes[N];
            var nextIndex = N + 1 > this.nodes.length - 1 ? this.nodes[N - this.nodes.length + 1] : this.nodes[N + 1]; //如果n+1超过了数组长度取数组下标0的node

            var xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.5;
            var yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.5;

            var oneOfStartBezierPoint = new cc.Vec2(xc,yc);
            var radius = oneOfStartBezierPoint.mag();
            shortestRadius = Math.min(shortestRadius,radius);
        }
        this.originRadius = shortestRadius;
    },
    tryToMix(){
        if(this.dropToMix == null){
            return;
        }
        var radius1 = this.originRadius;
        var radius2 = this.dropToMix.getComponent('WaterDrop').originRadius;
        var v = 0.5;
        var d = this.node.position.sub(this.dropToMix.position).mag();
        var u1, u2;
        if (d <= Math.abs(radius1 - radius2)) {
            return;
        }else if (d < radius1 + radius2) { // case circles are overlapping
            u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2)/(2 * radius1 * d));
            u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1)/(2 * radius2 * d));
        } else {
            u1 = 0;
            u2 = 0;
        }
        var r1MaxSpread = Math.acos((radius1 - radius2) / d);
        var r2MaxSpread = Math.PI - r1MaxSpread;

        // 主圆上的点
        var vec3ToR2 = this.dropToMix.position.sub(this.node.position);
        var vecToR2 = new cc.Vec2(vec3ToR2.x,vec3ToR2.y);
        var r1Point1 = vecToR2.normalize().mul(radius1).rotate(u1+(r1MaxSpread-u1)*v);
        var r1Point2 = vecToR2.normalize().mul(radius1).rotate(-(u1+(r1MaxSpread-u1)*v));

        // var shortestDistanceIndex = 0;
        // var shortestDistance = 99999;
        // for(var N = 0; N < this.nodes.length; N++) {
        //     var currentIndex = this.nodes[N];
        //     var ctrlVec = new cc.Vec2(currentIndex.x,currentIndex.y);
        //     var distanveToCtrlPoint = ctrlVec.sub(r1Point1).mag();
        //     if(shortestDistance > distanveToCtrlPoint){
        //         shortestDistance = distanveToCtrlPoint;
        //         shortestDistanceIndex = N;
        //     }
        // }
        // this.nodes[shortestDistanceIndex].x = r1Point1.x;
        // this.nodes[shortestDistanceIndex].y = r1Point1.y;

        if(this.debug){
            this.graphics.strokeColor = cc.Color.RED;
            this.graphics.circle(r1Point1.x, r1Point1.y, 5);
            this.graphics.stroke();
            this.graphics.strokeColor = cc.Color.WHITE;
            this.graphics.circle(r1Point2.x, r1Point2.y, 5);
            this.graphics.stroke();
        }

        // 准备融合的圆上的点
        var vec3ToR1 = this.node.position.sub(this.dropToMix.position);
        var vecToR1 = new cc.Vec2(vec3ToR1.x,vec3ToR1.y);
        var r2Point1 = vecToR1.normalize().mul(radius2).rotate((u2+(r2MaxSpread-u2)*v));
        var r2Point2 = vecToR1.normalize().mul(radius2).rotate(-(u2+(r2MaxSpread-u2)*v));

        var worldPos = this.dropToMix.convertToWorldSpaceAR(r2Point1);
        var r2Point1InR1Trans = this.node.convertToNodeSpaceAR(worldPos);
        worldPos = this.dropToMix.convertToWorldSpaceAR(r2Point2);
        var r2Point2InR1Trans = this.node.convertToNodeSpaceAR(worldPos);

        if(this.debug){
            this.graphics.strokeColor = cc.Color.RED;
            this.graphics.circle(r2Point1InR1Trans.x, r2Point1InR1Trans.y, 5);
            this.graphics.stroke();
            this.graphics.strokeColor = cc.Color.WHITE;
            this.graphics.circle(r2Point2InR1Trans.x, r2Point2InR1Trans.y, 5);
            this.graphics.stroke();
        }

        // 计算 长度比例
        var totalRadius = radius1 + radius2;
        var handleSize = 10;
        var ratio = Math.min(handleSize*v,r1Point1.sub(r2Point2InR1Trans).mag()/totalRadius);
        var r1HandleSize = radius1*ratio;
        var r2HandleSize = radius2*ratio;

        // 主圆上的 控制长度点
        var r1HandlePoint1 = r1Point1.normalize().neg().mul(r1HandleSize).rotate(Math.PI/2).add(r1Point1);
        var r1HandlePoint2 = r1Point2.normalize().neg().mul(r1HandleSize).rotate(-Math.PI/2).add(r1Point2);

        if(this.debug){
            this.graphics.strokeColor = cc.Color.RED;
            this.graphics.circle(r1HandlePoint1.x, r1HandlePoint1.y, 5);
            this.graphics.stroke();
            this.graphics.strokeColor = cc.Color.WHITE;
            this.graphics.circle(r1HandlePoint2.x, r1HandlePoint2.y, 5);
            this.graphics.stroke();
    
            this.graphics.moveTo(r1Point1.x,r1Point1.y);
            this.graphics.lineTo(r1HandlePoint1.x,r1HandlePoint1.y);
            this.graphics.moveTo(r1Point2.x,r1Point2.y);
            this.graphics.lineTo(r1HandlePoint2.x,r1HandlePoint2.y);
            this.graphics.stroke();
        }

        // 融合圆上的 控制长度点
        var r2HandlePoint1 = r2Point1.normalize().neg().mul(r2HandleSize).rotate(Math.PI/2).add(r2Point1);
        var r2HandlePoint2 = r2Point2.normalize().neg().mul(r2HandleSize).rotate(-Math.PI/2).add(r2Point2);
        
        var worldPos = this.dropToMix.convertToWorldSpaceAR(r2HandlePoint1);
        var r2HandlePoint1InR1Trans = this.node.convertToNodeSpaceAR(worldPos);
        worldPos = this.dropToMix.convertToWorldSpaceAR(r2HandlePoint2);
        var r2HandlePoint2InR1Trans = this.node.convertToNodeSpaceAR(worldPos);

        if(this.debug){
            this.graphics.strokeColor = cc.Color.RED;
            this.graphics.circle(r2HandlePoint1InR1Trans.x, r2HandlePoint1InR1Trans.y, 5);
            this.graphics.stroke();
            this.graphics.strokeColor = cc.Color.WHITE;
            this.graphics.circle(r2HandlePoint2InR1Trans.x, r2HandlePoint2InR1Trans.y, 5);
            this.graphics.stroke();
    
            this.graphics.moveTo(r2Point1InR1Trans.x,r2Point1InR1Trans.y);
            this.graphics.lineTo(r2HandlePoint1InR1Trans.x,r2HandlePoint1InR1Trans.y);
            this.graphics.moveTo(r2Point2InR1Trans.x,r2Point2InR1Trans.y);
            this.graphics.lineTo(r2HandlePoint2InR1Trans.x,r2HandlePoint2InR1Trans.y);
            this.graphics.stroke();
        }
        // draw bezier 第一曲线
        this.graphics.strokeColor = cc.Color.GREEN;
        this.graphics.moveTo(r1Point1.x,r1Point1.y);
        this.graphics.bezierCurveTo(r1HandlePoint1.x,r1HandlePoint1.y,r2HandlePoint2InR1Trans.x,r2HandlePoint2InR1Trans.y,r2Point2InR1Trans.x,r2Point2InR1Trans.y);

        this.graphics.lineTo(r2Point1InR1Trans.x,r2Point1InR1Trans.y);
        // this.graphics.bezierCurveTo(r2HandlePoint2InR1Trans.x,r2HandlePoint2InR1Trans.y,r2HandlePoint1InR1Trans.x,r2HandlePoint1InR1Trans.y,r2Point1InR1Trans.x,r2Point1InR1Trans.y);

        // draw bezier 第二曲线
        this.graphics.bezierCurveTo(r2HandlePoint1InR1Trans.x,r2HandlePoint1InR1Trans.y,r1HandlePoint2.x,r1HandlePoint2.y,r1Point2.x,r1Point2.y);

        this.graphics.lineTo(r1Point1.x,r1Point1.y);
        // this.graphics.bezierCurveTo(r1HandlePoint2.x,r1HandlePoint2.y,r1HandlePoint1.x,r1HandlePoint1.y,r1Point1.x,r1Point1.y);

        if(this.debug){
            this.graphics.stroke();
        }else{
            this.graphics.fillColor = this.fillColor;
            this.graphics.fill();
        }
    },
    createBezierNodes: function () {
        for(var quantity = 0, len = 6; quantity < len; quantity++) {
                
            var theta = Math.PI * 2 * quantity / len;
            
            var x = this.bezierCtrlToCenter * Math.cos(theta);
            var y = this.bezierCtrlToCenter * Math.sin(theta);
            
            this.nodes.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                
                lastX: x,
                lastY: y,
                
                min: 150,
                max: 250,
                disturb: 150,
                
                orbit: 20,
                angle: Math.random() * Math.PI * 2,
                speed: 0.05 + Math.random() * 0.05,
                                                
                theta: theta
            });
        }
    },
    update (dt) {
        this.render();
        this.tryToMix();
    },
    render: function () {
        let nodes = this.nodes;
        let graphics = this.graphics;
        let color = this.color;
        var currentIndex, nextIndex, xc, yc;
        color.a = this.debug ? 255 : 255/2;
        graphics.clear();

        // draw nodes xy 位置; 控制点
        if(this.debug){
            nodes.forEach(element => {
                graphics.strokeColor = cc.Color.GREEN;
                graphics.circle(element.x, element.y, 5);
                graphics.stroke();
            });
        }

        // draw 第一轮 贝塞尔曲线
        currentIndex = nodes[nodes.length - 1];
        nextIndex = nodes[0];
        xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.5;
        yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.5;    

        if(this.debug){
            graphics.circle(xc, yc, 5); // 下标0和1的控制点的中点
        }
        graphics.moveTo(xc, yc);

        for(var N = 0; N < nodes.length; N++) {
            currentIndex = nodes[N];
            nextIndex = N + 1 > nodes.length - 1 ? nodes[N - nodes.length + 1] : nodes[N + 1]; //如果n+1超过了数组长度取数组下标0的node

            xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.5;
            yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.5;

            graphics.strokeColor = cc.Color.YELLOW;
            graphics.quadraticCurveTo(currentIndex.x, currentIndex.y, xc, yc);
        }
        if(this.debug){
            graphics.stroke();
        }else{
            graphics.fillColor = this.fillColor;
            graphics.fill();
        }

        // Draw through N points 起始及其终止点
        if(this.debug){
            graphics.strokeColor = cc.Color.RED;
            for(var N = 0; N < nodes.length; N++) {
                // First anchor
                currentIndex = nodes[N];
                nextIndex = N + 1 > nodes.length - 1 ? nodes[N - nodes.length + 1] : nodes[N + 1];
                
                xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.8;
                yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.8;
                
                graphics.moveTo(xc, yc);
                
                // Second anchor
                currentIndex = nextIndex;
                nextIndex = N + 2 > nodes.length - 1 ? nodes[N - nodes.length + 2] : nodes[N + 2]; 
                
                xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.2;
                yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.2;
                
                graphics.lineTo(xc, yc);
                graphics.stroke();
                
                // First anchor
                currentIndex = nodes[N];
                nextIndex = N + 1 > nodes.length - 1 ? nodes[N - nodes.length + 1] : nodes[N + 1];
                
                xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.8;
                yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.8;
                
                graphics.circle(xc, yc, 2);
                graphics.fill();
            
                // Second anchor
                currentIndex = nextIndex;
                nextIndex = N + 2 > nodes.length - 1 ? nodes[N - nodes.length + 2] : nodes[N + 2]; 
                
                xc = currentIndex.x + (nextIndex.x - currentIndex.x) * 0.2;
                yc = currentIndex.y + (nextIndex.y - currentIndex.y) * 0.2;
                
                graphics.circle(xc, yc, 2);
                graphics.fill();
            } 
        }
    }
});
