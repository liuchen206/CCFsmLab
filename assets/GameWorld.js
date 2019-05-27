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
    }
});
