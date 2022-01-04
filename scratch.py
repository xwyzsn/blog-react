import json

import requests
from bs4 import BeautifulSoup

from curd import Mongo


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)


def remove_duplicate(k):
    s = set()
    d = {}
    for key, value in k.items():
        if value['time'] in s:
            continue
        else:
            s.add(value['time'])
            d.setdefault(len(s), value)

    return d


class Article():
    def __init__(self, url, proxy):
        self.url = url
        self.proxy = proxy
        self.header = {"User-Agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.1.6) ",
                       "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                       "Accept-Language": "en-us",
                       "Connection": "keep-alive",
                       "Accept-Charset": "GB2312,utf-8;q=0.7,*;q=0.7"}

    def get_body(self):
        return requests.get(self.url, proxies=self.proxy, headers=self.header).content.decode()

    def generate_dict(self):
        r = self.get_body()
        soup = BeautifulSoup(r, 'html.parser')
        l = soup.findAll("article", attrs={'class': 'blog-list-box'})
        meta = {}
        for (index, node) in enumerate(l):
            link_node = node.findAll("a")
            link = link_node[0].attrs['href']
            top = node.findAll("div", attrs={'class': 'blog-list-box-top'})
            detail = node.findAll("div", attrs={'class': 'blog-list-content'})
            article_url = node.findAll("a")
            meta.setdefault(index, {})
            u = article_url[0].attrs['href']
            new_page = requests.get(u, proxies=self.proxy, headers=self.header).content.decode()
            s = BeautifulSoup(new_page, 'html.parser')
            tag_node = s.find("div", attrs={'class': 'tags-box artic-tag-box'})
            time_node = s.find("span", attrs={'class': 'time'})
            time = time_node.string
            tags = [tag.string for tag in tag_node]
            tags = [i for i in tags if i != '\n']
            d = detail[0].text
            t = top[0].contents[0].contents[0]
            meta[index] = {'title': t, 'time': time, 'detail': d, 'tag': {i for i in tags[1:]}, 'link': link}
            meta = remove_duplicate(meta)
        return meta


def run():
    url = 'https://blog.csdn.net/xwyzsn?spm=1001.2101.3001.5343'

    proxy = {
        "http": None,
        "https": None
    }
    headers = {"User-Agent": "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.1.6) ",
               "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
               "Accept-Language": "en-us",
               "Connection": "keep-alive",
               "Accept-Charset": "GB2312,utf-8;q=0.7,*;q=0.7"}
    Art = Article(proxy=proxy, url=url)
    meta_info = Art.generate_dict()
    meta_info = json.dumps(meta_info,default=set_default)
    meta_info = json.loads(meta_info)
    m = Mongo()
    m.insert_article(meta_info, 'xwyzsn')
