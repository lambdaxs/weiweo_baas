/**
 * Created by xiaos on 17/4/1.
 */

const lodash = require('lodash');

const event_data_model = require('./event_data');

const moment = require('moment');
moment.locale('zh-cn');

const get_date = (timestamp)=>{
    let date = {};
    const time = moment.unix(timestamp);

    const day = time.format('LL');
    const day_week = time.day();
    date.day = `${day}(${day_week})`;

    date.week = time.week();
    date.month = time.month()+1;

    return date;
};

const get_questions = ()=>{
    let arr = [];
    for (let start = 100;start< 200;start++){
        let q = {};
        q.question_id = start;
        q.title = `有哪些明星/演员让您觉得惋惜呢？${start}`;
        arr.push(q);
    }
    return arr;
};

const get_users = ()=>{
    let arr = [];
    for (let i=1000;i<1200;i++){
        let user = {};
        user.name = `xiao${i}`;
        user.age = Math.floor(Math.random()*50);
        user.department = i%2 === 0?'it':'sell';
        user.sex = i%2 !== 0?'男':'女';
        user.join_time = 1456543765 + i*3000;
        user.location = i%2 === 0?'二层':'三层';
        arr.push(user);
    }
    return arr;
};

const get_event_attr = (qs,us)=>{
    return lodash.merge(qs,us);
};

const times = [1488511765,1488598165,1488684565,1488770965,1488857365,1488943765,1489030165,1489116565,1489202965,1489289365,1489375765,1489462165,1485919765,1486006165,1486092565,1486178965,1487129365,1488166165];

const rs = get_event_attr(get_questions(),get_users()).map((event_attr,index)=>{
    let data = {
        event:'new_question',
        timestamp:times[index%times.length],
    };
    data.date = get_date(data.timestamp);
    data.event_attr = event_attr;
    return data;
});
//
// (async()=>{
//     const r = await event_data_model('analysis_question').create(rs);
//     console.log(r);
// })();





const new_question = {
    id:123,
    _id:123,
    uid:234,
    unique_id:234,
    event_name:'new_question',
    timestamp:1435353421,
    event_attr:{
        question_id:789,
        title:'如何看待清明节烧纸扫墓？',
        name:'xiaos',
        age:22,
        department:'it',
        sex:'男',
        join_time:14542234,
        location:'二层'
    },
    date:{
        day:'10月1日(6)',
        week:40,
        month:10,
        hour:'10月1日(3)'
    }
};

const new_answer = {
    id:2143213,
    _id:2143213,
    uid:1234,
    unique_id:1234,
    event_name:'new_answer',
    timestamp:1435353421,
    event_attr:{
        questions_id:789,
        answer_id:7891,
        content:'传统文化~',
        name:'xiaos1',
        age:23,
        department:'sell',
        sex:'男',
        join_time:14542234,
        location:'一层'
    },
    date:{
        day:'10月1日(6)',
        week:40,
        month:10,
        hour:'10月1日(3)'
    }
};

const new_message = {
    id:2143213,
    _id:2143213,
    uid:1234,
    unique_id:1234,
    event_name:'new_message',
    timestamp:1435353421,
    event_attr:{
        questions_id:789,
        message_id:7892,
        content:'这是一条留言',
        name:'xiaos1',
        age:23,
        department:'sell',
        sex:'男',
        join_time:14542234,
        location:'一层'
    },
    date:{
        day:'10月1日(6)',
        week:40,
        month:10,
        hour:'10月1日(3)'
    }
};





