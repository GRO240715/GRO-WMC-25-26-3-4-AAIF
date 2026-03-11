import personen from "./personen.json" with { type: "json" };

const personenArray = personen.map((person) => { return person.alter });

console.log(personenArray);

//"experimentation" hauptsache in deno type
// .map .filter .slice
