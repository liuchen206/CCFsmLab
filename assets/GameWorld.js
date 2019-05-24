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
});
