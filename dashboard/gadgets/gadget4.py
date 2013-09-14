from django.shortcuts import render_to_response


class Gadget:

    def __init__(self):
        pass

    def gadget_info(self):
        fields = []
        return {'name': 'gadget4',
                'title': 'This is a gadget4',
                'description': 'This is gadget4',
                'colour': 'color-yellow',
                'icon': '/media/img/circle.png',
                'fields': fields}

    # noinspection PyUnusedLocal
    def view(self, request, dashboard_item):
        return render_to_response('gadgets/gadget4.html', {})
