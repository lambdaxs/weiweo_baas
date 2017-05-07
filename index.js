/**
 * Created by xiaos on 17/3/30.
 */
const app = require('express')();

app.get('/',(req,res)=>{
    res.send('hello world');
});

app.listen(8080,()=>{
    console.log('start');
});

