// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

// var noise = require('perlin')
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
        MaxSpeed:200,
        MaxForce:200,
        Mass:1,
        rigidbody:cc.RigidBody,
        InstanceID:0,
        currentPathNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.GameWorldJS = cc.find("Canvas").getComponent('GameWorld');
        this.SteeringBehaviorsJS = this.node.getComponent('SteeringBehaviors');
        this.InstanceID = PlayerInstanceIdManager.GetAnNewID();
    },
    TestCallBack: function(data){
        cc.log("data : ",data.data);
    },
    start () {      
        // noise.seed(Math.random());
        // cc.log('noise0',noise.perlin2(0,0))
        // cc.log('noise0.1',noise.perlin2(0.1,0))

        // cc.log("dot ::",cc.Vec2.UP.dot(cc.Vec2.UP.rotate(Math.PI/4))); 

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

        // cc.log('PlayerInstanceIdManager',PlayerInstanceIdManager.GetAnNewID());
    },

    update (dt) {
        // var from = new cc.Vec2(0,0);
        // var to = new cc.Vec2(100,0);
        // var lerpNum = from.lerp(to,dt);
        // cc.log('lerpNum,',lerpNum.toString());

        steeringForce = cc.Vec2.ZERO;
        // 计算行为合力
        var steeringForce = this.SteeringBehaviorsJS.Calculate();
        steeringForce = TruncateByVec2Mag(this.MaxForce,steeringForce);
        // cc.log('steeringForce=',steeringForce.toString()); 
        var acc = steeringForce.div(this.Mass);
        // 计算瞬时速度
        this.vVelocity.addSelf(acc.mul(dt));
        this.vVelocity = TruncateByVec2Mag(this.MaxSpeed,this.vVelocity);
        // 计算位移，使其移动
        // var posOffset = this.vVelocity.mul(dt);
        // var posNow = this.node.position;
        // var posNext = posNow.add(posOffset);
        // this.node.position = posNext;
        // 计算刚体线性速度，使其移动
        this.rigidbody.linearVelocity = this.vVelocity;
        // 施加力，使其移动
        // this.rigidbody.applyForceToCenter(steeringForce);

        // var posInGraphics = this.SteeringBehaviorsJS.graphics.node.convertToNodeSpaceAR(this.node.parent.convertToWorldSpaceAR(steeringForce));
        // this.SteeringBehaviorsJS.graphics.clear();
        // this.SteeringBehaviorsJS.graphics.strokeColor = cc.Color.GREEN;
        // this.SteeringBehaviorsJS.graphics.moveTo(0, 0);
        // this.SteeringBehaviorsJS.graphics.lineTo(posInGraphics.x,posInGraphics.y);
        // this.SteeringBehaviorsJS.graphics.stroke();

        // 计算朝向（向量）
        if(this.rigidbody.linearVelocity.mag() > 1){
            // 计算朝向（角度）
            var angle = cc.Vec2.UP.signAngle(this.rigidbody.linearVelocity.normalize());
            var degree = angle/Math.PI*180;
            this.node.angle = degree;
        }
        var angle = this.node.angle*Math.PI/180;
        this.vHeading =  cc.Vec2.UP.rotate(angle);

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
    },
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        // cc.log('onBeginContact');
        // var worldManifold = contact.getWorldManifold();
        // var points = worldManifold.points;
        // var normal = worldManifold.normal;
        // cc.log('contact data ',points.length,normal.toString(),selfCollider.tag,otherCollider.tag);
    },
    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
        // cc.log('onEndContact');
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
        // cc.log('onPreSolve');
    },
    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
        // cc.log('onPostSolve');
    }
});
