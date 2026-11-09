/**
 * @author      Andreas Knollmann
 * @copyright   Copyright (c) 2014-2025 Softwareentwicklung Andreas Knollmann
 * @license     http://www.opensource.org/licenses/mit-license.php MIT
 */

define([
    'jquery',
    'domReady',
    'bundleOptionSelection'
], function ($, domReady) {
    'use strict';

    const globalOptions = {
        config: {},
        productBundleTriggerSelector: '.bundle-options-container',
        bundleOptionId: null
    };

    $.widget('mage.productOptionsComposite', {
        options: globalOptions,

        _create: function() {
        },

        _init: function() {
            const self = this;

            domReady(function() {
                $(self.options.productBundleTriggerSelector).on('bundle_option_changed', function (event, bundleOptionId, selectedProductIds) {
                    if (parseInt(self.options.bundleOptionId) === parseInt(bundleOptionId) &&
                        selectedProductIds !== null) {

                        self.handleAllowHide(
                            Array.isArray(selectedProductIds) ? selectedProductIds : [selectedProductIds]);
                    }
                });

                $(self.options.productBundleTriggerSelector).trigger('bundle_product_options_composite_initialized',
                    [self.options.bundleOptionId]);
            });
        },

        handleAllowHide: function(selectedProductIds) {
            const self = this;

            $.each(this.options.config.allowHideProductIds, function(optionId, optionData) {
                const option = $('#product-option-' + optionId);

                self.handleAllowHideSelect(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideRadio(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideCheckbox(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideProduct(selectedProductIds, optionId, optionData, option);
            });
        },

        handleAllowHideSelect: function(selectedProductIds, optionId, optionData, option) {
            const self = this;

            const select = option.find('#select_' + optionId);

            if (select.length > 0) {
                console.debug('Found select for product option with id: ' + optionId);

                if (! self.handleAllowHideOption(selectedProductIds, optionData, option, optionId)) {
                    select.val('');
                    select.trigger('change');
                }
                self.handleAllowHideSelectOptions(selectedProductIds, optionId, optionData, option, select);
            } else {
                console.debug('Found no select for product option with id: ' + optionId);
            }
        },

        handleAllowHideSelectOptions: function(selectedProductIds, optionId, optionData, option, select) {
            const self = this;

            if (optionData.values) {
                const options = select.find('option');

                $.each(optionData.values, function(optionValueId, productIds) {
                    options.each(function() {
                        const option = $(this);

                        self.updateOptionValueElement(selectedProductIds, option, optionValueId, productIds);
                    });
                });

                if (! self.updateOptionElement(option, options)) {
                    select.val('');
                    select.trigger('change');
                }
            }
        },

        handleAllowHideRadio: function(selectedProductIds, optionId, optionData, option) {
            const self = this;

            const radioButtons = option.find('input[type="radio"][name="options[' + optionId + ']"]');

            if (radioButtons.length > 0) {
                console.debug('Found radio buttons for product option with id: ' + optionId);

                let noSelectionRadioButton;
                radioButtons.each(function(key, value) {
                    const radioButton = $(value);
                    if (! radioButton.val()) {
                        noSelectionRadioButton = radioButton;
                    }
                });

                if (! self.handleAllowHideOption(selectedProductIds, optionData, option, optionId)) {
                    if (noSelectionRadioButton && ! noSelectionRadioButton.is(':checked')) {
                        noSelectionRadioButton.prop('checked', true);
                        noSelectionRadioButton.trigger('change');
                    }
                }

                if (optionData.values) {
                    radioButtons.each(function(key, value) {
                        const radioButton = $(value);
                        self.handleAllowHideRadioButton(selectedProductIds, optionId, optionData, option, radioButton);
                    });
                    if (! self.updateOptionElement(option, radioButtons)) {
                        if (noSelectionRadioButton && ! noSelectionRadioButton.is(':checked')) {
                            noSelectionRadioButton.prop('checked', true);
                            noSelectionRadioButton.trigger('change');
                        }
                    }
                }
            } else {
                console.debug('Found no radio buttons for product option with id: ' + optionId);
            }
        },

        handleAllowHideRadioButton: function(selectedProductIds, optionId, optionData, option, radioButton) {
            const self = this;

            if (optionData.values) {
                $.each(optionData.values, function(optionValueId, productIds) {
                    self.updateOptionValueElement(selectedProductIds, radioButton, optionValueId, productIds);
                });
            }
        },

        handleAllowHideCheckbox: function(selectedProductIds, optionId, optionData, option) {
            const self = this;

            const checkboxButtons = option.find('input[type="checkbox"][name="options[' + optionId + '][]"]');

            if (checkboxButtons.length > 0) {
                console.debug('Found checkbox buttons for product option with id: ' + optionId);

                if (! self.handleAllowHideOption(selectedProductIds, optionData, option, optionId)) {
                    checkboxButtons.each(function(key, value) {
                        const checkboxButton = $(value);
                        if (checkboxButton.is(':checked')) {
                            checkboxButton.prop('checked', false);
                            checkboxButton.trigger('change');
                        }
                    });
                }

                if (optionData.values) {
                    checkboxButtons.each(function(key, value) {
                        const checkboxButton = $(value);
                        self.handleAllowHideCheckboxButton(
                            selectedProductIds, optionId, optionData, option, checkboxButton);
                    });
                    if (! self.updateOptionElement(option, checkboxButtons)) {
                        checkboxButtons.each(function(key, value) {
                            const checkboxButton = $(value);
                            if (checkboxButton.is(':checked')) {
                                checkboxButton.prop('checked', false);
                                checkboxButton.trigger('change');
                            }
                        });
                    }
                }
            } else {
                console.debug('Found no checkbox buttons for product option with id: ' + optionId);
            }
        },

        handleAllowHideCheckboxButton: function(selectedProductIds, optionId, optionData, option, checkboxButton) {
            const self = this;

            if (optionData.values) {
                $.each(optionData.values, function(optionValueId, productIds) {
                    self.updateOptionValueElement(selectedProductIds, checkboxButton, optionValueId, productIds);
                });
            }
        },

        handleAllowHideProduct: function(selectedProductIds, optionId, optionData, option) {
            const self = this;

            if (option.hasClass('field-wrapper-product')) {
                console.debug('Found product for product option with id: ' + optionId);

                if (self.handleAllowHideOption(selectedProductIds, optionData, option, optionId)) {
                    option.show();
                } else {
                    option.hide();
                    option.find('div.swatch-option.selected').trigger('click');
                }
            } else {
                console.debug('Found no product for product option with id: ' + optionId);
            }
        },

        handleAllowHideOption: function(selectedProductIds, optionData, option, optionId) {
            const self = this;

            if (option.length > 0) {
                console.debug('Updating option with id: ' + optionId);

                if (optionData.option) {
                    const productIds = optionData.option;

                    const selected = self.isSelected(selectedProductIds, productIds);

                    if (selected) {
                        console.debug('Showing option with id: ' + optionId);
                        option.show();
                        return true;
                    } else {
                        console.debug('Hiding option with id: ' + optionId);
                        option.hide();
                        return false;
                    }
                }
            } else {
                console.log('Found no option to update with id: ' + optionId);
            }
        },

        updateOptionElement: function(optionElement, optionValueElements) {
            let availableOptionValues = 0;
            optionValueElements.each(function() {
                if ($(this).css('display') !== 'none' && $(this).val()) {
                    availableOptionValues++;
                }
            });

            if (availableOptionValues === 0) {
                optionElement.hide();
                return false;
            } else {
                optionElement.show();
                return true;
            }
        },

        updateOptionValueElement: function(selectedProductIds, optionValueElement, optionValueId, productIds) {
            const self = this;

            const optionValue = optionValueElement.val();

            if (optionValue === optionValueId) {
                const selected = self.isSelected(selectedProductIds, productIds);

                if (selected) {
                    optionValueElement.show();
                    optionValueElement.addClass('product-options-composite-show');
                    optionValueElement.removeClass('product-options-composite-hide');
                } else {
                    optionValueElement.hide();
                    optionValueElement.addClass('product-options-composite-hide');
                    optionValueElement.removeClass('product-options-composite-show');
                }
            }
        },

        isSelected: function(selectedProductIds, productIds) {
            let show = false;

            if (selectedProductIds) {
                let isSubSelection = false;
                $.each(selectedProductIds, function(key, selectedProductId) {
                    if (Array.isArray(selectedProductId)) {
                        isSubSelection = true;
                    }
                });

                if (isSubSelection) {
                    $.each(selectedProductIds, function(groupId, selectedProductIdsList) {
                        if (selectedProductIdsList && productIds[groupId]) {
                            $.each(selectedProductIdsList, function(key, selectedProductId) {
                                if (productIds[groupId].indexOf(selectedProductId) !== -1) {
                                    show = true;
                                }
                            });
                        }
                    });
                } else {
                    $.each(selectedProductIds, function(key, selectedProductId) {
                        if (productIds.indexOf(selectedProductId) !== -1) {
                            show = true;
                        }
                    });
                }
            }

            return show;
        }
    });

    return $.mage.productOptionsComposite;
});
