// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var noise = require('perlin')
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
        pursuitTarget:cc.Node,
        evadeTarget:cc.Node,
        beSeek:false,
        beFlee:false,
        beArrive:false,
        bePursuit:false,
        beEvade:false,
        beWander:false,
        vSteeringForce:cc.Vec2,
        elapseTime:0,
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.AutoPlayerJS = this.node.getComponent('AutoPlayer');
    },

    start () {
        // cc.log('MapNum：：',MapNum(50,0,100,50,100));
        // cc.log('MapNum：：',MapNum(0,-50,50,0,100));

        noise.seed(Math.random());
    },

    update (dt) {
        this.elapseTime += dt;
    },

    Calculate(){
        this.vSteeringForce = cc.Vec2.ZERO;
        if(this.beSeek){
            this.vSteeringForce.addSelf(this.Seek(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.beFlee){
            this.vSteeringForce.addSelf(this.Flee(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.beArrive){
            this.vSteeringForce.addSelf(this.Arrive(this.AutoPlayerJS.GameWorldJS.crossHair.position));
        }
        if(this.bePursuit){
            this.vSteeringForce.addSelf(this.Pursuit(this.pursuitTarget.getComponent('AutoPlayer')));
        }
        if(this.beEvade){
            this.vSteeringForce.addSelf(this.Evade(this.evadeTarget.getComponent('AutoPlayer')));
        }
        if(this.beWander){
            this.vSteeringForce.addSelf(this.Wander());
        }
        return this.vSteeringForce;
    },
    Seek(targetPos){
        var desiredVelocity = (targetPos.sub(this.AutoPlayerJS.node.position)).normalize().mul(this.AutoPlayerJS.MaxSpeed);
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Flee(targetPos){
        var desiredVelocity = (targetPos.sub(this.AutoPlayerJS.node.position)).normalize().mul(this.AutoPlayerJS.MaxSpeed);
        desiredVelocity.negSelf();
        return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
    },
    Arrive(targetPos){
        var toTargetVec2 = targetPos.sub(this.AutoPlayerJS.node.position);
        var toTargetDis = toTargetVec2.mag();
        var subSpeedRadio = 200;
        if(toTargetDis > subSpeedRadio){
            var desiredVelocity = toTargetVec2.normalize().mul(this.AutoPlayerJS.MaxSpeed);
            return desiredVelocity.sub(this.AutoPlayerJS.vVelocity);
        }else{
            if(toTargetDis > 5){
                var subSpeed = MapNum(toTargetDis,0,subSpeedRadio,0,this.AutoPlayerJS.MaxSpeed);
                var desiredVelocity = toTargetVec2.normalize().mul(subSpeed);
                return desiredVelocity.sub(this.AutoPlayerJS.vVelocity).mul(50);
            }else{
                this.AutoPlayerJS.vVelocity = cc.Vec2.ZERO;
                return cc.Vec2.ZERO;
            }
        }
    },
    Pursuit(evader){
        var toPursuitPlayer = evader.node.position.sub(this.AutoPlayerJS.node.position);
        if(toPursuitPlayer.dot(this.AutoPlayerJS.vHeading) > 0 && this.AutoPlayerJS.vHeading.dot(evader.vHeading) <-0.95){
            return this.Seek(evader.node.position);
        }
        var lookAhead = toPursuitPlayer.mag()/(this.AutoPlayerJS.MaxSpeed + evader.vVelocity.mag());
        return this.Seek(evader.node.position.add(evader.vVelocity.mul(lookAhead)));
    },
    Evade(pursuer){
        var toPursuer = pursuer.node.position.sub(this.AutoPlayerJS.node.position);
        var threatRange = 200;
        if(toPursuer.mag() > threatRange){
            return cc.Vec2.ZERO;
        }
        var lookAhead = toPursuer.mag()/(this.AutoPlayerJS.MaxSpeed + pursuer.vVelocity.mag());
        return this.Flee(pursuer.node.position.add(pursuer.vVelocity.mul(lookAhead)));
    },
    Wander(){
        var berlinX = noise.perlin2(this.elapseTime,this.elapseTime);  
        var berlinY = noise.perlin2(-this.elapseTime,-this.elapseTime);  
        var randomForceX = MapNum(berlinX,-1,1,-this.AutoPlayerJS.MaxForce,this.AutoPlayerJS.MaxForce);
        var randomForceY = MapNum(berlinY,-1,1,-this.AutoPlayerJS.MaxForce,this.AutoPlayerJS.MaxForce);
        return new cc.Vec2(randomForceX,randomForceY);
    }
});
