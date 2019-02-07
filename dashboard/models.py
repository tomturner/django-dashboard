import json

from django.db import models
from django.utils.safestring import mark_safe
from django.contrib.auth.models import User
from dashboard.gadgets import open_gadget
from dashboard.xml_utils import read_value_from_xml_field


class Dashboard(models.Model):
    name = models.CharField(null=True, blank=True, max_length=1024)
    layout = models.CharField(null=True, blank=True, max_length=1024)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return self.name

    class Meta:
        unique_together = (('name', 'user'),)
        db_table = 'dashboard'


class DashboardItem(models.Model):
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    gadget = models.TextField()
    column_number = models.IntegerField()
    position = models.IntegerField()
    colour = models.TextField(null=True, blank=False)
    title = models.TextField(null=True, blank=False)
    collapsed = models.BooleanField()
    modifier = models.TextField(null=True, blank=False)
    active = models.BooleanField()

    class Meta:
        db_table = 'dashboard_item'

    def get_colour(self):
        if self.colour is not None:
            return self.colour
        return open_gadget(self.gadget).gadget_info()['colour']

    def get_icon(self):
        return open_gadget(self.gadget).gadget_info()['icon']

    def get_extra_fields(self):
        fields = open_gadget(self.gadget).gadget_info()['fields']
        new_fields = {}
        for field in fields:
            value = read_value_from_xml_field(field['id'], self.modifier)
            if value != '':
                field['value'] = value
            new_fields[field['id']] = value
        return new_fields

    def get_extra_fields_json(self):
        fields = open_gadget(self.gadget).gadget_info()['fields']
        new_fields = []
        for field in fields:
            value = read_value_from_xml_field(field['id'], self.modifier)
            if value != '':
                field['value'] = value
            new_fields.append(field)
        return mark_safe(json.dumps(new_fields))

    def get_collapsed_style(self):
        if self.collapsed:
            return ' collapsed'
        else:
            return ''

    def make_html_id(self):
        html_id = "id%d" % self.id
        return html_id
