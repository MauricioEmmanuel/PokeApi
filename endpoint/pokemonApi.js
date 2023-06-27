const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { jsPDF } = require("jspdf");

router.get("/", async (req, res) => {
  const offset = req.query.offset || 0; // Valor predeterminado de offset (paginado): 0
  const limit = req.query.limit || 10000; // Valor predeterminado de limit: 10000 para traernos todos
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    const data = await response.json();
    // Ordenar alfabéticamente por nombre
    data.results.sort((a, b) => a.name.localeCompare(b.name));
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los datos de la PokeAPI" });
  }
});

router.post("/buscar", async (req, res) => {
  const nombre = req.body.nombre;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    const data = await response.json();
    // Crear un nuevo documento PDF
    const doc = new jsPDF();
    let tipoSecundario = "sin tipo secundario";
    if (data.types[1]) { //validamos que si tenga tipo secundario si no mostramos el texto por defecto
      tipoSecundario = data.types[1].type.name;
    }
    // Agregar contenido al PDF
    doc.text(`Nombre: ${data.name}`, 10, 10);
    doc.text(`Altura: ${data.height/10}m`, 10, 20);
    doc.text(`Peso: ${data.weight/10}kg`, 10, 30);
    doc.text(`Numero en la pokedex: ${data.id}`, 10, 40);
    doc.text(`Habilidad principal: ${data.abilities[0].ability.name}`, 10, 50);
    doc.text(`Tipos: ${data.types[0].type.name}, ${tipoSecundario}`, 10, 60);
    doc.addImage(data.sprites.front_default, "JPEG", 10, 70, 120, 70); //intenté agregar la imagen pero por alguna razón no la muestra
    
    // Generar el nombre del archivo PDF basado en el nombre del Pokémon
    const pdfFileName = `${nombre}.pdf`;

    // Enviar el PDF como respuesta adjunto
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName}"`
    );
    res.send(doc.output());
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        'Error el pokemon "' +
        nombre +
        '" no existe, asegurate de escribirlo bien.',
    });
  }
});

module.exports = router;
