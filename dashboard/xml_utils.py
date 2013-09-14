import xml.dom.minidom as minidom


def children(dom, name):
    children = []
    for node in dom.childNodes:
        if node.localName == name:
            children.append(node)
    return children


def read_value_from_xml_field(nodeName, xml_data):
    if xml_data == "" or xml_data is None:
        return ""
    dom = minidom.parseString(xml_data)
    root = children(dom, 'xml')
    try:
        fieldNode = children(root[0], nodeName)
        return fieldNode[0].childNodes[0].nodeValue
    except:
        return ""
