const Koa = require('koa');

var app=new Koa();

const router = require('koa-router')();
const url = require('url'); //解析操作url
const superagent = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy');

var targetUrl='https://juejin.im/zhuanlan/frontend';

var _res=[];

(async () => {
    superagent.get(targetUrl).end(function (err, res) {
        var $=cheerio.load(res.text);
        var topicUrls=[];
        $('#juejin ul li').each(function(idx,element){
            var $ele=$(element);
            topicUrls.push($ele.find('.column-entry') || {});
        });
        var _ep=new eventproxy();
        _ep.after('topic_html',topicUrls.length,function(options){
            options=options.map(function(o){
                var topicUrl=o[0];
                var topic_html=o[1];
                var $ = cheerio.load(topic_html);
                return ({
                    username:$('.username').text(),
                    pushtime:$('.date').text(),
                    maintitle:$('.title').text(),
                    sectitle:$('.abstract .with-thumb').text()
                });
            });
            console.log(options);
        });
        topicUrls.forEach(function (topicUrl) {
            superagent.get(topicUrl)
                .end(function (err, res) {
                    console.log('fetch ' + topicUrl + ' successful');
                    _ep.emit('topic_html', [topicUrl, res.text]);
                });
        });
    });
})();


// router.get('/', async (ctx, next) => {
//     await next();
//     ctx.type = 'html/plain';
//     var _img = '';
//     _res.forEach(function (item) {
//         if(item)
//              _img += `<img src=${item}></img>`;
//     });
//     ctx.body = '<img></img>';
// });

app.use(router.routes());

app.listen(3001);

