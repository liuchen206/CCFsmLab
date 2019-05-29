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
        crossHair:{
            default:null,
            type:cc.Node,
        },
        graphics:cc.Graphics,
        isShowDrawDebugGraphicsInWorld: false,
        globalWeightSeparation:1,
        globalWeightAlignment:1,
        globalWeightCohesion:1,
        globalWeightArrive:1,
        globalWeigthPurSuit:1,
        globalWeightEvade:1,
        globalWeightWander:1,
        globalWeightInterpose:1,
        globalWeightHide:1,
        globalWeightPathFollow:1,
        globalWeightOffetPursuit:1,
        separationEditBox:cc.EditBox,
        AlignmentEditBox:cc.EditBox,
        CohesionEditBox:cc.EditBox,
        ArriveEditBox:cc.EditBox,
        PursuitEditBox:cc.EditBox,
        EvadeEditBox:cc.EditBox,
        WanderEditBox:cc.EditBox,
        InterposeEditBox:cc.EditBox,
        HideEditBox:cc.EditBox,
        PathFollowEditBox:cc.EditBox,
        OffetPursuitEditBox:cc.EditBox,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        // cc.director.getCollisionManager().enabledDrawBoundingBox = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_shapeBit;
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        // cc.PhysicsManager.DrawBits.e_pairBit |
        // cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        // cc.PhysicsManager.DrawBits.e_jointBit |
        // cc.PhysicsManager.DrawBits.e_shapeBit;
        
        // 本地坐标变换为世界坐标
        // this.anParentNode.convertToWorldSpaceAR(localPositonOfChild);
        //  世界坐标变换为本地坐标
        // this.node.convertToNodeSpaceAR(anWorldPosition);

        // cc.log('childrenCount',this.node.childrenCount);
        // cc.log('getObstacleList ',this.getObstacleList().length);

        this.node.on('mousedown', function (event) {
            var newVec2 = this.node.convertToNodeSpaceAR(new cc.Vec2(event.getLocationX(),event.getLocationY()));
            this.crossHair.position = newVec2;
        }, this);
        this.node.on('touchstart', function (event) {
            var newVec2 = this.node.convertToNodeSpaceAR(new cc.Vec2(event.getLocationX(),event.getLocationY()));
            this.crossHair.position = newVec2;
        }, this);
    },

    start () {
        this.separationEditBox.string = this.globalWeightSeparation.toString();
        this.AlignmentEditBox.string = this.globalWeightAlignment.toString();
        this.CohesionEditBox.string = this.globalWeightCohesion.toString();
        this.ArriveEditBox.string = this.globalWeightArrive.toString();
        this.PursuitEditBox.string = this.globalWeigthPurSuit.toString();
        this.EvadeEditBox.string = this.globalWeightEvade.toString();
        this.WanderEditBox.string = this.globalWeightWander.toString();
        this.InterposeEditBox.string = this.globalWeightInterpose.toString();
        this.HideEditBox.string = this.globalWeightHide.toString();
        this.PathFollowEditBox.string = this.globalWeightPathFollow.toString();
        this.OffetPursuitEditBox.string = this.globalWeightOffetPursuit.toString();
    },

    // update (dt) {},

    getHidePosition(hunterJS){
        var obstacleList = this.getObstacleList();
        var distanceFromCollider = 30; // 寻找的躲避点不是在障碍物上，而是距离障碍物隔着一段距离
        var hidePositionList = [];
        for(var i = 0;i < obstacleList.length;i++){
            var hideDirectionVec = obstacleList[i].position.sub(hunterJS.node.position).normalize();
            var obstaclePoints = obstacleList[i].getComponent(cc.PhysicsPolygonCollider).points;
            var currentLongestDistance= 0;
            for(var j = 0;j < obstaclePoints.length;j++){
                var distance = obstaclePoints[j].mag();
                if(currentLongestDistance < distance){
                    currentLongestDistance = distance;
                }
            }
            var aaaLength = currentLongestDistance + distanceFromCollider;
            var hidePositon = obstacleList[i].position.add(hideDirectionVec.mul(aaaLength));
            hidePositionList.push(hidePositon);
        }

        if(this.isShowDrawDebugGraphicsInWorld){
            this.graphics.clear();
            for(var i = 0; i < hidePositionList.length;i++){
                this.graphics.strokeColor = cc.Color.GREEN;
                this.graphics.circle(hidePositionList[i].x, hidePositionList[i].y, 8);
            }
            this.graphics.stroke();
        }

        return hidePositionList;
    },

    // 获得所有障碍物
    getObstacleList(){
        var allNodeInCanvas = this.node.children;
        var obstacleList = [];
        for(var i = 0;i < allNodeInCanvas.length;i++){
            if(allNodeInCanvas[i].getComponent('ObStacle') !== null){
                obstacleList.push(allNodeInCanvas[i]);
            }
        }
        return obstacleList;
    },
    // 获得半径内的所有出自己外的 player
    getPlayerList(searchPlayerNodeJS,radio){
        var allNodeInCanvas = this.node.children;
        var playerList = [];
        for(var i = 0;i < allNodeInCanvas.length;i++){
            if(allNodeInCanvas[i].getComponent('AutoPlayer') !== null){
                if(allNodeInCanvas[i].getComponent('AutoPlayer').InstanceID !== searchPlayerNodeJS.InstanceID){
                    if(allNodeInCanvas[i].position.sub(searchPlayerNodeJS.node.position).mag()<=radio){
                        playerList.push(allNodeInCanvas[i]);
                    }
                }
            }
        }
        return playerList;
    },
    // 从UI界面上权重配置 设置回调函数
    weightSetDone(editbox,returnData){
        cc.log('weightSetDone',returnData,editbox.string,parseFloat(editbox.string));
        if(returnData == "Separation"){
            this.globalWeightSeparation = parseFloat(editbox.string);
        }
        if(returnData == "Alignment"){
            this.globalWeightAlignment = parseFloat(editbox.string);
        }
        if(returnData == "Cohesion "){
            this.globalWeightCohesion = parseFloat(editbox.string);
        }
        if(returnData == "Arrive"){
            this.globalWeightArrive = parseFloat(editbox.string);
        }
        if(returnData == "PurSuit"){
            this.globalWeigthPurSuit = parseFloat(editbox.string);
        }
        if(returnData == "Evade"){
            this.globalWeightEvade = parseFloat(editbox.string);
        }
        if(returnData == "Wander"){
            this.globalWeightWander = parseFloat(editbox.string);
        }
        if(returnData == "Interpose"){
            this.globalWeightInterpose = parseFloat(editbox.string);
        }
        if(returnData == "Hide"){
            this.globalWeightHide = parseFloat(editbox.string);
        }
        if(returnData == "PathFollow"){
            this.globalWeightPathFollow = parseFloat(editbox.string);
        }
        if(returnData == "OffetPursuit"){
            this.globalWeightOffetPursuit = parseFloat(editbox.string);
        }
    }
});
