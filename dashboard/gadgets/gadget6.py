from django.shortcuts import render_to_response


class Gadget:

    def __init__(self):
        pass

    def gadget_info(self):
        fields = []
        return {'name': 'gadget6',
                'title': 'This is a gadget6',
                'description': 'This is gadget6',
                'colour': 'color-white',
                'icon': '/media/img/circle.png',
                'fields': fields}

    # noinspection PyUnusedLocal
    def view(self, request, dashboard_item):
        return render_to_response('gadgets/gadget6.html', {})
