from markdown import markdown as mk
import os

extensions = [  # 根据不同教程加上的扩展
    'extra',
    'codehilite',  # 代码高亮扩展
    'tables',
    'fenced_code',
]

class markdown2Html:
    def __init__(self,name):
        self.article = name

    def render_html(self, path='./static/'):
        p = path + self.article + '.md'

        with open(path + self.article + '.md', mode="r", encoding='UTF-8') as file:
            text = file.read()
            return mk(text, extensions=extensions)




