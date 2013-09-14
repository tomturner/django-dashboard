from django.shortcuts import render_to_response


class Gadget:
    def __init__(self):
        pass

    def gadget_info(self):
        fields = [{'title': 'This is a test field', 'id': 'test', 'type': 'text', 'value': 'test'},
                  {'title': 'List of countries', 'id': 'test2', 'type': 'choice',
                   'choices': [('0', 'UK'), ('1', 'USA'), ('2', 'France'), ('3', 'Italy')], 'value': 'UK'},
                  {'title': ' This is a test checkbox field', 'id': 'chtest', 'type': 'checkbox', 'value': '0'}]
        return {'name': 'gadget2',
                'title': 'This is a gadget2',
                'description': 'This is gadget2',
                'colour': 'color-red',
                'icon': '/media/img/triangle.png',
                'fields': fields}

    # noinspection PyUnusedLocal
    def view(self, request, dashboard_item):
        options = dashboard_item.get_extra_fields()
        return render_to_response('gadgets/gadget2.html', {'options': options})