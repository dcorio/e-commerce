# -*- coding: utf-8 -*-
# Copyright 2017 Davide Corio
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Website Sale Qty Precision',
    'summary': """
        Website Sale Quantity Precision""",
    'version': '10.0.1.0.0',
    'license': 'AGPL-3',
    'author': 'Davide Corio,Odoo Community Association (OCA)',
    'website': 'http://davidecorio.com',
    'depends': [
        'sale',
        'website_sale',
    ],
    'data': [
        'views/assets.xml',
        'views/templates.xml',
    ],
    'demo': [
    ],
}
