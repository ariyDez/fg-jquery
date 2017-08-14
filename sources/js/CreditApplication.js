import jQuery from 'jquery'

window.jQuery = window.$ = jQuery;
$('#send').click(function(e){
    e.preventDefault();
    const data = $('#formData').serialize();
    const creditApplication = new CreditApplication();
    creditApplication.send(data);
});
function send() {
    const data = $('#formData').serialize();
    const creditApplication = new CreditApplication();
    creditApplication.send(data);
}
let instance = null;
class CreditApplication {
    constructor() {
        this.apiUrl = 'http://127.0.0.1:3000/api';
        this.step = 0;
        if(!instance) {
            instance = this;
        }
        return instance;
    }

    renderForm(data) {
        const $root = $('#askartec-form');
        let inputs = '';
        const step = data;
        for (let stepData of step) {
            const inputsData = stepData.inputs;
            inputs += stepData.label ? `<h2>${stepData.label}</h2>` : '';
            for (let key in inputsData) {
                const input = inputsData[key];
                inputs += `<div class="askartec-form-group">
                    <label for="${input.id}">${input.label}${input.required ? '*' : ''}:</label>
                    <input type='${input.type}' name='${input.name}' ${input.required ? 'required' : ''} id='${input.id}'>
                    </div>`;
            }

        }
        const form = `<form id="formData">
                    ${inputs}
                    <input type="hidden" name="step" value="${this.step}">
                    <button onclick="send(); return false;">Send</button>
                </form>`;
        $root.html(form);
    }

    init() {
        const mainObject = this;
        $.get(`${this.apiUrl}/creditApplication`)
            .done(function (data) {
                console.log(data);
                this.step = 1;
                mainObject.renderForm(data);
            });
    }

    send(data) {
        const mainObject = this;
        $.post(`${this.apiUrl}/changeStep`, data)
            .done(function (data) {
                "use strict";
                console.log(data);
                this.step++;
                mainObject.renderForm(data);
            })
            .fail(function (error) {
                "use strict";
                console.log(error);
            })
    }
}

module.exports = CreditApplication;

