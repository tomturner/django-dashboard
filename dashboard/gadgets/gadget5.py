from django.shortcuts import render_to_response


class Gadget:

    def __init__(self):
        pass

    def gadget_info(self):
        fields = []
        return {'name': 'gadget5',
                'title': 'This is a gadget5',
                'description': 'This is gadget5',
                'colour': 'color-orange',
                'icon': '/media/img/circle.png',
                'fields': fields}

    # noinspection PyUnusedLocal
    def view(self, request, dashboard_item):
        return render_to_response('gadgets/gadget5.html', {})
