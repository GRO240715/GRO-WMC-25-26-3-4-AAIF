document.addEventListener("DOMContentLoaded", function () {
    console.log("console.log: JS im Browser");

    const h1 = document.querySelector("h1");

    window.Farbeaendern = function () {
        if (h1.style.color === "red") {
            h1.style.color = "blue";
            h1.innerHTML = "WAS??? Ich bin jetzt blau!!!!"
            console.log("Farbe geändert");
        }
        else {
            h1.style.color = "red";
            h1.innerHTML = "WAS??? Ich bin jetzt rot!!!!"
            console.log("Farbe zurück geändert");
        }
    }
});