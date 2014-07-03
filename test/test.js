var test = require('tape'),
    colorize = require('tap-colorize');

var fs = require('fs'),
    rimraf = require('rimraf');

var imgdb = require(__dirname+'/../'),
    dbPath = __dirname+"/mydb",
    db = imgdb(dbPath);

var imgPath = __dirname+'/fixtures/test.jpg',
    outPath = __dirname+'/out.jpg',
    key = "001";

var ts = test.createStream().on('end',function(){
  fs.unlinkSync(outPath);
  rimraf.sync(dbPath);
});
ts.pipe(colorize()).pipe(process.stdout);

test("put test",function(t){
  t.doesNotThrow(function(){
    fs.createReadStream(imgPath).pipe(db.put(key)).on('end',function(){
      t.end();
    });
  },'alright!');
});

test("get test",function(t){
  var out = fs.createWriteStream(outPath);
  db.get(key).pipe(out);
  out.on('close',function(){
    var a = fs.readFile(imgPath);
    var b = fs.readFile(outPath);
    t.deepEqual(a,b,'it should be same!');
    t.end();
  });
});

test("key not found",function(t){
  db.get("aaa").on('error',function(err){
    t.equal(err.name,"NotFoundError",'should be error');
    t.end();
  });
});

test("keys test",function(t){
  var moreKey = "002";
  fs.createReadStream(imgPath).pipe(db.put(moreKey)).on('end',function(){
    db.keys({start:0,limit:10}).on('data',function(data){
      t.deepEqual(JSON.parse(data).keys,["001","002"],'it should be same!');
      t.end();
    });
  });
});

test("del test",function(t){
  db.del(key,function(){
    db.keys({start:0,limit:10}).on('data',function(data){
      t.deepEqual(JSON.parse(data).keys,["002"],'it should be same!');
      t.end();
    });
  });
});
