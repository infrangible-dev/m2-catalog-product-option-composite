/**
 * @author      Andreas Knollmann
 * @copyright   2014-2025 Softwareentwicklung Andreas Knollmann
 * @license     http://www.opensource.org/licenses/mit-license.php MIT
 */

define([
    'jquery',
    'domReady'
], function ($, domReady) {
    'use strict';

    var selectionWidgetMixin = {
        _init: function() {
            var self = this;

            self._super();

            domReady(function() {
                $(self.options.productBundleTriggerSelector).on('bundle_product_options_composite_initialized', function(event, optionId) {
                    console.debug('bundle product options composite initialized for option with id: ' + optionId);

                    var selectedProductIds = self.collectSelectedProductIds();

                    $(self.options.productBundleTriggerSelector).trigger('bundle_option_changed',
                        [optionId, selectedProductIds[optionId]]);
                });
            });
        }
    };

    return function (targetWidget) {
        $.widget('infrangible.bundleOptionSelection', targetWidget, selectionWidgetMixin);

        return $.infrangible.bundleOptionSelection;
    };
});
