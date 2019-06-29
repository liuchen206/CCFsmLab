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
        MaxSpeed:200,
        Direction:cc.Vec2.UP,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    update (dt) {
        var velocity = this.Direction.mul(this.MaxSpeed);
        var posOffset = velocity.mul(dt);
        this.node.x += posOffset.x;
        this.node.y += posOffset.y;
    },
    onCollisionEnter: function (other, self) {
        this.node.destroy();
    },
});
