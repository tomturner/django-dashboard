import os


def find_gadgets():
    gadget_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        if True:
            file_dict = [f[:-3] for f in os.listdir(gadget_dir)
                    if not f.startswith('_') and f.endswith('.py')]
        else:
            file_dict = [f[:-4] for f in os.listdir(gadget_dir)
                    if not f.startswith('_') and f.endswith('.pyc')]
    except OSError:
        return []
    gadgetArray = []
    for f in file_dict:
        gadgetArray.append(open_gadget(f).gadget_info())
    return gadgetArray


def open_gadget(gadget):
    g = __import__("djangodashboard.dashboard.gadgets." + gadget, globals(), locals(), ["Gadget"])
    return g.Gadget()
