/**
 * Created by xiaos on 17/4/5.
 */


const head = function (arr) {
    return (!arr || arr.length == 0) ?null: arr[0]
};

const tail = function (arr) {
    const  isString = typeof arr === 'string';
    if (isString){
        arr = arr.split('');
    }
    const rs = !arr || arr.length == 0? []: arr.slice(1);
    if (isString){
        return rs.join('');
    }
    return rs
};

const id = (elem)=>{
    return elem;
};

//{x,xs}表示：数组的第一个元素x和后续剩下的元素xs [id]-> id:[id]
const caseof = (arr)=>{
    const x = head(arr);
    const xs = tail(arr);
    return {
        x,
        xs
    }
};

//获取数组长度 [id]->Int
const get_length = (arr)=>{
    const {x,xs} = caseof(arr);
    if (x == null){
        return 0;
    }else {
        return 1 + get_length(xs);
    }
};

//获取数组的最后一个元素 [id]->id
const last = (arr)=>{
    const {x,xs} = caseof(arr);
    if (get_length(xs) === 0){
        return x;
    }
    return last(xs);
};

//获取列表的开始（除去最后一个元素） [id]->[id]
const init = (arr)=>{
    const {x,xs} = caseof(arr);
    if (x === null){
        return [];
    }else {
        return xs;
    }
};

//获取列表的前n个元素 [id]->[id]
const take = (arr,n)=>{
    if (n<0 || typeof n === 'undefined'){
        return [];
    }
    if (n >= get_length(arr)){
        return arr;
    }
    const {x,xs} = caseof(arr);
    if (n === 1){
        return [x];
    }else {
        return [x].concat(take(xs,n-1));
    }
};

//丢弃前面n个元素
const drop = (arr,n)=>{
    if (n<0 || typeof n === 'undefined'){
        return arr;
    }
    if (n >= get_length(arr)){
        return [];
    }

    const {_,xs} = caseof(arr);
    if (n === 1){
        return xs;
    }else {
        return drop(xs,n-1);
    }
};

const splitAt = (arr,n)=>{
    const pre = take(arr,n);
    const last = drop(arr,n);
    return [pre,last];
};

