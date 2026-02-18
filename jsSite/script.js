function calculate(numberInput1, numberInput2) {
    const f1 = document.getElementById("numberInput1").valueAsNumber;
    const f2 = document.getElementById("numberInput2").valueAsNumber;
    const oper = document.getElementById("operation").value;
    let result;
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
            result = f1 / f2;
            break;
        case "modulo":
            result = f1 % f2;
            break;
    }
    document.getElementById("result").innerText = "Lösung: " + result;
}