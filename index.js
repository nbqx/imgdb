var levelup = require('level'),
    base64 = require('base64-stream'),
    es = require('event-stream');

function imgdb(db){
  if(!(this instanceof imgdb)) return new imgdb(db);
  this.db = levelup(db);
};

imgdb.prototype.put = function(k){
  var self = this;
  var buf = [];
  return es.pipeline(
    base64.encode(),
    es.through(function write(data){
      buf.push(data.toString());
    },function end(){
      var me = this;
      self.db.put(k,buf.join(''),function(){
        me.emit('end');
      });
    })
  );
};

imgdb.prototype.get = function(k){
  var self = this;
  var s = new require('stream').Readable();
  s._read = function(){};
  self.db.get(k,function(err,val){
    if(err){
      return s.emit('error',err);
    }
    s.push(val);
    s.push(null);
  });
  return es.pipeline(s,base64.decode())
};

imgdb.prototype.del = function(k,next){
  var self = this;
  self.db.del(k,function(){
    next();
  });
};

imgdb.prototype.keys = function(opts){
  var self = this;
  var opts = opts || {limit:10, start:0, reverse:true};
  var ret = {};
  ret.keys = [];

  var s = new require('stream').Readable();
  s._read = function(){};
  self.db.createKeyStream(opts).on('data',function(data){
    s.push(data);
  }).on('end',function(){
    s.push(null);
  });
  
  return s.pipe(es.through(function write(data){
    ret.keys.push(data.toString());
  },function end(){
    this.emit('data',JSON.stringify(ret));
    this.emit('end');
  }));
};

module.exports = imgdb;
