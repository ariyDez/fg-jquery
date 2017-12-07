(function ($) {
    var apiUrl = 'http://127.0.0.1:8000/api';
    var language = 'ru';
    var globalOptions = [];
    var globalInputs = [];

    function fragmentFromString(strHTML) {
        return document.createRange().createContextualFragment(strHTML);
    }

    var methods = {
        init: function (options) {
            apiUrl = `http://${options.host}/api`;
            language = options.language;
            console.log('init', this);
            $.get(`http://${options.host}/api/service/${options.service}`)
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
            const stepId = $('input[name="step"]').val();
            console.log($('#formData').serialize());
            var data = $('#formData').serialize();
            $.post(`${apiUrl}/changeStep`, data)
                .done(function (data) {
                    console.log(data);
                    if (typeof data === 'string') {
                        alert(data);
                        return;
                    }
                    methods.renderForm(data);
                })
                .fail(function (error) {
                    "use strict";
                    console.log(error);
                });
        // $.post(`${apiUrl}/step/${stepId}/data`, data)
        //         .done(function (data) {
        //             console.log(data);
        //             methods.renderForm(data);
        //         })
        //         .fail(function (error) {
        //             "use strict";
        //             console.log(error);
        //         });
            e.preventDefault();
        },
        renderForm: function (service) {
            $root = $('#askartec-form');
            var inputsHtml = '';
            var step = service.step;
            inputsHtml += `<h2>${step.name} step</h2>`;
            inputsHtml += `<input type="hidden" name="service" value="${service._id}">`;
            inputsHtml += `<input type="hidden" name="step" value="${step._id}">`;
            if (service.user) {
                inputsHtml += `<input type="hidden" name="user" value="${service.user._id}">`;
            }
            var sections = step.sections;
            for (var section of sections) {
                inputsHtml += section.name ? `<h2>${section.name}</h2>` : '';
                var inputs = section.inputs;
                globalInputs = globalInputs.concat(inputs);
                for (var input of inputs) {
                    this.inputElement = input;
                    inputsHtml += `<div class="askartec-form-group">
                    <label for="${input._id}">${this.getLabel(input._id, language)}${input.required ? '*' : ''}:</label>
                    ${this.generateInputElement(input)}
                    </div>`;
                }
            }
            var form = `<form id="formData">
                    ${inputsHtml}
                    <button class="next-send">Send</button>
                </form>`;
            $root.html(form);
            // $('.linked-select').bind('change.formGenerator', methods.giveSelection);
            $('.next-send').bind('click.formGenerator', methods.send);
            $('.linked-select').bind('change.formGenerator', methods.fillChildSelect);

        },
        generateInputElement: function (inputElement) {
            function simpleInput(input) {
                return `<input type='${input.type}' name='${input._id}' ${input.required ? 'required' : ''} id='${input._id}'>`
            }

            function selectInput(input) {
                function optionRender() {
                    var options = input.options;
                    var optionsHtml = `<option>--Choose--</option>`;
                    for (var option of options) {
                        optionsHtml += `<option value='${option._id}' data-option='${option.data_option}'>${option.value}</option>`;
                        globalOptions.push(option);
                    }
                    return optionsHtml;
                }

                return `<select name='${input._id}_select' ${input.required ? 'required' : ''} id='${input.name}' ${input.child ? 'class="linked-select"' : ''}" child="${input.child}">
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
        },
        fillChildSelect: function(e) {
            $current = $(this);
            var childId = $current.attr('child');
            var parentOptionId = $current.val();
            var child = globalInputs.find((function(input) {
                return childId === input._id;
            }));
            $child = $(`#${child.name}`);
            $.get(`${apiUrl}/option/${parentOptionId}/options`, function(options) {
                $child.html('');
                $child.append(`<option>--Choose--</option>`);
                for (var i = 0; i<options.length; i++) {
                    let option = `<option value='${options[i]._id}'>${options[i].value}</option>`;
                    let optionHTML = fragmentFromString(option);
                    $child.append(optionHTML);
                }
            });
        },
        getLabel: function(inputId, language) {
            const input = globalInputs.find((input) => input._id === inputId);
            const inpLanguage = input.languages.find((lang) => lang.alias === language);
            return inpLanguage ? inpLanguage.text : 'no label';
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