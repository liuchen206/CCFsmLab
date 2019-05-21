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
        MaxSpeed:200,
        MaxForce:200,
        Mass:1,
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
        steeringForce = cc.Vec2.ZERO;
        // 计算行为合力
        var steeringForce = this.SteeringBehaviorsJS.Calculate();
        steeringForce = TruncateByVec2Mag(this.MaxForce,steeringForce);
        // cc.log('steeringForce=',steeringForce.toString()); 
        var acc = steeringForce.div(this.Mass);
        this.vVelocity.addSelf(acc.mul(dt));
        this.vVelocity = TruncateByVec2Mag(this.MaxSpeed,this.vVelocity);

        var posOffset = this.vVelocity.mul(dt);
        var posNow = this.node.position;
        var posNext = posNow.add(posOffset);
        this.node.position = posNext;

        if(this.vVelocity.mag() > 0.1){
            this.vHeading = this.vVelocity.normalize();
            this.vSide = this.vHeading.rotate(-Math.PI/2);
        }

        var angle = cc.Vec2.UP.signAngle(this.vHeading);
        var degree = angle/Math.PI*180;
        this.node.angle = degree;

        this.wrapWinSize();
    },

    wrapWinSize(){
        if(this.node.x > cc.winSize.width/2){
            this.node.x = -cc.winSize.width/2;
        }
        if(this.node.x < -cc.winSize.width/2){
            this.node.x = cc.winSize.width/2;
        }
        if(this.node.y > cc.winSize.height/2){
            this.node.y = -cc.winSize.height/2;
        }
        if(this.node.y < -cc.winSize.height/2){
            this.node.y = cc.winSize.height/2;
        }
    }
});