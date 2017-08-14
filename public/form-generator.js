var states = {
    step: 0
};

var globalOptions = [];

function fragmentFromString(strHTML) {
    return document.createRange().createContextualFragment(strHTML);
}

function send() {
    var creditApplication = new CreditApplication();
    var data = $('#formData').serialize();
    creditApplication.send(data);
    return false;
}

function giveSelection(selValue) {
    var id = selValue.getAttribute('id').replace(/^\D+/g, '');
    var number = ++id;
    var $sel2 = document.querySelector(`#select-name${number}`);
    console.log($sel2.value);
    options2 = globalOptions;
    $sel2.innerHTML = '';
    debugger;
    for(var i = 0; i < options2.length; i++) {
        let option = `<option value='${options2[i].value}' data-option='${options2[i].data_option}'>${options2[i].name}</option>`;
        let optionHTML = fragmentFromString(option);
        if(options2[i].data_option === selValue.value) {
            debugger;
            $sel2.appendChild(optionHTML);
        }
        debugger;
    }
}

function FormGenerator(service) {
    this.service = service;
    this.apiUrl = 'http://127.0.0.1:3000/api';
    this.inputElement = null;
    this.options = [];
}

FormGenerator.prototype.send = function (data) {
    var mainObject = this;
    $.post(this.apiUrl, data)
        .done(function (data) {
            "use strict";
            console.log(data);
            states.step++;
            mainObject.renderForm(data);
        })
        .fail(function (error) {
            "use strict";
            console.log(error);
        })
};

FormGenerator.prototype.renderForm = function (formData) {
    $root = $('#askartec-form');
    var inputsHtml = '';
    var steps = formData.steps;
    for (step of steps) {
        inputsHtml += `<h2>${step.name} step</h2>`;
        var sections = step.sections;
        for(var section of sections) {
            inputsHtml += section.label ? `<h2>${section.label}</h2>` : '';
            var inputs = section.inputs;
            for (var input of inputs) {
                this.inputElement = input;
                inputsHtml += `<div class="askartec-form-group">
                    <label for="${input._id}">${input.label}${input.required ? '*' : ''}:</label>
                    ${this.generateInputElement()}
                    </div>`;
            }
        }
    }
    var form = `<form id="formData">
                    ${inputsHtml}
                    <input type="hidden" name="step" value="${states.step}">
                    <button onclick="send(); return false;">Send</button>
                </form>`;
    $root.html(form);
};

FormGenerator.prototype.init = function () {
    var mainObject = this;
    $.get(`http://127.0.0.1:3000/api/${this.service}`)
        .done(function (data) {
            console.log(data);
            states.step = 1;
            mainObject.renderForm(data);
        });
};

FormGenerator.prototype.firstStep = function () {

};

FormGenerator.prototype.generateInputElement = function() {
    function simpleInput(input) {
        return `<input type='${input.type}' name='${input.name}' ${input.required ? 'required' : ''} id='${input._id}'>`
    }

    function selectInput(input) {
        function optionRender() {
            var options = input.options;
            var optionsHtml = `<option>--Choose--</option>`;
            for(var option of options) {
                optionsHtml += `<option value='${option.value}' data-option='${option.data_option}'>${option.name}</option>`;
                globalOptions.push(option);
            }
            return optionsHtml;
        }
        return `<select name='${input.name}' ${input.required ? 'required' : ''} id='${input.name}' ${input.linked ? 'onchange="giveSelection(this)"' : ''} ${input.linked ? 'class="linked-select"' : ''}">
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
    return inputTypes[this.inputElement.type](this.inputElement);
};