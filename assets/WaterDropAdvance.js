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
        vVelocity: {
            default: cc.Vec2.ZERO,
            tooltip: '当前速度',
        },
        vStreeingForce:{
            default: cc.Vec2.ZERO,
            tooltip: '施加的动力',
        },
        MaxForce:{
            default: 750,
            tooltip: '最大施加力',
        },
        MaxSpeed:{
            default: 250,
            tooltip: '最大速度(秒/像素)',
        },
        FrictionForce:{
            default: 5,
            tooltip: '摩擦系数',
        },
        Joystick:cc.Node,
        isManulPlayer:false,
        isDebug:false,
        // blob数据
        blobContainer:cc.Node,
        quality:3,// 节点密度
        nodes :[], // 节点数组
        radius: 85, // 半径
        targetRotation:0, // 期望的旋转角
        dragForceNodeIndex:-1, // 施加力的节点下标
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.JoystickJS = this.Joystick.getComponent('Joystick');
        this.graphics = this.getComponent(cc.Graphics);
        this.InstanceID = PlayerInstanceIdManager.GetAnNewID();
        this.initNodes();
    },

    start () {
        // function test 
        // var arr = [1,2,3,4,5];
        // var ele = this.getArrayElementByOffset(arr,0,-1);
        // cc.log('ele',ele);

        // var objArr = [
        //     {
        //         a:1,
        //     },
        //     {
        //         a:2,
        //     }
        // ];
        // var temp = objArr[0];
        // cc.log('temp.a,objArr[0].a',temp.a,objArr[0].a);
        // temp.a = 10;
        // cc.log('temp.a,objArr[0].a',temp.a,objArr[0].a);
    },
    onDestroy(){
        cc.log('this.InstanceID on destory',this.InstanceID);
    },
    update (dt) {
        this.vStreeingForce = cc.Vec2.ZERO;
        if(this.isManulPlayer){
            this.vStreeingForce = this.JoystickJS.GetForce();
        }else{
            // this.vStreeingForce = this.SteeringBehaviorsJS.Calculate();
        }
        this.vStreeingForce = TruncateByVec2Mag(this.MaxForce,this.vStreeingForce);
        // 摩擦力
        if(this.vVelocity.mag() > 0){
            var frictionDic = this.vVelocity.neg().normalize();
            var frictionForce = frictionDic.mul(this.FrictionForce);
            this.vStreeingForce = this.vStreeingForce.add(frictionForce);
            // cc.log("frictionForce,this.vVelocity,this.vStreeingForce",frictionForce.toString(),this.vVelocity.toString(),this.vStreeingForce.toString());
        }else{

        }
        // 加速度
        var acc = this.vStreeingForce;
        // cc.log("acc",acc.toString());
        this.vVelocity = this.vVelocity.add(acc.mul(dt));
        this.vVelocity = TruncateByVec2Mag(this.MaxSpeed,this.vVelocity);

        // 计算位移
        var posOffset = this.vVelocity.mul(dt);
        var posNow = this.node.position;
        var posNext = posNow.add(posOffset);
        this.node.position = posNext;

        this.wrapWinSize();

        // 当有速度时，设置施力点
        if(this.vVelocity.mag() > 10){
            if(this.dragForceNodeIndex != -1){

            }else{
                var negVelocity = this.vVelocity.neg().normalize();
                var smallestDegree = 180;
                for(var i = 0;i < this.nodes.length;i++){
                    var nodeData = this.nodes[i];
                    var nodeVec = nodeData.pos.normalize();
                    var temp = nodeVec.dot(negVelocity);
                    var tempDegree = Math.acos(temp)/Math.PI*180;
                    if(tempDegree < smallestDegree){
                        smallestDegree = tempDegree;
                        this.dragForceNodeIndex = i;
                    }
                    // cc.log('i,tempDegree,',i,tempDegree);
                }
            }
        }else{
            this.dragForceNodeIndex = -1;
        }

        this.updateBlob();

        // 融合检测
        var allBlobNodeList = this.getAllBlobNodeWithoutSelf(9999); 
        for(var i= 0;i<allBlobNodeList.length;i++){
            var anCheckBlobJS = allBlobNodeList[i].getComponent('WaterDropAdvance');
            var distanceWithTwoNode = anCheckBlobJS.node.position.sub(this.node.position).mag();
            if(distanceWithTwoNode <= this.radius + anCheckBlobJS.radius){
                if(this.radius > anCheckBlobJS.radius){
                    if(anCheckBlobJS.nodes.length > 0){
                        this.merge(anCheckBlobJS.node);
                    }
                }
            }
        }
},
    wrapWinSize(){
        if(this.node.x > cc.winSize.width/2){
            this.node.x = cc.winSize.width/2;
        }
        if(this.node.x < -cc.winSize.width/2){
            this.node.x = -cc.winSize.width/2;
        }
        if(this.node.y > cc.winSize.height/2){
            this.node.y = cc.winSize.height/2;
        }
        if(this.node.y < -cc.winSize.height/2){
            this.node.y = -cc.winSize.height/2;
        }
    },
    initNodes(){
        this.nodes = [];
        for(var i = 0;i<this.quality;i++){
            var node = {
                normal: cc.Vec2.ZERO,
                normalTarget: cc.Vec2.ZERO,
                ghost: cc.Vec2.ZERO,
                pos: cc.Vec2.ZERO,
                joints:[],
                angle:0,
            }
            this.nodes.push(node);
        }
        this.updateJoints();
        this.updateNormals();
    },
    updateJoints(){
        this.strength = 0.4;
        for(var i =0;i<this.quality;i++){
            var nodeData = this.nodes[i];
            nodeData.joints = [];
            nodeData.joints.push({
                node:this.getArrayElementByOffset(this.nodes,i,-1),
                strength:this.strength,
                strain: cc.Vec2.ZERO,
            });
            nodeData.joints.push({
                node:this.getArrayElementByOffset(this.nodes,i,1),
                strength:this.strength,
                strain: cc.Vec2.ZERO,
            });
            if(this.quality > 4){
                nodeData.joints.push({
                    node:this.getArrayElementByOffset(this.nodes,i,-2),
                    strength:this.strength,
                    strain: cc.Vec2.ZERO,
                });
                nodeData.joints.push({
                    node:this.getArrayElementByOffset(this.nodes,i,2),
                    strength:this.strength,
                    strain: cc.Vec2.ZERO,
                }); 
            }
            if(this.quality > 8){
                nodeData.joints.push({
                    node:this.getArrayElementByOffset(this.nodes,i,-3),
                    strength:this.strength,
                    strain: cc.Vec2.ZERO,
                });
                nodeData.joints.push({
                    node:this.getArrayElementByOffset(this.nodes,i,3),
                    strength:this.strength,
                    strain: cc.Vec2.ZERO,
                }); 
            }
        }
    },
    updateNormals(){ 
        for(var i = 0; i< this.quality;i++){
            var nodeData = this.nodes[i];
            var newIndex = i;
            if(this.dragForceNodeIndex != -1){
                newIndex = i - Math.round(this.dragForceNodeIndex);
                newIndex = newIndex<0?this.quality+newIndex:newIndex;
            }else{
                newIndex = i;
            }
            nodeData.angle = newIndex/this.quality*Math.PI*2 + this.targetRotation;
            nodeData.normalTarget.x = Math.cos(nodeData.angle)*this.radius;
            nodeData.normalTarget.y = Math.sin(nodeData.angle)*this.radius;
            if(nodeData.normal.x === 0 && nodeData.normal.y === 0){
                nodeData.normal.x = nodeData.normalTarget.x;
                nodeData.normal.y = nodeData.normalTarget.y;
            }
        }
    },
    updateBlob(){
        var currentGraphicsStyle = graphicsStyle[this.isDebug?1:0];
        this.graphics.clear();

        if(this.nodes.length < 3){
            return;
        }
        // 提前设置了绘图的样式
        if(!currentGraphicsStyle.debug){
            this.graphics.strokeColor = currentGraphicsStyle.strokeStyle;
            this.graphics.fillColor = currentGraphicsStyle.fillStyle;
            this.graphics.lineWidth = currentGraphicsStyle.lineWidth;
        }
         // 将上一帧的节点位置保存
        for(var i = 0;i < this.nodes.length;i++){
            var nodeData = this.nodes[i];
            nodeData.ghost.x = nodeData.pos.x;
            nodeData.ghost.y = nodeData.pos.y;
        }
        // 如果有施力点则变换旋转角度
        if(this.nodes[this.dragForceNodeIndex]){
            var negVelocity = this.vVelocity.neg().normalize();
            this.targetRotation = Math.atan2(negVelocity.y,negVelocity.x);
            this.node.angle += (this.targetRotation - this.node.angle)*0.5;
            this.updateNormals();
        }
        // 重新计算节点位置
        for(var i = 0;i < this.nodes.length;i++){
            var nodeData = this.nodes[i];
            nodeData.normal.x += (nodeData.normalTarget.x-nodeData.normal.x)*0.05;
            nodeData.normal.y += (nodeData.normalTarget.y-nodeData.normal.y)*0.05;
            var newNodePos = cc.Vec2.ZERO;
            for(var j = 0;j<nodeData.joints.length;j++){
                var jointsData = nodeData.joints[j];
                var transY = jointsData.node.ghost.y - nodeData.ghost.y-(jointsData.node.normal.y-nodeData.normal.y);
                var transX = jointsData.node.ghost.x - nodeData.ghost.x-(jointsData.node.normal.x-nodeData.normal.x);
                jointsData.strain.x += (transX-jointsData.strain.x)*0.3;
                jointsData.strain.y += (transY-jointsData.strain.y)*0.3;
                newNodePos.x += jointsData.strain.x*jointsData.strength;
                newNodePos.y += jointsData.strain.y*jointsData.strength;
            }
            newNodePos.x += nodeData.normal.x;
            newNodePos.y += nodeData.normal.y;
            // 重新计算节点时加入施力点的影响
            var beforeDragIndex = this.getArrayIndexByOffset(this.nodes,this.dragForceNodeIndex,-1);
            var afterDragIndex = this.getArrayIndexByOffset(this.nodes,this.dragForceNodeIndex,1);
            if(this.dragForceNodeIndex != -1 && (i==this.dragForceNodeIndex||this.nodes.length>=8&&(i==beforeDragIndex||i==afterDragIndex))){
                var ratio = i == this.dragForceNodeIndex?0.7:0.5;
                var times = MapNum(this.vVelocity.mag(),0,this.MaxSpeed,0,this.radius*4);
                var negVelocity = this.vVelocity.neg().normalize().mul(times);
                newNodePos.x += (negVelocity.x-newNodePos.x)*ratio;
                newNodePos.y += (negVelocity.y-newNodePos.y)*ratio;
            }
            nodeData.pos.x += (newNodePos.x - nodeData.pos.x)*0.1;
            nodeData.pos.y += (newNodePos.y - nodeData.pos.y)*0.1;
        }
        // 绘制节点结果
        var lastNode = this.getArrayElementByOffset(this.nodes,0,-1);
        var firstNode = this.getArrayElementByOffset(this.nodes,0,0);
        this.graphics.moveTo(lastNode.pos.x + (firstNode.pos.x-lastNode.pos.x)/2,lastNode.pos.y + (firstNode.pos.y-lastNode.pos.y)/2);
        for(var i =0;i<this.nodes.length;i++){
            lastNode = this.getArrayElementByOffset(this.nodes,i,0);
            firstNode = this.getArrayElementByOffset(this.nodes,i,1);
            if(currentGraphicsStyle.debug){
                for(var j = 0; j<lastNode.joints.length;j++){
                    var jointNode = lastNode.joints[j];
                    this.graphics.strokeColor = cc.Color.WHITE;
                    this.graphics.moveTo(lastNode.pos.x,lastNode.pos.y);
                    this.graphics.lineTo(jointNode.node.pos.x,jointNode.node.pos.y);
                    this.graphics.stroke();
                }
                if(i == this.dragForceNodeIndex){
                    this.graphics.strokeColor = cc.Color.GREEN;
                }else{
                    this.graphics.strokeColor = cc.Color.WHITE;
                }
                this.graphics.circle(lastNode.pos.x,lastNode.pos.y,5);
                this.graphics.stroke();
            }else{
                this.graphics.quadraticCurveTo(lastNode.pos.x, lastNode.pos.y, lastNode.pos.x + (firstNode.pos.x - lastNode.pos.x) / 2, lastNode.pos.y + (firstNode.pos.y - lastNode.pos.y) / 2);
                this.graphics.stroke();
                this.graphics.fill();
            }
        }
    },
    merge(nodeToMerge){
        this.vVelocity = this.vVelocity.mul(0.5);
        var nodeTomergeJS = nodeToMerge.getComponent('WaterDropAdvance');
        this.vVelocity.x += nodeTomergeJS.vVelocity.x*0.5;
        this.vVelocity.y += nodeTomergeJS.vVelocity.y*0.5;
        
        var nestestNodeIndexOnThisNode = null;
        var nestestdistanceOnThis = 9999;
        for(var i= 0;i < this.nodes.length;i++){
            var vectAInWorld = this.node.convertToWorldSpaceAR(this.nodes[i].pos);
            var vectBInWorld = nodeTomergeJS.node.parent.convertToWorldSpaceAR(nodeTomergeJS.node.position);
            var tempDistance = vectAInWorld.sub(vectBInWorld).mag();
            if(tempDistance < nestestdistanceOnThis){
                nestestdistanceOnThis = tempDistance;
                nestestNodeIndexOnThisNode = i;
            }
        }
        var nearestDragNode = this.getArrayElementByOffset(this.nodes,nestestNodeIndexOnThisNode,0);
        nearestDragNode.pos = nearestDragNode.pos.add(nearestDragNode.pos.normalize().mul(nodeTomergeJS.radius*2));

        while(nodeTomergeJS.nodes.length > 0){
            // this.nodes.push(nodeTomergeJS.nodes.shift());
            nodeTomergeJS.nodes.shift();
            // cc.log('nodeTomergeJS.nodes.length',nodeTomergeJS.nodes.length);
        }
        this.quality = this.nodes.length;
        this.radius += nodeTomergeJS.radius/4;
        // this.dragForceNodeIndex = nodeTomergeJS.dragForceNodeIndex==-1?nodeTomergeJS.dragForceNodeIndex:this.dragForceNodeIndex;
        this.updateNormals();
        this.updateJoints();
        nodeTomergeJS.node.destroy();
    },
    getAllBlobNodeWithoutSelf(radius){
        var allNodeInCanvas = this.blobContainer.children;
        var playerList = [];
        for(var i = 0;i < allNodeInCanvas.length;i++){
            if(allNodeInCanvas[i].getComponent('WaterDropAdvance') !== null){
                if(allNodeInCanvas[i].getComponent('WaterDropAdvance').InstanceID !== this.InstanceID){
                    if(allNodeInCanvas[i].position.sub(this.node.position).mag()<=radius){
                        playerList.push(allNodeInCanvas[i]);
                    }
                }
            }
        }
        return playerList;
    },
    getArrayElementByOffset(arr, startIndex, offset) {
        return arr[this.getArrayIndexByOffset(arr, startIndex, offset)]
    },
    getArrayIndexByOffset(arr, startIndex, offset) {
        if (arr[startIndex + offset]) return startIndex + offset;
        if (startIndex + offset > arr.length - 1) return startIndex - arr.length + offset;
        if (startIndex + offset < 0) return arr.length + (startIndex + offset);
    }
});
