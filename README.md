## imgdb

leveldb-based easy blob database

## usage

    $ npm install git://github.com/nbqx/imgdb.git

then

```js
var fs = require('fs');
var imgdb = require(__dirname+'/');

var db = imgdb(__dirname+'/mydb'),
    key = "my-picture";

// put
fs.createReadStream(__dirname+'/test/fixtures/test.jpg').pipe(db.put(key));

// get
var img = fs.createWriteStream(__dirname+'/out.jpg');
db.get(key).pipe(img);

// keys
// see: https://github.com/rvagg/node-levelup#dbcreatereadstreamoptions
var opts = {start:0,limit:10};
db.keys(opts).on('data',function(data){
  console.log(data);
});

// del
db.del(key,function(){
  console.log(key+' is removed');
});
```
