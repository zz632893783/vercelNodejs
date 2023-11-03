const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const express = require('express');

const port = process.env.PORT || 4000;
const app = express();

const requestPage = targetURL => axios.get(targetURL).then(response => {
    if (response.status === 200) {
        const htmlText = response.data;
        const $ = cheerio.load(htmlText);
        const meetList = [];
        const normalList = [];
        $('.collapsible-button').each((index, element) => {
            const name = $(element).text();
            const content = $(element).nextAll('.collapsible-content');
            (name.match(/会议版/) ? meetList : normalList).push({
                title: name,
                content: content.html()
            });
        });
        return [meetList, normalList]
    }
}).catch(error => console.error('Error:', error));

app.get('/spider', (request, response) => {
	const [meetList, normalList] = await requestPage('http://10.10.120.211:30819/brain/topic/indexStand/getIndexStandardsHtml');
    res.setHeader('Content-Type', 'text/html');
    const renderHtmlStr = `
        <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    table {
                        border: 1px solid;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    table tr:nth-child(2n) {
                        background-color: #eee;
                    }
                    table tr th {
                        width: 200px;
                        text-align: left;
                        border-bottom: 1px solid;
                        border-right: 1px solid;
                        padding: 20px;
                    }
                    table tr td {
                        border-bottom: 1px solid;
                        padding: 20px;
                    }
                    h4 {
                        cursor: pointer;
                        background-color: #cccc;
                        color: black;
                        padding: 5px 10px;
                        border: none;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="desc">
                    ${ `请求路径
/index/getIndexResult
请求示例
请求头中添加isMock=1走mock数据
请求体
{
    "indexCode": "指标编码",
    "param": {
        "areaCode": "小区编码"
    }
}
响应示例
{
    "status": "200",
    "message": "success",
    "error": null,
    "path": null,
    "timestamp": "2023-07-19 08:40:07",
    "data": {
        "result": {
            "propName": "绿城物业",
            "propContact": "13333333333"
        }
    }
}`.split('\n').map(row => {
    return `<div style="padding-left: ${ row.match(/^ */)[0].length * 6 }px;">${ row }</div>`
}).join('') }
                </div>
                <button onclick="clickFn('meet-container')">会议版</button>
                <br />
                <div class="meet-container" style="display: none;">
                    ${
                        meetList.map(item => {
                            const randomId = parseInt(Math.random() * 0xffffff).toString(16).padStart(6, 0);
                            return `
                                <h4 onclick="showHideTable('table-${ randomId }')">${ item.title }</h4>
                                <div class="tables table-${ randomId }" style="display: none;">${ item.content }</div>
                            `
                        }).join('')
                    }
                </div>
                <button onclick="clickFn('normal-container')">旧版</button>
                <div class="normal-container" style="display: none;">
                    ${
                        normalList.map(item => {
                            const randomId = parseInt(Math.random() * 0xffffff).toString(16).padStart(6, 0);
                            return `
                                <h4 onclick="showHideTable('table-${ randomId }')">${ item.title }</h4>
                                <div class="tables table-${ randomId }" style="display: none;">${ item.content }</div>
                            `
                        }).join('')
                    }
                </div>
            </body>
            <script>
                function clickFn (className) {
                    const container = document.querySelector('.' + className);
                    container.style.display = container.style.display === 'none' ? 'block' : 'none';
                    console.log(123);
                };
                function showHideTable (className) {
                    const tableContainer = document.querySelector('.' + className);
                    tableContainer.style.display = tableContainer.style.display === 'none' ? 'block' : 'none';
                }
            </script>
        </html>
    `;
    // res.write(renderHtmlStr);
    // res.end();
	response.send(renderHtmlStr);
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

module.exports = app;

