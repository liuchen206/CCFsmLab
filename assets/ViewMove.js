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
        followNode:cc.Node,
        BGNode:cc.Node,
        WorldViewNode:cc.Node,
        mainCameraNode:cc.Node,
        cameraInnerArea:cc.Rect,
        cameraOutterArea:cc.Rect,
        graphics:cc.Graphics,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var innerWidth = cc.winSize.width/4;
        var innerheight = cc.winSize.height/4;
        var outterWidth = this.BGNode.width - (cc.winSize.width - innerWidth); 
        var outterHeight = this.BGNode.height - (cc.winSize.height - innerheight); 
        this.cameraInnerArea = new cc.Rect(-innerWidth/2,-innerheight/2,innerWidth,innerheight);
        this.cameraOutterArea = new cc.Rect(-outterWidth/2,-outterHeight/2,outterWidth,outterHeight);
    },

    start () {
    },

    update (dt) {
        this.graphics.clear();
        this.graphics.strokeColor = cc.Color.GREEN;
        this.graphics.rect(this.cameraInnerArea.x,this.cameraInnerArea.y,this.cameraInnerArea.width,this.cameraInnerArea.height);
        this.graphics.rect(this.cameraOutterArea.x,this.cameraOutterArea.y,this.cameraOutterArea.width,this.cameraOutterArea.height);
        this.graphics.stroke();
        this.graphics.stroke();

        var posInWorld = this.followNode.parent.convertToWorldSpaceAR(this.followNode.position);
        var posInNode = this.node.convertToNodeSpaceAR(posInWorld);
        if(posInNode.x < this.cameraInnerArea.x && posInNode.x > this.cameraOutterArea.x){
            this.mainCameraNode.x = posInNode.x - this.cameraInnerArea.x;
        }
        if(posInNode.x > -this.cameraInnerArea.x && posInNode.x < -this.cameraOutterArea.x){
            this.mainCameraNode.x = posInNode.x + this.cameraInnerArea.x;
        }
        if(posInNode.y < this.cameraInnerArea.y && posInNode.y > this.cameraOutterArea.y){
            this.mainCameraNode.y = posInNode.y - this.cameraInnerArea.y;
        }
        if(posInNode.y > -this.cameraInnerArea.y && posInNode.y < -this.cameraOutterArea.y){
            this.mainCameraNode.y = posInNode.y + this.cameraInnerArea.y;
        }

    },
});
