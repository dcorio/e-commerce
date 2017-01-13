# -*- coding: utf-8 -*-
# Copyright 2017 Davide Corio
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields, api


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    cart_quantity = fields.Float(
        compute='_compute_cart_info', string='Cart Quantity')

    @api.multi
    @api.depends(
        'website_order_line.product_uom_qty', 'website_order_line.product_id')
    def _compute_cart_info(self):
        for order in self:
            order.cart_quantity = sum(
                order.mapped('website_order_line.product_uom_qty'))
            order.only_services = all(l.product_id.type in (
                'service', 'digital') for l in order.website_order_line)
