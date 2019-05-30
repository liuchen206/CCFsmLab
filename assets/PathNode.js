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
        pathCollider:cc.PolygonCollider,
        pathPointsInGameWorld:[],
        graphics:cc.Graphics,
        pointIndex:0,
        isPathDoCircle:true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var pointListInColider = this.pathCollider.points;
        cc.log(" pointListInColider.length", pointListInColider.length);
        for(var i = 0;i < pointListInColider.length;i++){
            var pointInGlobal = this.node.convertToWorldSpaceAR(pointListInColider[i]);
            var pointInGameWorld = cc.find("Canvas/GameView/GameWorld").convertToNodeSpaceAR(pointInGlobal);
            this.pathPointsInGameWorld.push(pointInGameWorld);
        }
    },

    start () {
    },

    update (dt) {
        this.graphics.clear();
        for(var i = 0; i < this.pathCollider.points.length;i++){
            this.graphics.strokeColor = cc.Color.GREEN;
            this.graphics.circle(this.pathCollider.points[i].x, this.pathCollider.points[i].y, 5);
        }
        this.graphics.stroke();
    },

    getCurrentPoint(){
        if(this.pathPointsInGameWorld.length > this.pointIndex){
            return this.pathPointsInGameWorld[this.pointIndex];
        }else{
            return null;
        }
    },
    goNextPoint(){
        this.pointIndex++;
        if(this.pathPointsInGameWorld.length > this.pointIndex){
            return this.pathPointsInGameWorld[this.pointIndex];
        }else{
            // 意味着路径已经走到头
            if(this.isPathDoCircle){
                this.pointIndex = 0;
                return this.pathPointsInGameWorld[this.pointIndex];
            }else{
                return null;
            }
        }
    },
    isFinshed(){
        if(this.pathPointsInGameWorld.length - 1 === this.pointIndex && this.isPathDoCircle === false){
            return true;
        }else{
            return false;
        }
    }
});
