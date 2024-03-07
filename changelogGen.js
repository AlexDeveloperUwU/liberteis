const fs = require('fs');

// Cargar el changelog desde el archivo JSON
const changelogData = require('./public/docs/changelog.json');

// Inicializar la variable como un array de strings
let changelogContent = ["# Historial de versiones", "", "Aquí encontrarás las distintas versiones con sus cambios, la fecha y datos extras.", ""];

changelogData.forEach(log => {
  changelogContent.push(`<details>\n  <summary><b>${log.version} - ${log.date}</b></summary>`);

  log.list.forEach(item => {
    const labelColorMap = {
      'añadido': 'green',
      'eliminado': 'red',
      'arreglado': 'yellow'
    };

    const labelColor = labelColorMap[item.label[0].toLowerCase()] || 'black';

    changelogContent.push(`\n- <span style="color: ${labelColor};">${item.label.join(', ')}:</span> ${item.detail}`);
  });

  changelogContent.push('\n</details>\n');
});

// Guardar el contenido en el archivo /docs/changelog.md
fs.writeFileSync('./docs/changelog.md', changelogContent.join('\n'));

console.log('/docs/changelog.md generado con éxito.');
