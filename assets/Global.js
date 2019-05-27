window.EventCenter = {

    _events: {},

    EventType : {
        TEST_EVENT: "TEST_EVENT",
    },

    AddListener : function(eventname,callback,target){
        if(this._events[eventname] == undefined)
        {
            this._events[eventname] = [];
        }
        this._events[eventname].push({
            callback: callback,
            target: target,
        });
    },

    RemoveListener : function(eventname,callback,target){
        var handlers = this._events[eventname];
        for (var index = handlers.length - 1; index >= 0; index--) {
            var handler = handlers[index];
            if(target == handler.target && callback.toString() == handler.callback.toString())
            {
                this._events[eventname].splice(index, 1);
            };
        }
    },

    RemoveAllListener : function(eventname) {
        if(this._events[eventname] != undefined)
        {
            var handlers = this._events[eventname];
            for (var index = 0; index < handlers.length; index++) {
                handlers[index] = null;
            }
        }
    },

    ResetAllListener : function() {
        for (const key in this._events) {
            if (this._events.hasOwnProperty(key)) {
                delete this._events[key]; 
            }
        }
    },
    
    dispatchEvent : function(eventname,data){
        if(data === undefined){
            data = {'data':'None'};
        }
        if(this._events[eventname] != undefined)
        {
            var handlers = this._events[eventname];
            for (var index = 0; index < handlers.length; index++) {
                var handler = handlers[index];
                handler.callback.call(handler.target,data);
            }
        }
    },
};
window.MapNum = function(targetNum,srcStart,srcEnd,targetStart,targetEnd){
    var srcArea = srcEnd - srcStart;
    var targetArea = targetEnd - targetStart;
    var targetOffset = targetNum - srcStart;
    return targetStart+targetOffset/srcArea*targetArea;
};
window.TruncateByVec2Mag = function(limitMag,vec){
    var vecMag = vec.mag();
    if(limitMag < vecMag){
        return vec.normalize().mul(limitMag);
    }else{
        return vec;
    }
};
window.EnumOfColliderTag = {
    PlayerCollider: 1, // player碰撞器 tag
    ObstacleCollider: 2, // 障碍物碰撞器 tag
    wallCollider: 3, // 墙壁碰撞器 tag
};
window.PlayerInstanceIdManager = {
    currentIDCounter: 0,
    GetAnNewID: function(){
        return window.PlayerInstanceIdManager.currentIDCounter++;
    },
};