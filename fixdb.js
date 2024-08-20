const Enmap = require('enmap');

// Crea una nueva instancia de la base de datos
const db = new Enmap({ name: "users" });

// Recorre todas las entradas de la base de datos
db.forEach((value, key) => {
    // Agrega la propiedad "lang" con el valor "gl"
    value.lang = 'gl';
    // Guarda los cambios en la base de datos
    db.set(key, value);
});

console.log('Se ha actualizado la base de datos.');