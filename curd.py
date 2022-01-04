import json
import Util
import urllib.parse
from pymongo import MongoClient

host = "api.xwyzsn.site"
port = 27017

user_name = "xwyzsn"
pass_word = "zzh0117"
db_name = "xwyzsn"


class Mongo():
    def __init__(self):
        self.client = MongoClient(f'mongodb://{user_name}:{urllib.parse.quote_plus(pass_word)}@{host}:{port}/{db_name}')
        self.db = self.client["xwyzsn"]
        self.coll = self.db["mysite"]
        self.comments_collection = self.db["comments"]
        self.new_comment = self.db["new_comments"]
        self.article = self.db['article']

    def insert_article(self, data, username):
        data['_id'] = username
        if self.article.find_one({'_id':'xwyzsn'}):
            try:
                res = self.article.replace_one({'_id':'xwyzsn'},data)
            except AssertionError:
                print("can't replace data database")
        else:
            try:
                res = self.article.insert_one(data)
            except AssertionError:
                print("can't insert new one")

    def get_by_username(self, username):
        doc = self.coll.find_one({"username": username})

        return doc

    def get_article_detail(self, username):

        return self.article.find_one({"_id": username})

    def get_comment_by_username(self, username, low, high):
        comments = self.comments_collection.find_one({"username": username})
        l = self.get_comment_detail(username)
        if high > int(l):
            high = int(l)
        if low >= int(l):
            return 0
        com = comments['comment'][low:high]
        return com

    def get_comment_detail(self, username):
        comments = self.comments_collection.find_one({"username": username})
        com = comments['comment']
        return json.dumps(len(com))

    def test(self):
        print(self.db.list_collection_names())

    def post_new_comment(self, u, c, d):
        res = self.new_comment.insert_one({"username": u, "comment": c, "datetime": d})
        if res:
            return Util.return_code('success', 200)
        else:
            return Util.return_code('unable to insert ', 404)


if __name__ == '__main__':
    m = Mongo()
    # com = m.get_comment_by_username('xwyzsn')
    # print(com['comment'])
    f = open('H:/desktop/m.json', mode='r', encoding='UTF-8')
    content = f.read()
    data = json.loads(content)
    m.insert_article(data,'xwyzsn')
