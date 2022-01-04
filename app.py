import json

import schedule
from bson import ObjectId
from flask import Flask
from flask_cors import CORS
from flask import request
from flask import render_template
import Util
import curd
import scratch
from md2html import markdown2Html


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


app = Flask(__name__)
base_url = '/api/flask'

CORS(app)

m = curd.Mongo()


@app.route('/article')
def hello_world():
    return Util.read_files()


@app.route(f'{base_url}/person/<string:username>')
def getPerson(username):
    return json.dumps(m.get_by_username(username=username), cls=JSONEncoder)


@app.route(f'{base_url}/comment/<string:username>/<int:low>/<int:high>')
def getComment(username, low, high):
    return json.dumps(m.get_comment_by_username(username, low, high))


@app.route(f'{base_url}/comment/details/<string:username>')
def getCommentDetails(username):
    return m.get_comment_detail(username)


@app.route(f'{base_url}/comment/prepost', methods=['POST'])
def addNewPost():
    data = request.get_data()
    data = json.loads(data)
    tmp = data['value']  # {'input':'',textArea:'',datetime:''}
    u = tmp['input']
    c = tmp['textArea']
    d = tmp['datetime']
    return m.post_new_comment(u, c, d)


@app.route(f'{base_url}/myarticle/<string:username>/<int:low>/<int:high>')
def getArticleDetail(username, low, high):
    res = m.get_article_detail(username=username)
    res.pop('_id')
    l = []
    for key, value in res.items():
        l.append(value)
    length = len(l)
    if low >= length:
        return str(-1)
    if high > length and low < length:
        return json.dumps(l[low:])
    return json.dumps(l[low:high])


@app.route(f'{base_url}/metaarticle/<string:username>')
def getMetaArticle(username):
    res = m.get_article_detail(username=username)
    res.pop('_id')
    return str(len(res))


@app.route(f'{base_url}/article/<string:article>')
def getArticle(article):
    try:
        md2html = markdown2Html(article)
        h = md2html.render_html()
        return render_template("article.html", h=h)
    except:
        return render_template('404.html')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html')


@app.errorhandler(IOError)
def page_not_found(e):
    return render_template('404.html')


def refresh_article():
    schedule.every().day.at("23:59").do(scratch.run())


if __name__ == '__main__':
    app.run()
    refresh_article()
