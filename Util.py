import json
import os
import markdown


def get_files(path="./static"):
    files = os.listdir(path)
    f = [path + "/" + i for i in files]
    return f


def read_files():
    files = get_files()
    text_list = {}
    for (i, index) in enumerate(files):
        with open(i, "r", encoding='UTF-8') as input_files:
            text = input_files.read()
            text_list.setdefault(index, text)
            # html = markdown.markdown(text)
            # html_list.append(html)
    return json.dumps(text_list)


def return_code(msg,code):
    message = {'msg':msg,'code':code}
    return message
if __name__ == '__main__':
    print(read_files())
