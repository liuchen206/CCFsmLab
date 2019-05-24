// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var noise = require('perlin')
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        pursuitTarget:cc.Node,
        evadeTarget:cc.Node,
        beSeek:false,
        beFlee:false,
        beArrive:false,
        bePursuit:false,
        beEvade:false,
        beWander:false,
        beObstacleAvoidance:false,
        beWallAvoidance:false,
        vSteeringForce:cc.Vec2,
        elapseTime:0,
        graphics:cc.Graphics,
        isShowDrawDebugGraphics:true,
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.AutoPlayerJS = this.node.getComponent('AutoPlayer');
    },

    start () {
        // cc.log('MapNum：：',MapNum(50,0,100,50,100));
        // cc.log('MapNum：：',MapNum(0,-50,50,0,100));

        noise.seed(Math.random());
    },

    update (dt) {
        this.elapseTime += dt;
    },
    Calculate(){
        this.graphics.clear();
        this.vSteeringForce = cc.Vec2.ZERO;
        if(this.beSeek){
            this.vSteeringForce.addSelf(this.Seek(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.beFlee){
            this.vSteeringForce.addSelf(this.Flee(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.beArrive){
            this.vSteeringForce.addSelf(this.Arrive(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.bePursuit){
            this.vSteeringForce.addSelf(this.Pursuit(this.pursuitTarget.getComponent('AutoPlayer')));
        }
        if(this.beEvade){
            this.vSteeringForce.addSelf(this.Evade(this.evadeTarget.getComponent('AutoPlayer')));
        }
        if(this.beWander){
            this.vSteeringForce.addSelf(this.Wander());
        }
        if(this.beObstacleAvoidance){
            this.vSteeringForce.addSelf(this.ObstacleAvoidance());
        }
        if(this.beWallAvoidance){
            this.vSteeringForce.addSelf(this.WallAvoidance());
        }
        return this.vSteeringForce;
    },
    Seek(targetPos){
        var desiredVelocity = (targetPos.sub(this.AutoPlayerJS.node.position)).normalize().mul(this.AutoPlayerJS.MaxSpeed);
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Flee(targetPos){
        var desiredVelocity = (targetPos.sub(this.AutoPlayerJS.node.position)).normalize().mul(this.AutoPlayerJS.MaxSpeed);
        desiredVelocity.negSelf();
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Arrive(targetPos){
        var toTargetVec2 = targetPos.sub(this.AutoPlayerJS.node.position);
        var toTargetDis = toTargetVec2.mag();
        var subSpeedRadio = 200;
        if(toTargetDis > subSpeedRadio){
            var desiredVelocity = toTargetVec2.normalize().mul(this.AutoPlayerJS.MaxSpeed);
            return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
        }else{
            if(toTargetDis > 5){
                var subSpeed = MapNum(toTargetDis,0,subSpeedRadio,0,this.AutoPlayerJS.MaxSpeed);
                var desiredVelocity = toTargetVec2.normalize().mul(subSpeed);
                return desiredVelocity.sub(this.AutoPlayerJS.vVelocity).mul(50);
            }else{
                this.AutoPlayerJS.vVelocity = cc.Vec2.ZERO;
                return cc.Vec2.ZERO;
            }
        }
    },
    Pursuit(evader){
        var toPursuitPlayer = evader.node.position.sub(this.AutoPlayerJS.node.position);
        if(toPursuitPlayer.dot(this.AutoPlayerJS.vHeading) > 0 && this.AutoPlayerJS.vHeading.dot(evader.vHeading) <-0.95){
            return this.Seek(evader.node.position);
        }
        var lookAhead = toPursuitPlayer.mag()/(this.AutoPlayerJS.MaxSpeed + evader.vVelocity.mag());
        return this.Seek(evader.node.position.add(evader.vVelocity.mul(lookAhead)));
    },
    Evade(pursuer){
        var toPursuer = pursuer.node.position.sub(this.AutoPlayerJS.node.position);
        var threatRange = 200;
        if(toPursuer.mag() > threatRange){
            return cc.Vec2.ZERO;
        }
        var lookAhead = toPursuer.mag()/(this.AutoPlayerJS.MaxSpeed + pursuer.vVelocity.mag());
        return this.Flee(pursuer.node.position.add(pursuer.vVelocity.mul(lookAhead)));
    },
    Wander(){
        var berlinX = noise.perlin2(this.elapseTime,this.elapseTime);  
        var berlinY = noise.perlin2(-this.elapseTime,-this.elapseTime);  
        var randomForceX = MapNum(berlinX,-1,1,-this.AutoPlayerJS.MaxSpeed,this.AutoPlayerJS.MaxSpeed);
        var randomForceY = MapNum(berlinY,-1,1,-this.AutoPlayerJS.MaxSpeed,this.AutoPlayerJS.MaxSpeed);
        return new cc.Vec2(randomForceX,randomForceY);
    },
    ObstacleAvoidance(){
        // 1, 检测是否探测到障碍物
        var minDetectorLength = this.node.height/2;
        var maxDetectorLength = this.node.height*2;
        // var rectHeight = 300;
        var rectHeight = minDetectorLength + this.AutoPlayerJS.vVelocity.mag()/this.AutoPlayerJS.MaxSpeed*maxDetectorLength;
        var midStart = new cc.Vec2(0,0)
        // 生成探针
        // 中间
        var midEnd = new cc.Vec2(0,rectHeight)
        var mid0 = midEnd.sub(midStart);
        // 左偏 30
        var left30 = mid0.rotate(Math.PI/6);
        // 左偏 60
        var left60 = mid0.rotate(Math.PI/3);
        // 右偏 30
        var right30 = mid0.rotate(-Math.PI/6);
        // 右偏 60
        var right60 = mid0.rotate(-Math.PI/3);

        var sensorList = [{data:left60,weight:3,derect:-1},{data:left30,weight:2,derect:-1},{data:mid0,weight:1,derect:0},{data:right30,weight:2,derect:1},{data:right60,weight:3,derect:1}];
        // 被触发的探针
        var activeSensor = null;
        // 逐个检测
        for(var i = 0;i < sensorList.length;i++){
            var worldPosStart = this.node.convertToWorldSpaceAR(midStart);
            var worldPosEnd = this.node.convertToWorldSpaceAR(sensorList[i]['data']);
            var results = cc.director.getPhysicsManager().rayCast(worldPosStart, worldPosEnd, cc.RayCastType.All);
            for (var j = 0; j < results.length; j++) {
                var result = results[j];
                var collider = result.collider;
                var point = result.point;
                var normal = result.normal;
                var fraction = result.fraction;
                if(collider.tag == EnumOfColliderTag.ObstacleCollider){ //仅仅检测障碍物
                    sensorList[i]['data'] = this.graphics.node.convertToNodeSpaceAR(point);
                    // 绘制 辅助线(击中点)
                    if(this.isShowDrawDebugGraphics){
                        this.graphics.circle(sensorList[i]['data'].x, sensorList[i]['data'].y, 8);
                    }

                    if(activeSensor !== null){
                        if(sensorList[i]['weight'] > activeSensor['weight']){
                            activeSensor = sensorList[i];
                        }
                    }else{
                        activeSensor = sensorList[i];
                    }
                    break;
                }
            }
        }

        // 绘制 辅助线
        if(this.isShowDrawDebugGraphics){
            this.graphics.strokeColor = cc.Color.GREEN;
            for(var i = 0;i < sensorList.length;i++){
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(sensorList[i]['data'].x, sensorList[i]['data'].y);
            }
            this.graphics.stroke();
            if(activeSensor !== null){
                this.graphics.strokeColor = cc.Color.RED;
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(activeSensor['data'].x, activeSensor['data'].y);
                this.graphics.stroke();
            }        
        }


        // 最后步骤：计算出新的转向力
        var steeringForce = cc.Vec2.ZERO;
        if(activeSensor !== null){
            var derectVec = null;
            if(activeSensor['derect'] === 0){
                derectVec = activeSensor['data'].rotate(Math.PI/2);
            }else if(activeSensor['derect'] < 0){// 属于左侧探针，应取向右的方向
                derectVec = activeSensor['data'].rotate(-Math.PI/2);
            }else{
                derectVec = activeSensor['data'].rotate(Math.PI/2);
            }
            derectVec = derectVec.normalize().mul(activeSensor['data'].mag());
            // 三类点：1，player坐标系中绘制辅助线的点。2，世界坐标系下的射线检测点。3，射线检测结果转为canvas中的位置坐标点
            var canvasPos = cc.find("Canvas").convertToNodeSpaceAR(this.graphics.node.convertToWorldSpaceAR(derectVec)); // canvas中的pos

            steeringForce = this.Arrive(canvasPos);
            // cc.log('canvasPos ==',canvasPos.toString());
            if(this.isShowDrawDebugGraphics){
                this.graphics.strokeColor = cc.Color.YELLOW;
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(derectVec.x, derectVec.y);
                this.graphics.circle(derectVec.x, derectVec.y, 8);
                this.graphics.stroke(); 
            }

        }
        return steeringForce;
    },
    WallAvoidance(){
        // 1, 检测是否探测到墙壁
        var minDetectorLength = this.node.height/2;
        var maxDetectorLength = this.node.height*5;
        // var rectHeight = 300;
        var rectHeight = minDetectorLength + this.AutoPlayerJS.vVelocity.mag()/this.AutoPlayerJS.MaxSpeed*maxDetectorLength;
        var midStart = new cc.Vec2(0,0)
        // 生成探针
        // 中间
        var midEnd = new cc.Vec2(0,rectHeight)
        var mid0 = midEnd.sub(midStart);
        var worldPosStart = this.node.convertToWorldSpaceAR(midStart);
        var worldPosEnd = this.node.convertToWorldSpaceAR(mid0);
        var results = cc.director.getPhysicsManager().rayCast(worldPosStart, worldPosEnd, cc.RayCastType.All);
        var hitPointToCanvas = null;
        var hitPointNormal = null;
        for (var j = 0; j < results.length > 0; j++) {
            var result = results[j];
            var collider = result.collider;
            var point = result.point;
            var normal = result.normal;
            var fraction = result.fraction;
            if(collider.tag == EnumOfColliderTag.wallCollider){ //仅仅检测墙壁
                var hitPointToGraphics = this.graphics.node.convertToNodeSpaceAR(point);
                hitPointToCanvas = cc.find("Canvas").convertToNodeSpaceAR(point);
                hitPointNormal = normal;
                
                var normalToGgraphics = this.graphics.node.convertToNodeSpaceAR(normal.mul(100).add(point));
                // cc.log("rate info:",normalToGgraphics.toString(),normal.toString(),normal.mul(50).toString(),hitPointToGraphics.toString());
                if(this.isShowDrawDebugGraphics){
                    this.graphics.strokeColor = cc.Color.RED;
                    this.graphics.moveTo(hitPointToGraphics.x, hitPointToGraphics.y);
                    this.graphics.lineTo(normalToGgraphics.x,normalToGgraphics.y);
                    this.graphics.circle(hitPointToGraphics.x, hitPointToGraphics.y, 8);
                    this.graphics.stroke();
                }
                break;
            }
        }
        if(this.isShowDrawDebugGraphics){
            this.graphics.strokeColor = cc.Color.GREEN;
            this.graphics.moveTo(0, 0);
            this.graphics.lineTo(mid0.x, mid0.y);
            this.graphics.stroke();
        }
        
        // 计算合力
        if(hitPointToCanvas !== null){
            var distanceTohitPoint = hitPointToCanvas.sub(this.node.position).mag();
            var rate = 1-distanceTohitPoint/rectHeight; // 距离墙壁越近值越大
            var steeringForce = cc.Vec2.ZERO;
            var desiredVelocity = hitPointNormal.mul(this.AutoPlayerJS.MaxSpeed*rate*10);
            steeringForce = desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
            // cc.log("rate info:",rate,distanceTohitPoint,rectHeight,hitPointNormal.toString(),steeringForce.toString());
            return steeringForce;
        }
        return cc.Vec2.ZERO;
    },
});
