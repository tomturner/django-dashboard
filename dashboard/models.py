from django.db import models
from django.utils.safestring import mark_safe
from django.contrib.auth.models import User

import simplejson as json  # you can get this from http://pypi.python.org/pypi/simplejson/
from djangodashboard.dashboard.gadgets import open_gadget
from django_extensions.db.fields import UUIDField
from xml_utils import read_value_from_xml_field


class Dashboard(models.Model):
    uuid = UUIDField(primary_key=True)
    name = models.CharField(null=True, blank=True, max_length=1024)
    layout = models.CharField(null=True, blank=True, max_length=1024)
    user = models.ForeignKey(User, null=True, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:
        unique_together = (('name', 'user'),)
        db_table = 'dashboard'


class DashboardItem(models.Model):
    uuid = UUIDField(primary_key=True)
    dashboard = models.ForeignKey(Dashboard, db_column='dashboard_uuid')
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
        try:
            return open_gadget(self.gadget).gadget_info()['colour']
        except:
            return ""

    def get_icon(self):
        try:
            return open_gadget(self.gadget).gadget_info()['icon']
        except:
            return ""

    def get_extra_fields(self):
        try:
            fields = open_gadget(self.gadget).gadget_info()['fields']
        except:
            return ""
        newFields = {}
        for field in fields:
            value = read_value_from_xml_field(field['id'], self.modifier)
            if value != '':
                field['value'] = value
            newFields[field['id']] = value
        return newFields

    def get_extra_fields_json(self):
        try:
            fields = open_gadget(self.gadget).gadget_info()['fields']
        except:
            return []
        newFields = []
        for field in fields:
            value = read_value_from_xml_field(field['id'], self.modifier)
            if value != '':
                field['value'] = value
            newFields.append(field)
        return mark_safe(json.JSONEncoder().encode(newFields))

    def get_collapsed_style(self):
        if self.collapsed:
            return ' collapsed'
        else:
            return ''

    def make_html_id(self):
        html_id = "id" + self.uuid.replace('-', '')
        return html_id
