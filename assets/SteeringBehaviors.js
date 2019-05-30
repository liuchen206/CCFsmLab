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
        interposePlayerA:cc.Node,
        interposePlayerB:cc.Node,
        hunderPlayer:cc.Node,
        leaderTarget:cc.Node,
        offsetToLeader:cc.Vec2.ZERO,
        beSeek:false,
        beFlee:false,
        beArrive:false,
        bePursuit:false,
        beEvade:false,
        beWander:false,
        beObstacleAvoidance:false,
        beWallAvoidance:false,
        beInterpose:false,
        beHide:false,
        bePathFollow:false,
        beOffsetPursuit:false,
        beSeparation:false,
        beAlignment:false,
        beCohesion:false,
        weightSeparation:1,
        weightAlignment:1,
        weightCohesion:1,
        weightArrive:1,
        weigthPurSuit:1,
        weightEvade:1,
        weightWander:1,
        weightInterpose:1,
        weightHide:1,
        weightPathFollow:1,
        weightOffetPursuit:1,
        vSteeringForce:cc.Vec2,
        elapseTime:0,
        hideMemoryCounter:0,
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
        // cc.log("Math.random(),",Math.random());
    },

    update (dt) {
        this.elapseTime += dt;
        if(this.hideMemoryCounter <= 0){
            this.hideMemoryCounter = 0;
        }else{
            this.hideMemoryCounter -= dt;
        }
        if(this.cohesionMemoryCounter <= 0){
            this.cohesionMemoryCounter = 0;
        }else{
            this.cohesionMemoryCounter -= dt;
        }
        this.weightSeparation = this.AutoPlayerJS.GameWorldJS.globalWeightSeparation;
        this.weightAlignment = this.AutoPlayerJS.GameWorldJS.globalWeightAlignment;
        this.weightCohesion = this.AutoPlayerJS.GameWorldJS.globalWeightCohesion;
        this.weightArrive = this.AutoPlayerJS.GameWorldJS.globalWeightArrive;
        this.weigthPurSuit = this.AutoPlayerJS.GameWorldJS.globalWeigthPurSuit;
        this.weightEvade = this.AutoPlayerJS.GameWorldJS.globalWeightEvade;
        this.weightWander = this.AutoPlayerJS.GameWorldJS.globalWeightWander;
        this.weightInterpose = this.AutoPlayerJS.GameWorldJS.globalWeightInterpose;
        this.weightHide = this.AutoPlayerJS.GameWorldJS.globalWeightHide;
        this.weightPathFollow = this.AutoPlayerJS.GameWorldJS.globalWeightPathFollow;
        this.weightOffetPursuit = this.AutoPlayerJS.GameWorldJS.globalWeightOffetPursuit;
    },
    Calculate(){
        this.graphics.clear();
        this.vSteeringForce = cc.Vec2.ZERO;
        if(this.beWallAvoidance){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.WallAvoidance());
        }
        if(this.beObstacleAvoidance){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.ObstacleAvoidance());
        }
        if(this.beEvade){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Evade(this.evadeTarget.getComponent('AutoPlayer')).mul(this.weightEvade));
        }
        if(this.beFlee){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Flee(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.beSeparation){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Separation().mul(this.weightSeparation));
        }
        if(this.beAlignment){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Alignment().mul(this.weightAlignment));
        }
        if(this.beCohesion){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Cohesion().mul(this.weightCohesion));
        }
        if(this.beSeek){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Seek(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.beArrive){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Arrive(this.AutoPlayerJS.GameWorldJS.crossHair.position).mul(this.weightArrive));
        }
        if(this.beWander){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Wander().mul(this.weightWander));
        }
        if(this.bePursuit){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Pursuit(this.pursuitTarget.getComponent('AutoPlayer')).mul(this.weigthPurSuit));
        }
        if(this.beOffsetPursuit){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.OffsetPursuit(this.leaderTarget.getComponent('AutoPlayer')).mul(this.weightOffetPursuit));
        }
        if(this.beInterpose){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Interpose(this.interposePlayerB.getComponent('AutoPlayer'),this.interposePlayerA.getComponent('AutoPlayer')).mul(this.weightInterpose));
        }
        if(this.beHide){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.Hide(this.hunderPlayer.getComponent('AutoPlayer')).mul(this.weightHide));
        }
        if(this.bePathFollow){
            this.vSteeringForce = this.AccumulateForce(this.vSteeringForce, this.PathFollow(this.AutoPlayerJS.currentPathNode).mul(this.weightPathFollow));
        }




        return this.vSteeringForce;
    },
    AccumulateForce(currentSteeringForce,addedForce){
        var currentForceLength = currentSteeringForce.mag();
        var forceCanUse = this.AutoPlayerJS.MaxForce - currentForceLength;
        if(forceCanUse <= 0){
            return currentSteeringForce;
        }
        var addedForceLength = addedForce.mag();
        if(addedForceLength <= forceCanUse){
            return currentSteeringForce.add(addedForce);
        }else{
            var canUsedAddedForce = addedForce.normalize().mul(forceCanUse);
            return currentSteeringForce.add(canUsedAddedForce);
        }
    },
    Seek(targetPos){
        var desiredVelocity = (targetPos.sub(this.AutoPlayerJS.node.position)).normalize().mul(this.AutoPlayerJS.MaxSpeed);
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity).mul(2); // .mul(5) 乘以一个倍数的原因是，为了是转向更加敏感，避免“绕大弯”的情况出现
    },
    Flee(targetPos){
        var desiredVelocity = (targetPos.sub(this.AutoPlayerJS.node.position)).normalize().mul(this.AutoPlayerJS.MaxSpeed);
        desiredVelocity.negSelf();
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Arrive(targetPos){
        var toTargetVec2 = targetPos.sub(this.AutoPlayerJS.node.position);
        var toTargetDis = toTargetVec2.mag();
        var subSpeedRadio = 100;
        if(toTargetDis < subSpeedRadio){
            // 全力减速到 0 
            if(this.AutoPlayerJS.vVelocity.mag() > 50){
                var desiredVelocity = this.AutoPlayerJS.vVelocity.normalize().neg().mul(this.AutoPlayerJS.MaxSpeed);
                return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
            }else{
                var subSpeed = MapNum(toTargetDis,0,subSpeedRadio,0,this.AutoPlayerJS.MaxSpeed);
                var desiredVelocity = toTargetVec2.normalize().mul(subSpeed*0.1);
                return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
            }
        }else{
            return this.Seek(targetPos);
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
        if(this.isShowDrawDebugGraphics){
            this.graphics.strokeColor = cc.Color.YELLOW;
            this.graphics.circle(0,0, threatRange);
            this.graphics.stroke();        
        }
        var lookAhead = toPursuer.mag()/(this.AutoPlayerJS.MaxSpeed + pursuer.vVelocity.mag());
        return this.Flee(pursuer.node.position.add(pursuer.vVelocity.mul(lookAhead)));
    },
    Wander(){
        var berlinX = noise.perlin2(this.elapseTime,this.elapseTime);  
        var berlinY = noise.perlin2(this.elapseTime+10000,this.elapseTime+10000);  
        var randomForceX = MapNum(berlinX,-1,1,-this.AutoPlayerJS.MaxSpeed*3,this.AutoPlayerJS.MaxSpeed*3);
        var randomForceY = MapNum(berlinY,-1,1,-this.AutoPlayerJS.MaxSpeed*3,this.AutoPlayerJS.MaxSpeed*3);
        var streeingForce = new cc.Vec2(randomForceX,randomForceY);
        return streeingForce; 
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
        if(this.isShowDrawDebugGraphics && activeSensor != null){
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
            if(activeSensor['derect'] < 0){// 属于左侧探针，应取向右的方向
                derectVec = activeSensor['data'].rotate(-Math.PI*2/3);
            }else{
                derectVec = activeSensor['data'].rotate(Math.PI*2/3);
            }
            derectVec = derectVec.normalize().mul(activeSensor['data'].mag());
            // 三类点：1，player坐标系中绘制辅助线的点。2，世界坐标系下的射线检测点。3，射线检测结果转为canvas中的位置坐标点
            var canvasPos = cc.find("Canvas/GameView/GameWorld").convertToNodeSpaceAR(this.graphics.node.convertToWorldSpaceAR(derectVec)); // canvas中的pos

            steeringForce = this.Seek(canvasPos);
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
                hitPointToCanvas = cc.find("Canvas/GameView/GameWorld").convertToNodeSpaceAR(point);
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
        if(this.isShowDrawDebugGraphics && hitPointToCanvas != null){
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
    Interpose(playerA,playerB){
        var currentMidPoint = playerA.node.position.add(playerB.node.position).div(2);
        var timeToReachCurrentMidPoint = currentMidPoint.sub(this.AutoPlayerJS.node.position).mag()/this.AutoPlayerJS.MaxSpeed;

        var playerAPosInFuture = playerA.node.position.add(playerA.vVelocity.mul(timeToReachCurrentMidPoint));
        var playerBPosInFuture = playerB.node.position.add(playerB.vVelocity.mul(timeToReachCurrentMidPoint));

        var futureMidPoint = playerAPosInFuture.add(playerBPosInFuture).div(2);

        if(this.isShowDrawDebugGraphics){
            var posInGraphics = this.node.convertToNodeSpaceAR(this.node.parent.convertToWorldSpaceAR(futureMidPoint));
            this.graphics.strokeColor = cc.Color.GREEN;
            this.graphics.circle(posInGraphics.x, posInGraphics.y, 8);
            this.graphics.stroke();
            // cc.log("posInGraphics ",posInGraphics.toString());
        }

        return this.Arrive(futureMidPoint);
    },
    Hide(hunter){
        // 1 首先要能“看到”hunter
        var minDetectorLength = this.node.height;
        var maxDetectorLength = this.node.height*4;
        // var rectHeight = 300;
        var rectHeight = minDetectorLength + maxDetectorLength;
        var midStart = new cc.Vec2(0,0)
        // 生成探针
        // 中间
        var midEnd = new cc.Vec2(0,rectHeight)
        var mid0 = midEnd.sub(midStart);
        // 左偏 15
        var left15 = mid0.rotate(Math.PI/12);
        // 左偏 30
        var left30 = mid0.rotate(Math.PI/6);
        // 左偏 45
        var left45 = mid0.rotate(Math.PI/4);
        // 左偏 60
        var left60 = mid0.rotate(Math.PI/3);
        // 右偏 15
        var right15 = mid0.rotate(-Math.PI/12);
        // 右偏 30
        var right30 = mid0.rotate(-Math.PI/6);
        // 右偏 45
        var right45 = mid0.rotate(-Math.PI/4);
        // 右偏 60
        var right60 = mid0.rotate(-Math.PI/3);

        var sensorList = [
            {data:left60,weight:5,derect:-1},
            {data:left45,weight:4,derect:-1},
            {data:left30,weight:3,derect:-1},
            {data:left15,weight:2,derect:-1},
            {data:mid0,weight:1,derect:0},
            {data:right15,weight:2,derect:1},
            {data:right30,weight:3,derect:1},
            {data:right45,weight:4,derect:1},
            {data:right60,weight:5,derect:1},
        ];

        var isVisual = false; // 是否看到了hunter
        // 逐个检测每个sensor
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
                if(collider.tag == EnumOfColliderTag.PlayerCollider){ //仅仅检测player
                    //除了自己之外的player
                    if(collider.node.getComponent("AutoPlayer").InstanceID !== this.AutoPlayerJS.InstanceID){
                        if(collider.node.getComponent("AutoPlayer").InstanceID === hunter.InstanceID){
                            // 探测到hunter
                            isVisual = true;
                            this.hideMemoryCounter = 7; // 秒
                        }
                        sensorList[i]['data'] = this.graphics.node.convertToNodeSpaceAR(point);
                        // 绘制 辅助线(击中点)
                        if(this.isShowDrawDebugGraphics){
                            this.graphics.strokeColor = cc.Color.GREEN;
                            this.graphics.circle(sensorList[i]['data'].x, sensorList[i]['data'].y, 8);
                            if(isVisual){
                                this.graphics.strokeColor = cc.Color.RED;
                                this.graphics.circle(sensorList[i]['data'].x, sensorList[i]['data'].y, 8);
                            }
                            this.graphics.stroke();        
                        }
                        break;
                    }
                }
            }
        }
        // 绘制 辅助线
        if(this.isShowDrawDebugGraphics && isVisual){
            this.graphics.strokeColor = cc.Color.ORANGE;
            for(var i = 0;i < sensorList.length;i++){
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(sensorList[i]['data'].x, sensorList[i]['data'].y);
            }
            this.graphics.stroke();        
        }
        // 2 其次是计算能够躲避的位置
        var hidePositionList = this.AutoPlayerJS.GameWorldJS.getHidePosition(hunter);
        var shortestDistance = 99999;
        var shortestPoint = null;
        for(var i = 0;i < hidePositionList.length;i++){
            //在多个位置中选择一个最近的位置
            var distance = hidePositionList[i].sub(this.AutoPlayerJS.node.position).mag();
            if(distance < shortestDistance){
                shortestDistance = distance;
                shortestPoint =  hidePositionList[i];
            }
        }
        // 3 最后是像躲避的位置移动
        if(this.hideMemoryCounter > 0){
            // "曾经见过hunter"
            if(shortestPoint == null){
                return this.Evade(hunter);
            }else{
                return this.Arrive(shortestPoint);
            }
        }else{
            return cc.Vec2.ZERO;
        }
    },
    PathFollow(pathNodeToFollow){
        var PathNodeJS = pathNodeToFollow.getComponent('PathNode');
        var currentWayPoint = PathNodeJS.getCurrentPoint();
        var distanveToAcceptArrive = 20;
        if(currentWayPoint !== null){
            var distance = this.node.position.sub(currentWayPoint).mag();
            if(distance < distanveToAcceptArrive){
                // 认为到达了
                currentWayPoint = PathNodeJS.goNextPoint();
            }
            if(PathNodeJS.isFinshed()){
                return this.Arrive(PathNodeJS.getCurrentPoint());
            }else{
                return this.Seek(PathNodeJS.getCurrentPoint());
            }
        }else{
            return cc.Vec2.ZERO;
        }
    },
    OffsetPursuit(leader){
        // var offset = new cc.Vec2(0,-100);
        var offset = this.offsetToLeader;
        var pointInGlobal = leader.node.convertToWorldSpaceAR(offset);
        var pointInCanvas = cc.find("Canvas/GameView/GameWorld").convertToNodeSpaceAR(pointInGlobal);

        var toPursuer = pointInCanvas.sub(this.AutoPlayerJS.node.position);
        var lookAhead = toPursuer.mag()/(this.AutoPlayerJS.MaxSpeed + leader.vVelocity.mag());
        return this.Arrive(pointInCanvas.add(leader.vVelocity.mul(lookAhead)));
    },
    Separation(){
        // 首先要能“看到” 其他的player
        var minDetectorLength = this.node.height;
        var maxDetectorLength = this.node.height*4;
        // var rectHeight = 300;
        var rectHeight = minDetectorLength + maxDetectorLength;

        var playerList = this.AutoPlayerJS.GameWorldJS.getPlayerList(this.AutoPlayerJS,rectHeight)
        var streeingForce = cc.Vec2.ZERO;
        for(var i = 0;i < playerList.length;i++){
            var directToSeparate = this.AutoPlayerJS.node.position.sub(playerList[i].position);
            streeingForce.addSelf(directToSeparate.normalize().div(directToSeparate.mag()));
        }
        
        // 绘制 辅助线(击中点)
        if(this.isShowDrawDebugGraphics){
            this.graphics.strokeColor = cc.Color.GREEN;
            this.graphics.circle(0,0, rectHeight);
            this.graphics.stroke();        
        }
        var desiredVelocity = streeingForce.normalize().mul(this.AutoPlayerJS.MaxSpeed);
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Alignment(){
        // 1 首先要能“看到” 其他的player
        var minDetectorLength = this.node.height;
        var maxDetectorLength = this.node.height*4;
        // var rectHeight = 300;
        var rectHeight = minDetectorLength + maxDetectorLength;

        
        var neighborCounter = 0;
        var AverageHeading = cc.Vec2.ZERO;
        var playerList = this.AutoPlayerJS.GameWorldJS.getPlayerList(this.AutoPlayerJS,rectHeight)
        var streeingForce = cc.Vec2.ZERO;
        for(var i = 0;i < playerList.length;i++){
            neighborCounter++;
            AverageHeading.addSelf(playerList[i].getComponent("AutoPlayer").vHeading);
        }
        if(neighborCounter > 0){
            AverageHeading = AverageHeading.div(neighborCounter);
            streeingForce = AverageHeading.sub(this.AutoPlayerJS.vHeading);
        }
        // 绘制 辅助线(击中点)
        if(this.isShowDrawDebugGraphics){
            this.graphics.strokeColor = cc.Color.GREEN;
            this.graphics.circle(0,0, rectHeight);
            this.graphics.stroke();        
        }
        var desiredVelocity = streeingForce.normalize().mul(this.AutoPlayerJS.MaxSpeed);
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Cohesion(){
       // 1 首先要能“看到” 其他的player
       var minDetectorLength = this.node.height;
       var maxDetectorLength = this.node.height*4;
       // var rectHeight = 300;
       var rectHeight = minDetectorLength + maxDetectorLength;

       var playerList = this.AutoPlayerJS.GameWorldJS.getPlayerList(this.AutoPlayerJS,rectHeight)
       var streeingForce = cc.Vec2.ZERO;
       var neighborCounter = 0;
       var CenterOfMass = cc.Vec2.ZERO;
       for(var i = 0;i < playerList.length;i++){
            neighborCounter++;
            CenterOfMass.addSelf(playerList[i].position);
       }
        if(neighborCounter > 0){
            CenterOfMass.divSelf(neighborCounter);
            var lengthToCenterMass = CenterOfMass.sub(this.AutoPlayerJS.node.position).mag();
            var ratio = lengthToCenterMass/rectHeight; // 里质心点近就不需要那么大合力，离得远施加的力就大
            streeingForce = this.Seek(CenterOfMass).mul(ratio);
        }
       // 绘制 辅助线(击中点)
       if(this.isShowDrawDebugGraphics){
           this.graphics.strokeColor = cc.Color.GREEN;
           this.graphics.circle(0,0, rectHeight);
           this.graphics.stroke();        
       }
       return streeingForce;
    },
});
