odoo.define('website_sale_qty_precision.website_sale_qty_precision', function (require) {
    "use strict";
    var base = require('web_editor.base');
    var ajax = require('web.ajax');
    var utils = require('web.utils');
    var core = require('web.core');
    var _t = core._t;

    if(!$('.oe_website_sale').length) {
        return $.Deferred().reject("DOM doesn't contain '.oe_website_sale'");
    }

    $('.oe_website_sale').each(function () {
        var oe_website_sale = this;

        var clickwatch = (function(){
              var timer = 0;
              return function(callback, ms){
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
              };
        })();

        $(oe_website_sale).off("change", 'input[name="add_qty"]');
        $(oe_website_sale).on("change", 'input[name="add_qty"]', function (event) {
            var product_ids = [];
            var product_dom = $(".js_product .js_add_cart_variants[data-attribute_value_ids]").last();
            if (!product_dom.length) {
                return;
            }
            _.each(product_dom.data("attribute_value_ids"), function(entry) {
                product_ids.push(entry[0]);});
            var qty = $(event.target).closest('form').find('input[name="add_qty"]').val();

            if ($("#product_detail").length) {
                // display the reduction from the pricelist in function of the quantity
                ajax.jsonRpc("/shop/get_unit_price", 'call', {'product_ids': product_ids,'add_qty': parseFloat(qty).toFixed(2)})
                .then(function (data) {
                    var current = product_dom.data("attribute_value_ids");
                    for(var j=0; j < current.length; j++){
                        current[j][2] = data[current[j][0]];
                    }
                    product_dom.attr("data-attribute_value_ids", JSON.stringify(current)).trigger("change");
                });
            }
        });

        $(oe_website_sale).off("change", ".oe_cart input.js_quantity[data-product-id]");
        $(oe_website_sale).on("change", ".oe_cart input.js_quantity[data-product-id]", function () {
          var $input = $(this);
            if ($input.data('update_change')) {
                return;
            }
          var value = parseFloat($input.val() || 0, 10).toFixed(2);
          var $dom = $(this).closest('tr');
          var $dom_optional = $dom.nextUntil(':not(.optional_product.info)');
          var line_id = parseInt($input.data('line-id'),10);
          var product_ids = [parseInt($input.data('product-id'),10)];
          clickwatch(function(){
            $dom_optional.each(function(){
                $(this).find('.js_quantity').text(value);
                product_ids.push($(this).find('span[data-product-id]').data('product-id'));
            });
            $input.data('update_change', true);

            ajax.jsonRpc("/shop/cart/update_json", 'call', {
                'line_id': line_id,
                'product_id': parseFloat($input.data('product-id'), 10),
                'set_qty': value
            }).then(function (data) {
                $input.data('update_change', false);
                if (value !== parseFloat($input.val() || 0, 10).toFixed(2)) {
                    $input.trigger('change');
                    return;
                }
                var $q = $(".my_cart_quantity");
                if (data.cart_quantity) {
                    $q.parents('li:first').removeClass("hidden");
                }
                else {
                    $q.parents('li:first').addClass("hidden");
                    $('a[href^="/shop/checkout"]').addClass("hidden");
                }

                $q.html(data.cart_quantity).hide().fadeIn(600);
                $input.val(data.quantity);
                $('.js_quantity[data-line-id='+line_id+']').val(data.quantity).html(data.quantity);

                $(".js_cart_lines").first().before(data['website_sale.cart_lines']).end().remove();

                if (data.warning) {
                    var cart_alert = $('.oe_cart').parent().find('#data_warning');
                    if (cart_alert.length === 0) {
                        $('.oe_cart').prepend('<div class="alert alert-danger alert-dismissable" role="alert" id="data_warning">'+
                                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> ' + data.warning + '</div>');
                    }
                    else {
                        cart_alert.html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> ' + data.warning);
                    }
                    $input.val(data.quantity);
                }
            });
          }, 500);
        });

        $(oe_website_sale).off('click', 'a.js_add_cart_json');
        $(oe_website_sale).on('click', 'a.js_add_cart_json', function (ev) {
            ev.preventDefault();
            var $link = $(ev.currentTarget);
            var $input = $link.parent().find("input");
            var product_id = +$input.closest('*:has(input[name="product_id"])').find('input[name="product_id"]').val();
            var min = parseFloat($input.data("min") || 0.1);
            var max = parseFloat($input.data("max") || Infinity);
            var quantity = parseFloat(($link.has(".fa-minus").length ? -0.1 : 0.1) + parseFloat($input.val() || 0, 10)).toFixed(2)
            $('input[name="'+$input.attr("name")+'"]').add($input).filter(function () {
                var $prod = $(this).closest('*:has(input[name="product_id"])');
                return !$prod.length || +$prod.find('input[name="product_id"]').val() === product_id;
            }).val(quantity > min ? (quantity < max ? quantity : max) : min);
            $input.change();
            return false;
        });

        $('form.js_add_cart_json label', oe_website_sale).off('mouseup touchend');
        $('form.js_add_cart_json label', oe_website_sale).on('mouseup touchend', function () {
            var $label = $(this);
            var $price = $label.parents("form:first").find(".oe_price .oe_currency_value");
            if (!$price.data("price")) {
                $price.data("price", parseFloat($price.text()));
            }
            var value = $price.data("price") + parseFloat($label.find(".badge span").text() || 0);

            var dec = value % 1;
            $price.html(value + (dec < 0.01 ? ".00" : (dec < 1 ? "0" : "") ));
        });

        $('.oe_cart').off('click', '.js_delete_product');
        $('.oe_cart').on('click', '.js_delete_product', function(e) {
            e.preventDefault();
            $(this).closest('tr').find('.js_quantity').val(0).trigger('change');
        });
        
    });

});
