const readlineSync = require('readline-sync');
var input_test;

console.log(`Hello`,` world`,`!`);
console.log(`I`,` like`,` dogs.`);
console.log(`Cats are okay too.`);
input_test = readlineSync.question('What kind of pets do you like? ');
console.log(`You like ${input_test}.`);
for (var i = 0; i < 5; i++) {
console.log(input_test);
}
