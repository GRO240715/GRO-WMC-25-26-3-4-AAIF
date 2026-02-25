function calculate(numberInput1, numberInput2) {
    const f1 = document.getElementById("numberInput1").valueAsNumber;
    const f2 = document.getElementById("numberInput2").valueAsNumber;
    const oper = document.getElementById("operation").value;
    const resultElement = document.getElementById("result");
    const continueBtn = document.getElementById("continue-btn");
    let result;
    resultElement.style.color = "white";
    switch (oper) {
        case "add":
            result = f1 + f2;
            break;
        case "subtract":
            result = f1 - f2;
            break;
        case "multiply":
            result = f1 * f2;
            break;
        case "divide":
            if (f2 === 0) result = "DU DEPPATA, DU VOLLIDIOT!!!";
            else result = f1 / f2;
            break;
        case "modulo":
            result = f1 % f2;
            break;
        case "charliekirk":
            result = "rest in piss. king of the perk, charlie kirk";
            break;
    }

    if (typeof result === "number" && !isNaN(result)) {
        resultElement.style.background = "black";
        continueBtn.style.display = "inline-block";
        continueBtn.onclick = function () {
            document.getElementById("numberInput1").value = result;
        };
    } else {
        resultElement.style.background = "red";
        continueBtn.style.display = "none";
        continueBtn.onclick = null;
    }

    document.getElementById("result-text").innerText = "Lösung: " + result;
    document.getElementById("numberInput1").value = '';
    document.getElementById("numberInput2").value = '';
}