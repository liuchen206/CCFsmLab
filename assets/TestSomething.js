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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on('mousedown', function (event) {
            var clickPos = new cc.Vec2(event.getLocationX(),event.getLocationY());
            cc.log("clickPos",clickPos.toString());
            // var worldPos = this.mainCameraNode.convertToNodeSpaceAR(clickPos);
            // cc.log("worldPos",worldPos.toString());
            // var newVec2 = this.gameWorldNode.convertToNodeSpaceAR(clickPos);
            // cc.log("newVec2",newVec2.toString());
            // this.crossHair.position = newVec2;
        }, this);
        this.node.on('touchstart', function (event) {
            // var newVec2 = this.gameWorldNode.convertToNodeSpaceAR(new cc.Vec2(event.getLocationX(),event.getLocationY()));
            // this.crossHair.position = newVec2;
        }, this);
    },

    start () {

    },

    // update (dt) {},
});
