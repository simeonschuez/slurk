import os
import json

FAST_CLOSE = ["img"]


class Layout:
    @classmethod
    def from_json(cls, json_data):
        print(json_data)
        return cls(json.loads(json_data))

    @classmethod
    def from_json_file(cls, path: str):
        if not path:
            return None
        if not isinstance(path, str):
            raise TypeError(f"Object of type `str` expected, however type `{type(path)}` was passed")

        layout_path = \
            os.path.dirname(os.path.realpath(__file__)) + "/../static/layouts/" + path + ".json"

        print("layout path:", layout_path)

        try:
            with open(layout_path) as json_data:
                return cls(json.load(json_data))
        except FileNotFoundError:
            return None

    def _node(self, node, indent=0):
        if not node:
            return ""

        if isinstance(node, str):
            return ' ' * indent + node + '\n'

        html = ""
        for entry in node:
            if isinstance(entry, str):
                html += entry
                continue

            attributes = [(k, v) for k, v in entry.items() if k != "type" and k != "content"]
            if entry["type"] == "area" or entry["type"] == "div":
                html += self._tag("div",
                                  attributes=attributes,
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "break" or entry["type"] == "br":
                html += self._tag("br",
                                  indent=indent,
                                  close=False)
            elif entry["type"] == "bold" or entry["type"] == "b":
                html += self._tag("b",
                                  attributes=attributes,
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "emphasize" or entry["type"] == "em":
                html += self._tag("em",
                                  attributes=attributes,
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "image" or entry["type"] == "img":
                html += self._tag("img",
                                  attributes=attributes,
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "table":
                html += self._tag("table",
                                  attributes=[("id", entry.get('id')), ("class", entry.get('class'))],
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "row" or entry["type"] == "tr":
                html += self._tag("tr",
                                  attributes=[("id", entry.get('id')), ("class", entry.get('class'))],
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "cell" or entry["type"] == "td":
                html += self._tag("td",
                                  attributes=[("id", entry.get('id')), ("class", entry.get('class')),
                                              ("colspan", entry.get('colspan'))],
                                  content=entry.get("content"),
                                  indent=indent)
            elif entry["type"] == "plain" or entry["type"] == "pre":
                html += self._tag("pre",
                                  attributes=[("id", entry.get('id')), ("class", entry.get('class'))],
                                  content=entry.get("content"),
                                  indent=indent)
        return html

    @staticmethod
    def _attribute(name, value):
        return " {}='{}'".format(name, value) if value else ""

    def _attributes(self, attributes):
        if not attributes:
            return ""

        html = ""
        for (name, value) in attributes:
            html += self._attribute(name, value)
        return html

    def _tag(self, name, attributes=None, close=True, content=None, indent=0):
        html = ' ' * indent + "<{}{}".format(name, self._attributes(attributes))
        if content:
            html += ">\n{}".format(self._node(content, indent=indent + 2))
            if close:
                html += "{}</{}".format(' ' * indent, name)
        elif close:
            if name in FAST_CLOSE:
                html += " /"
            else:
                html += "></{}".format(name)
        return html + ">\n"

    def html(self):
        if "html" not in self._data:
            return ""

        return self._node(self._data['html'], indent=0)

    def css(self):
        if "css" not in self._data:
            return ""

        css = ""
        for name, properties in self._data["css"].items():
            css += "{} {{\n".format(name)
            for prop, value in properties.items():
                css += "  {}: {};\n".format(prop, value)
            css += "}\n\n"
        return css

    def __repr__(self):
        return json.dumps(self._data, indent=4)

    def __init__(self, data):
        self._data = data
