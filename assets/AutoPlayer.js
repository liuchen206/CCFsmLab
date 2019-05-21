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
        vVelocity:cc.Vec2,
        vHeading:cc.Vec2,
        vSide:cc.Vec2,
        MaxSpeed:cc.Vec2,
        MaxForce:cc.Vec2,
        Mass:1,
        MaxTurnRate:1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.GameWorldJS = cc.find("Canvas").getComponent('GameWorld');
        this.SteeringBehaviorsJS = this.node.getComponent('SteeringBehaviors');
    },
    TestCallBack: function(data){
        cc.log("data : ",data.data);
    },
    start () {
        // var a = cc.Vec2.UP.rotate(Math.PI/2);
        // var b = cc.Vec2.UP.rotate(90);
        // cc.log('a = ',a.toString());
        // cc.log('b = ',b.toString());

        // var angle = cc.Vec2.UP.signAngle(cc.Vec2.RIGHT);
        // cc.log('angle=',angle);
        // var degree = angle/Math.PI*180;
        // cc.log('degree=',degree);
        // this.node.angle = degree;

        //注册事件
        // EventCenter.AddListener(EventCenter.EventType.TEST_EVENT,this.TestCallBack,this);
        // //派发事件,第二个参数可以是需要传递的数据
        // EventCenter.dispatchEvent(EventCenter.EventType.TEST_EVENT);
        // EventCenter.dispatchEvent(EventCenter.EventType.TEST_EVENT,{'data':"1"});
        // //一定要记得移除事件
        // EventCenter.RemoveListener(EventCenter.EventType.TEST_EVENT,this.TestCallBack,this);
        // //派发事件,第二个参数可以是需要传递的数据
        // EventCenter.dispatchEvent(EventCenter.EventType.TEST_EVENT);
        // EventCenter.dispatchEvent(EventCenter.EventType.TEST_EVENT,{'data':"2"});
    },

    update (dt) {
        // 计算行为合力
        var steeringForce = this.SteeringBehaviorsJS.Calculate();
        steeringForce = steeringForce.clampf(this.MaxForce.mul(-1), this.MaxForce);
        var acc = steeringForce.div(this.Mass);
        this.vVelocity.addSelf(acc.mul(dt));
        this.vVelocity = this.vVelocity.clampf(this.MaxSpeed.mul(-1), this.MaxSpeed);

        var posOffset = this.vVelocity.mul(dt);
        var posNow = this.node.position;
        var posNext = posNow.add(posOffset);
        this.node.position = posNext;

        if(this.vVelocity.mag() > 0.000001){
            this.vHeading = this.vVelocity.normalize();
            this.vSide = this.vHeading.rotate(-Math.PI/2);
        }

        var angle = cc.Vec2.UP.signAngle(this.vHeading);
        var degree = angle/Math.PI*180;
        this.node.angle = degree;
    },
});
