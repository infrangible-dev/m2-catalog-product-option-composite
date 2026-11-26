/**
 * @author      Andreas Knollmann
 * @copyright   Copyright (c) 2014-2026 Softwareentwicklung Andreas Knollmann
 * @license     http://www.opensource.org/licenses/mit-license.php MIT
 */

define([
    'jquery',
    'domReady'
], function ($, domReady) {
    'use strict';

    const globalOptions = {
        config: {
            allowHideProductIds: {}
        },
        productTriggerSelector: '.column.main'
    };

    $.widget('mage.productOptionsComposite', {
        options: globalOptions,

        _init: function () {
            const self = this;

            domReady(function () {
                const triggerNode = $(self.options.productTriggerSelector);

                triggerNode.on('swatch.changed bundle_changed', function (event, selectedProductIds) {
                    if (selectedProductIds !== null && selectedProductIds !== undefined) {
                        self.handleAllowHide(
                            Array.isArray(selectedProductIds) ? selectedProductIds : [selectedProductIds]);
                    }
                });

                triggerNode.trigger('product_options_composite_initialized');
            });
        },

        handleAllowHide: function (selectedProductIds) {
            const self = this;

            $.each(this.options.config.allowHideProductIds || {}, function (optionId, optionData) {
                const option = $('#product-option-' + optionId);

                self.handleAllowHideSelect(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideRadio(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideCheckbox(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideProduct(selectedProductIds, optionId, optionData, option);
                self.handleAllowHideOther(selectedProductIds, optionId, optionData, option);
            });
        },

        handleAllowHideOther: function (selectedProductIds, optionId, optionData, option) {
            const self = this,
                handled = option.find('#select_' + optionId).length > 0 ||
                option.find('input[type="radio"][name="options[' + optionId + ']"]').length > 0 ||
                option.find('input[type="checkbox"][name="options[' + optionId + '][]"]').length > 0 ||
                option.hasClass('field-wrapper-product');

            if (!handled && optionData.option && !self.handleAllowHideOption(selectedProductIds, optionData, option)) {
                option.find('input, textarea, select').each(function () {
                    const field = $(this);

                    if (field.val()) {
                        field.val('');
                        field.trigger('change');
                    }
                });
            }
        },

        handleAllowHideSelect: function (selectedProductIds, optionId, optionData, option) {
            const self = this,
                select = option.find('#select_' + optionId);

            if (select.length > 0) {
                if (!self.handleAllowHideOption(selectedProductIds, optionData, option)) {
                    select.val('');
                    select.trigger('change');
                }
                self.handleAllowHideSelectOptions(selectedProductIds, optionId, optionData, option, select);
            }
        },

        handleAllowHideSelectOptions: function (selectedProductIds, optionId, optionData, option, select) {
            const self = this;

            if (optionData.values) {
                const options = select.find('option');

                $.each(optionData.values, function (optionValueId, productIds) {
                    options.each(function () {
                        self.updateOptionValueElement(selectedProductIds, $(this), optionValueId, productIds);
                    });
                });

                if (!self.updateOptionElement(option, options)) {
                    select.val('');
                    select.trigger('change');
                }
            }
        },

        handleAllowHideRadio: function (selectedProductIds, optionId, optionData, option) {
            const self = this,
                radioButtons = option.find('input[type="radio"][name="options[' + optionId + ']"]');
            let noSelectionRadioButton;

            if (radioButtons.length === 0) {
                return;
            }

            radioButtons.each(function (key, value) {
                const radioButton = $(value);

                if (!radioButton.val()) {
                    noSelectionRadioButton = radioButton;
                }
            });

            if (!self.handleAllowHideOption(selectedProductIds, optionData, option)) {
                self.checkRadioButton(noSelectionRadioButton);
            }

            if (optionData.values) {
                radioButtons.each(function (key, value) {
                    self.handleAllowHideRadioButton(selectedProductIds, optionId, optionData, option, $(value));
                });

                if (!self.updateOptionElement(option, radioButtons)) {
                    self.checkRadioButton(noSelectionRadioButton);
                }
            }
        },

        /**
         * Checks the radio button, if it exists and is not checked yet.
         *
         * @param {jQuery|undefined} radioButton
         */
        checkRadioButton: function (radioButton) {
            if (radioButton && !radioButton.is(':checked')) {
                radioButton.prop('checked', true);
                radioButton.trigger('change');
            }
        },

        handleAllowHideRadioButton: function (selectedProductIds, optionId, optionData, option, radioButton) {
            const self = this;

            if (optionData.values) {
                $.each(optionData.values, function (optionValueId, productIds) {
                    self.updateOptionValueElement(selectedProductIds, radioButton, optionValueId, productIds);
                });
            }
        },

        handleAllowHideCheckbox: function (selectedProductIds, optionId, optionData, option) {
            const self = this,
                checkboxButtons = option.find('input[type="checkbox"][name="options[' + optionId + '][]"]');

            if (checkboxButtons.length === 0) {
                return;
            }

            if (!self.handleAllowHideOption(selectedProductIds, optionData, option)) {
                self.uncheckCheckboxes(checkboxButtons);
            }

            if (optionData.values) {
                checkboxButtons.each(function (key, value) {
                    self.handleAllowHideCheckboxButton(selectedProductIds, optionId, optionData, option, $(value));
                });

                if (!self.updateOptionElement(option, checkboxButtons)) {
                    self.uncheckCheckboxes(checkboxButtons);
                }
            }
        },

        /**
         * Unchecks the checked checkboxes.
         *
         * @param {jQuery} checkboxButtons
         */
        uncheckCheckboxes: function (checkboxButtons) {
            checkboxButtons.each(function (key, value) {
                const checkboxButton = $(value);

                if (checkboxButton.is(':checked')) {
                    checkboxButton.prop('checked', false);
                    checkboxButton.trigger('change');
                }
            });
        },

        handleAllowHideCheckboxButton: function (selectedProductIds, optionId, optionData, option, checkboxButton) {
            const self = this;

            if (optionData.values) {
                $.each(optionData.values, function (optionValueId, productIds) {
                    self.updateOptionValueElement(selectedProductIds, checkboxButton, optionValueId, productIds);
                });
            }
        },

        handleAllowHideProduct: function (selectedProductIds, optionId, optionData, option) {
            const self = this;

            if (option.hasClass('field-wrapper-product')) {
                if (self.handleAllowHideOption(selectedProductIds, optionData, option)) {
                    option.show();
                } else {
                    option.hide();
                    option.find('div.swatch-option.selected').trigger('click');
                }
            }
        },

        handleAllowHideOption: function (selectedProductIds, optionData, option) {
            const self = this;

            if (optionData.option) {
                const productIds = optionData.option,
                    selected = self.isSelected(selectedProductIds, productIds);

                if (selected) {
                    option.show();
                    return true;
                }
                option.hide();
                return false;

            }
        },

        updateOptionElement: function (optionElement, optionValueElements) {
            let availableOptionValues = 0;

            optionValueElements.each(function () {
                if ($(this).css('display') !== 'none' && $(this).val()) {
                    availableOptionValues++;
                }
            });

            if (availableOptionValues === 0) {
                optionElement.hide();
                return false;
            }
            optionElement.show();
            return true;

        },

        updateOptionValueElement: function (selectedProductIds, optionValueElement, optionValueId, productIds) {
            const self = this,
                optionValue = optionValueElement.val();

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

        isSelected: function (selectedProductIds, productIds) {
            const self = this;

            let show = false;

            if (selectedProductIds) {
                let isSubSelection = false;

                $.each(selectedProductIds, function (key, selectedProductId) {
                    if (Array.isArray(selectedProductId)) {
                        isSubSelection = true;
                    }
                });

                if (isSubSelection) {
                    $.each(selectedProductIds, function (groupId, selectedProductIdsList) {
                        if (selectedProductIdsList && productIds[groupId]) {
                            $.each(selectedProductIdsList, function (key, selectedProductId) {
                                if (self.containsProductId(productIds[groupId], selectedProductId)) {
                                    show = true;
                                }
                            });
                        }
                    });
                } else {
                    $.each(selectedProductIds, function (key, selectedProductId) {
                        if (self.containsProductId(productIds, selectedProductId)) {
                            show = true;
                        }
                    });
                }
            }

            return show;
        },

        containsProductId: function (productIds, productId) {
            return $.map(productIds, String).indexOf(String(productId)) !== -1;
        }
    });

    return $.mage.productOptionsComposite;
});
