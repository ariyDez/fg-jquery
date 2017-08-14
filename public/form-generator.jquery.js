(function ($) {
    var apiUrl = 'http://127.0.0.1:8000/api';
    var globalOptions = [];

    function fragmentFromString(strHTML) {
        return document.createRange().createContextualFragment(strHTML);
    }

    var methods = {
        init: function (options) {
            console.log('init', this);
            $.get(`http://127.0.0.1:8000/api/service/${options.service}`)
                .done(function (data) {
                    console.log(data);
                    methods.renderForm(data);
                });
        },
        destroy: function () {
            console.log('destroy');
        },
        send: function (e) {
            console.log('click', e);
            console.log($('#formData').serialize());
            var data = $('#formData').serialize();
            $.post(`${apiUrl}/changeStep`, data)
                .done(function (data) {
                    console.log(data);
                    methods.renderForm(data);
                })
                .fail(function (error) {
                    "use strict";
                    console.log(error);
                });
            e.preventDefault();
        },
        renderForm: function (service) {
            $root = $('#askartec-form');
            var inputsHtml = '';
            var step = service.step;
            inputsHtml += `<h2>${step.name} step</h2>`;
            inputsHtml += `<input type="hidden" name="service" value="${service._id}">`;
            inputsHtml += `<input type="hidden" name="step" value="${step._id}">`;
            var sections = step.sections;
            for (var section of sections) {
                inputsHtml += section.label ? `<h2>${section.label}</h2>` : '';
                var inputs = section.inputs;
                for (var input of inputs) {
                    this.inputElement = input;
                    inputsHtml += `<div class="askartec-form-group">
                    <label for="${input._id}">${input.label}${input.required ? '*' : ''}:</label>
                    ${this.generateInputElement(input)}
                    </div>`;
                }
            }
            var form = `<form id="formData">
                    ${inputsHtml}
                    <button class="next-send">Send</button>
                </form>`;
            $root.html(form);
            $('.linked-select').bind('change.formGenerator', methods.giveSelection);
            $('.next-send').bind('click.formGenerator', methods.send);
        },
        generateInputElement: function (inputElement) {
            function simpleInput(input) {
                return `<input type='${input.type}' name='${input.name}' ${input.required ? 'required' : ''} id='${input._id}'>`
            }

            function selectInput(input) {
                function optionRender() {
                    var options = input.options;
                    var optionsHtml = `<option>--Choose--</option>`;
                    for (var option of options) {
                        optionsHtml += `<option value='${option.value}' data-option='${option.data_option}'>${option.name}</option>`;
                        globalOptions.push(option);
                    }
                    return optionsHtml;
                }

                return `<select name='${input.name}' ${input.required ? 'required' : ''} id='${input.name}' ${input.linked ? 'class="linked-select"' : ''}">
                    ${input.label}
                    ${optionRender()}
                </select>`;
            }

            var inputTypes = {
                'text': simpleInput,
                'checkbox': simpleInput,
                'radio': simpleInput,
                'select': selectInput
            };
            return inputTypes[inputElement.type](inputElement);
        },
        giveSelection: function (e) {
            console.log('give selection', this);
            $current = $(this);
            var id = $current.attr('id').replace(/^\D+/g, '');
            var number = ++id;
            var $sel2 = $(`#select-name${number}`);
            console.log(number);
            console.log($current.val());
            options2 = globalOptions;
            $sel2.html('');
            for (var i = 0; i < options2.length; i++) {
                let option = `<option value='${options2[i].value}' data-option='${options2[i].data_option}'>${options2[i].name}</option>`;
                let optionHTML = fragmentFromString(option);
                if (options2[i].data_option === $current.val()) {
                    $sel2.append(optionHTML);
                }
            }
        }
    };

    $.fn.formGenerator = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error(`Method with name ${method} doesn't exist for jQuery formGenerator`)
        }
    };
}(jQuery));