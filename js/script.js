"use strict";

/* -------------------- IndexedDB para imágenes -------------------- */
const dbName = "CostCalcDB";
const dbVersion = 1;
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    };
    request.onsuccess = function (e) {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = function (e) {
      reject(e.target.error);
    };
  });
}

function saveImage(id, fileOrBlob) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const request = store.put({ id: id, blob: fileOrBlob });
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function getImage(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("images", "readonly");
      const store = tx.objectStore("images");
      const request = store.get(id);
      request.onsuccess = function (e) {
        resolve(e.target.result ? e.target.result.blob : null);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function deleteImage(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

/* -------------------- Datos y Variables Globales -------------------- */
let recetaEditIndex = null;
let materiaEditIndex = null;
let gastoEditIndex = null;
let duplicarMode = false;
let currentLang = "es";
let darkMode = false;

let materiasPrimas = JSON.parse(localStorage.getItem("materias") || "[]");
let recetas = JSON.parse(localStorage.getItem("recetas") || "[]");
let gastosFijos = JSON.parse(localStorage.getItem("gastosFijos") || "[]");

/* Diccionario de traducciones */
const translations = {
  es: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Recetas",
    navMaterias: "Materias Primas",
    navConversor: "Conversor",
    navGastos: "Gastos Fijos",
    crearReceta: "Crear Receta",
    placeholderNombreReceta: "Nombre de la receta",
    placeholderUnidades: "Número de unidades producidas",
    placeholderTiempoCoccion: "Tiempo de cocción (min)",
    placeholderComentarios: "Comentarios (opcional)",
    btnAgregarIngrediente: "Agregar Ingrediente",
    btnCalcularReceta: "Calcular Receta",
    recetasGuardadas: "Recetas Guardadas",
    materiaTitle: "Materias Primas",
    placeholderNombreMateria: "Nombre",
    placeholderCostoMateria: "Costo",
    placeholderUnidadMateria: "Unidad (g, ml, unidad)",
    btnAgregarMateria: "Agregar Materia Prima",
    gastosTitle: "Gastos Fijos",
    placeholderNombreGasto: "Nombre del gasto (ej: Luz)",
    placeholderCostoGasto: "Costo",
    btnAgregarGasto: "Agregar Gasto Fijo",
    btnAgregarGastoReceta: "Agregar Gasto Fijo a la Receta",
    placeholderGanancia: "Porcentaje de ganancia (%)",
    conversorTitle: "Conversor de Medidas",
    placeholderValorConversor: "Valor",
    detalleRecetaTitle: "Detalle de Receta",
    editarRecetaTitle: "Editar Receta",
    duplicarRecetaTitle: "Duplicar Receta",
    placeholderEditarNombreReceta: "Nombre de la receta",
    placeholderEditarUnidades: "Número de unidades producidas",
    btnAgregarIngredienteEdit: "Agregar Ingrediente",
    btnGuardarCambiosReceta: "Guardar Cambios",
    editarMateriaTitle: "Editar Materia Prima",
    placeholderEditarNombreMateria: "Nombre",
    placeholderEditarCostoMateria: "Costo",
    placeholderEditarUnidadMateria: "Unidad (g, ml, unidad)",
    btnGuardarCambiosMateria: "Guardar Cambios",
    editarGastoTitle: "Editar Gasto Fijo",
    placeholderEditarNombreGasto: "Nombre del gasto",
    placeholderEditarCostoGasto: "Costo",
    btnGuardarCambiosGasto: "Guardar Cambios",
    labelFotoReceta: "Subir foto",
    limpiarRecetas: "Limpiar Recetas",
    limpiarMaterias: "Limpiar Materias Primas",
    limpiarGastos: "Limpiar Gastos Fijos",
    labelNombre: "Nombre",
    labelUnidades: "Unidades",
    labelTiempoCoccion: "Tiempo de Cocción",
    labelComentarios: "Comentarios",
    labelIngredientes: "Ingredientes",
    labelGastosFijos: "Gastos Fijos",
    labelCostoTotal: "Costo Total",
    labelCostoPorUnidad: "Costo por Unidad",
    labelGanancia: "Ganancia",
    labelPrecioSugerido: "Precio Sugerido",
    faqContent: `
      <ul class="faq-list">
        <li><strong>¿Qué es CostCalc Pro?</strong><br>
          CostCalc Pro es una aplicación que te permite calcular el costo de producción de recetas utilizando materias primas, gastos fijos y un porcentaje de ganancia para obtener un precio sugerido por unidad.</li>
        <li><strong>¿Cómo se agregan materias primas?</strong><br>
          En la sección "Materias Primas", ingresa el nombre, costo y unidad de cada materia y haz clic en "Agregar Materia Prima".</li>
        <li><strong>¿Cómo se crean las recetas?</strong><br>
          Ve a la sección "Recetas", completa el nombre, unidades producidas, tiempo de cocción, ingredientes, gastos fijos y porcentaje de ganancia. La receta se guarda automáticamente.</li>
        <li><strong>¿Cómo se calculan los costos y precios?</strong><br>
          La aplicación suma el costo de los ingredientes y gastos fijos, lo divide entre las unidades producidas y aplica el porcentaje de ganancia para sugerir un precio por unidad.</li>
        <li><strong>¿Cómo se edita o duplica una receta?</strong><br>
          Selecciona una receta de la lista y utiliza los botones de editar o duplicar. En el modo de edición, podrás modificar todos los campos, incluido el porcentaje de ganancia.</li>
        <li><strong>¿Cómo se gestionan los gastos fijos?</strong><br>
          En la sección "Gastos Fijos", agrega el nombre y costo de cada gasto. Estos se pueden asignar a una receta y son incluidos en el cálculo total.</li>
        <li><strong>¿Cómo se calcula el precio del gas?</strong><br>
          Para calcular el precio del gas, utiliza la fórmula: ((boleta de gas) / (consumo de metros cúbicos / 0.32)) / 60. Esto te da el costo por unidad de tiempo.</li>
        <li><strong>¿Cómo se usa la mini calculadora?</strong><br>
          Haz clic en el logo para abrir la mini calculadora, ingresa la operación y presiona "Calcular" para ver el resultado.</li>
        <li><strong>¿Cómo funciona el conversor de medidas?</strong><br>
          En el conversor, ingresa un valor y selecciona la unidad de origen y destino. Al hacer clic en "Convertir", verás el valor convertido.</li>
        <li><strong>¿Cómo se importan y exportan los datos?</strong><br>
          Utiliza los botones de exportar e importar en el header para guardar y cargar tus datos en formato JSON.</li>
      </ul>
    `
  },
  en: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Recipes",
    navMaterias: "Raw Materials",
    navConversor: "Converter",
    navGastos: "Fixed Expenses",
    crearReceta: "Create Recipe",
    placeholderNombreReceta: "Recipe name",
    placeholderUnidades: "Number of units produced",
    placeholderTiempoCoccion: "Cooking time (min)",
    placeholderComentarios: "Comments (optional)",
    btnAgregarIngrediente: "Add Ingredient",
    btnCalcularReceta: "Calculate Recipe",
    recetasGuardadas: "Saved Recipes",
    materiaTitle: "Raw Materials",
    placeholderNombreMateria: "Name",
    placeholderCostoMateria: "Cost",
    placeholderUnidadMateria: "Unit (g, ml, unit)",
    btnAgregarMateria: "Add Raw Material",
    gastosTitle: "Fixed Expenses",
    placeholderNombreGasto: "Expense name (e.g., Electricity)",
    placeholderCostoGasto: "Cost",
    btnAgregarGasto: "Add Fixed Expense",
    btnAgregarGastoReceta: "Add Fixed Expense to Recipe",
    placeholderGanancia: "Profit percentage (%)",
    conversorTitle: "Unit Converter",
    placeholderValorConversor: "Value",
    detalleRecetaTitle: "Recipe Details",
    editarRecetaTitle: "Edit Recipe",
    duplicarRecetaTitle: "Duplicate Recipe",
    placeholderEditarNombreReceta: "Recipe name",
    placeholderEditarUnidades: "Number of units produced",
    btnAgregarIngredienteEdit: "Add Ingredient",
    btnGuardarCambiosReceta: "Save Changes",
    editarMateriaTitle: "Edit Raw Material",
    placeholderEditarNombreMateria: "Name",
    placeholderEditarCostoMateria: "Cost",
    placeholderEditarUnidadMateria: "Unit (g, ml, unit)",
    btnGuardarCambiosMateria: "Save Changes",
    editarGastoTitle: "Edit Fixed Expense",
    placeholderEditarNombreGasto: "Expense name",
    placeholderEditarCostoGasto: "Cost",
    btnGuardarCambiosGasto: "Save Changes",
    labelFotoReceta: "Upload photo",
    limpiarRecetas: "Clear Recipes",
    limpiarMaterias: "Clear Raw Materials",
    limpiarGastos: "Clear Fixed Expenses",
    labelNombre: "Name",
    labelUnidades: "Units",
    labelTiempoCoccion: "Cooking Time",
    labelComentarios: "Comments",
    labelIngredientes: "Ingredients",
    labelGastosFijos: "Fixed Expenses",
    labelCostoTotal: "Total Cost",
    labelCostoPorUnidad: "Cost per Unit",
    labelGanancia: "Profit",
    labelPrecioSugerido: "Suggested Price", 
    faqContent: `
      <ul class="faq-list">
        <li><strong>What is CostCalc Pro?</strong><br>
          CostCalc Pro is an application that allows you to calculate the production cost of recipes using raw materials, fixed expenses, and a profit margin to obtain a suggested unit price.</li>
        <li><strong>How do I add raw materials?</strong><br>
          In the "Raw Materials" section, enter the name, cost, and unit for each material and click "Add Raw Material."</li>
        <li><strong>How do I create a recipe?</strong><br>
          Go to the "Recipes" section, fill in the recipe name, number of produced units, cooking time, ingredients, fixed expenses, and profit margin. The recipe is saved automatically.</li>
        <li><strong>How are costs and prices calculated?</strong><br>
          The app sums the cost of ingredients and fixed expenses, divides by the number of units produced, and applies the profit margin to suggest a price per unit.</li>
        <li><strong>How do I edit or duplicate a recipe?</strong><br>
          Select a recipe from the list and use the edit or duplicate buttons. In edit mode, you can modify all fields, including the profit margin.</li>
        <li><strong>How do I manage fixed expenses?</strong><br>
          In the "Fixed Expenses" section, add the name and cost for each expense. These can be assigned to a recipe and are included in the total calculation.</li>
        <li><strong>How do I calculate the gas price?</strong><br>
          To calculate the gas price, use the formula: ((gas bill) / (consumption in cubic meters / 0.32)) / 60. This gives you the cost per unit of time.</li>
        <li><strong>How does the mini calculator work?</strong><br>
          Click the logo to open the mini calculator, enter an operation, and press "Calculate" to see the result.</li>
        <li><strong>How does the unit converter work?</strong><br>
          In the converter, input a value and select the source and destination units. Clicking "Convert" displays the converted value.</li>
        <li><strong>How do I import and export data?</strong><br>
          Use the export and import buttons in the header to save and load your data in JSON format.</li>
      </ul>
    `
  },
  pt: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Receitas",
    navMaterias: "Matérias-Primas",
    navConversor: "Conversor",
    navGastos: "Gastos Fixos",
    crearReceta: "Criar Receita",
    placeholderNombreReceta: "Nome da receita",
    placeholderUnidades: "Número de unidades produzidas",
    placeholderTiempoCoccion: "Tempo de cozimento (min)",
    placeholderComentarios: "Comentários (opcional)",
    btnAgregarIngrediente: "Adicionar Ingrediente",
    btnCalcularReceta: "Calcular Receita",
    recetasGuardadas: "Receitas Salvas",
    materiaTitle: "Matérias-Primas",
    placeholderNombreMateria: "Nome",
    placeholderCostoMateria: "Custo",
    placeholderUnidadMateria: "Unidade (g, ml, unidade)",
    btnAgregarMateria: "Adicionar Matéria-Prima",
    gastosTitle: "Gastos Fixos",
    placeholderNombreGasto: "Nome do gasto (ex.: Luz)",
    placeholderCostoGasto: "Custo",
    btnAgregarGasto: "Adicionar Gasto Fixo",
    btnAgregarGastoReceta: "Adicionar Gasto Fixo à Receita",
    placeholderGanancia: "Percentual de lucro (%)",
    conversorTitle: "Conversor de Medidas",
    placeholderValorConversor: "Valor",
    detalleRecetaTitle: "Detalhes da Receita",
    editarRecetaTitle: "Editar Receita",
    duplicarRecetaTitle: "Duplicar Receita",
    placeholderEditarNombreReceta: "Nome da receita",
    placeholderEditarUnidades: "Número de unidades produzidas",
    btnAgregarIngredienteEdit: "Adicionar Ingrediente",
    btnGuardarCambiosReceta: "Salvar Alterações",
    editarMateriaTitle: "Editar Matéria-Prima",
    placeholderEditarNombreMateria: "Nome",
    placeholderEditarCostoMateria: "Custo",
    placeholderEditarUnidadMateria: "Unidade (g, ml, unidade)",
    btnGuardarCambiosMateria: "Salvar Alterações",
    editarGastoTitle: "Editar Gasto Fixo",
    placeholderEditarNombreGasto: "Nome do gasto",
    placeholderEditarCostoGasto: "Custo",
    btnGuardarCambiosGasto: "Salvar Alterações",
    labelFotoReceta: "Carregar foto",
    limpiarRecetas: "Limpar Receitas",
    limpiarMaterias: "Limpar Matérias-Primas",
    limpiarGastos: "Limpar Gastos Fixos",
    labelNombre: "Name",
    labelUnidades: "Units",
    labelTiempoCoccion: "Cooking Time",
    labelComentarios: "Comments",
    labelIngredientes: "Ingredients",
    labelGastosFijos: "Fixed Expenses",
    labelCostoTotal: "Total Cost",
    labelCostoPorUnidad: "Cost per Unit",
    labelGanancia: "Profit",
    labelPrecioSugerido: "Suggested Price",
    faqContent: `
      <ul class="faq-list">
        <li><strong>O que é o CostCalc Pro?</strong><br>
          O CostCalc Pro é um aplicativo que permite calcular o custo de produção de receitas usando matérias-primas, gastos fixos e margem de lucro para obter um preço sugerido por unidade.</li>
        <li><strong>Como adicionar matérias-primas?</strong><br>
          Na seção "Matérias-Primas", insira o nome, custo e unidade de cada matéria e clique em "Adicionar Matéria-Prima".</li>
        <li><strong>Como criar uma receita?</strong><br>
          Vá para a seção "Receitas", preencha os campos de nome da receita, unidades produzidas, tempo de cozimento, ingredientes, gastos fixos e margem de lucro. A receita é salva automaticamente.</li>
        <li><strong>Como são calculados os custos e preços?</strong><br>
          O aplicativo soma o custo dos ingredientes e dos gastos fixos, divide pelo número de unidades produzidas e aplica a margem de lucro para sugerir um preço por unidade.</li>
        <li><strong>Como editar ou duplicar uma receita?</strong><br>
          Selecione uma receita da lista e use os botões de editar ou duplicar. No modo de edição, é possível modificar todos os campos, inclusive a margem de lucro.</li>
        <li><strong>Como gerenciar os gastos fixos?</strong><br>
          Na seção "Gastos Fixos", adicione o nome e o custo de cada despesa. Estes podem ser atribuídos a uma receita e são incluídos no cálculo total.</li>
        <li><strong>Como calcular o preço do gás?</strong><br>
          Para calcular o preço do gás, utilize a fórmula: ((conta de gás) / (consumo em metros cúbicos / 0.32)) / 60. Isso fornece o custo por unidade de tempo.</li>
        <li><strong>Como funciona a mini calculadora?</strong><br>
          Clique no logotipo para abrir a mini calculadora, insira a operação e pressione "Calcular" para ver o resultado.</li>
        <li><strong>Como funciona o conversor de medidas?</strong><br>
          No conversor, insira um valor e selecione a unidade de origem e a unidade de destino. Ao clicar em "Converter", o valor convertido será exibido.</li>
        <li><strong>Como importar e exportar os dados?</strong><br>
          Utilize os botões de exportar e importar no cabeçalho para salvar e carregar seus dados em formato JSON.</li>
      </ul>
    `
  },
  fr: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Recettes",
    navMaterias: "Matières Premières",
    navConversor: "Convertisseur",
    navGastos: "Dépenses Fixes",
    crearReceta: "Créer Recette",
    placeholderNombreReceta: "Nom de la recette",
    placeholderUnidades: "Nombre d'unités produites",
    placeholderTiempoCoccion: "Temps de cuisson (min)",
    placeholderComentarios: "Commentaires (facultatif)",
    btnAgregarIngrediente: "Ajouter Ingrédient",
    btnCalcularReceta: "Calculer la Recette",
    recetasGuardadas: "Recettes Sauvegardées",
    materiaTitle: "Matières Premières",
    placeholderNombreMateria: "Nom",
    placeholderCostoMateria: "Coût",
    placeholderUnidadMateria: "Unité (g, ml, unité)",
    btnAgregarMateria: "Ajouter Matière Première",
    gastosTitle: "Dépenses Fixes",
    placeholderNombreGasto: "Nom de la dépense (ex : Électricité)",
    placeholderCostoGasto: "Coût",
    btnAgregarGasto: "Ajouter Dépense Fixe",
    btnAgregarGastoReceta: "Ajouter Dépense Fixe à la Recette",
    placeholderGanancia: "Pourcentage de bénéfice (%)",
    conversorTitle: "Convertisseur d'Unités",
    placeholderValorConversor: "Valeur",
    detalleRecetaTitle: "Détails de la Recette",
    editarRecetaTitle: "Modifier la Recette",
    duplicarRecetaTitle: "Dupliquer la Recette",
    placeholderEditarNombreReceta: "Nom de la recette",
    placeholderEditarUnidades: "Nombre d'unités produites",
    btnAgregarIngredienteEdit: "Ajouter Ingrédient",
    btnGuardarCambiosReceta: "Enregistrer les Modifications",
    editarMateriaTitle: "Modifier la Matière Première",
    placeholderEditarNombreMateria: "Nom",
    placeholderEditarCostoMateria: "Coût",
    placeholderEditarUnidadMateria: "Unité (g, ml, unité)",
    btnGuardarCambiosMateria: "Enregistrer les Modifications",
    editarGastoTitle: "Modifier la Dépense Fixe",
    placeholderEditarNombreGasto: "Nom de la dépense",
    placeholderEditarCostoGasto: "Coût",
    btnGuardarCambiosGasto: "Enregistrer les Modifications",
    labelFotoReceta: "Télécharger une photo",
    limpiarRecetas: "Effacer les recettes",
    limpiarMaterias: "Effacer les matières premières",
    limpiarGastos: "Effacer les dépenses fixes",
    labelNombre: "Nom",
    labelUnidades: "Unités",
    labelTiempoCoccion: "Temps de Cuisson",
    labelComentarios: "Commentaires",
    labelIngredientes: "Ingrédients",
    labelGastosFijos: "Dépenses Fixes",
    labelCostoTotal: "Coût Total",
    labelCostoPorUnidad: "Coût par Unité",
    labelGanancia: "Bénéfice",
    labelPrecioSugerido: "Prix Suggéré",
    faqContent: `
      <ul class="faq-list">
        <li><strong>Qu'est-ce que CostCalc Pro ?</strong><br>
          CostCalc Pro est une application qui vous permet de calculer le coût de production de recettes en utilisant des matières premières, des dépenses fixes et une marge de bénéfice afin d'obtenir un prix unitaire suggéré.</li>
        <li><strong>Comment ajouter des matières premières ?</strong><br>
          Dans la section "Matières Premières", entrez le nom, le coût et l'unité de chaque matière puis cliquez sur "Ajouter Matière Première".</li>
        <li><strong>Comment créer une recette ?</strong><br>
          Allez dans la section "Recettes", remplissez le nom de la recette, le nombre d'unités produites, le temps de cuisson, les ingrédients, les dépenses fixes et la marge de bénéfice. La recette est sauvegardée automatiquement.</li>
        <li><strong>Comment les coûts et les prix sont-ils calculés ?</strong><br>
          L'application additionne le coût des ingrédients et des dépenses fixes, divise par le nombre d'unités produites et applique la marge de bénéfice pour suggérer un prix par unité.</li>
        <li><strong>Comment modifier ou dupliquer une recette ?</strong><br>
          Sélectionnez une recette dans la liste et utilisez les boutons pour la modifier ou la dupliquer. En mode modification, vous pouvez changer tous les champs, y compris la marge de bénéfice.</li>
        <li><strong>Comment gérer les dépenses fixes ?</strong><br>
          Dans la section "Dépenses Fixes", ajoutez le nom et le coût de chaque dépense. Ces dépenses peuvent être affectées à une recette et sont incluses dans le calcul total.</li>
        <li><strong>Comment calculer le prix du gaz ?</strong><br>
          Pour calculer le prix du gaz, utilisez la formule : ((facture de gaz) / (consommation en m³ / 0,32)) / 60. Cela vous donne le coût par unité de temps.</li>
        <li><strong>Comment fonctionne la mini calculatrice ?</strong><br>
          Cliquez sur le logo pour ouvrir la mini calculatrice, entrez une opération et appuyez sur "Calculer" pour voir le résultat.</li>
        <li><strong>Comment fonctionne le convertisseur d'unités ?</strong><br>
          Dans le convertisseur, entrez une valeur et sélectionnez l'unité de départ et d'arrivée. En cliquant sur "Convertir", la valeur convertie s'affiche.</li>
        <li><strong>Comment importer et exporter les données ?</strong><br>
          Utilisez les boutons d'exportation et d'importation dans l'en-tête pour sauvegarder et charger vos données au format JSON.</li>
      </ul>
    `
  },
  de: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Rezepte",
    navMaterias: "Zutaten",
    navConversor: "Umrechner",
    navGastos: "Fixkosten",
    crearReceta: "Rezept erstellen",
    placeholderNombreReceta: "Rezeptname",
    placeholderUnidades: "Anzahl produzierter Einheiten",
    placeholderTiempoCoccion: "Kochzeit (Min)",
    placeholderComentarios: "Kommentare (optional)",
    btnAgregarIngrediente: "Zutat hinzufügen",
    btnCalcularReceta: "Rezept berechnen",
    recetasGuardadas: "Gespeicherte Rezepte",
    materiaTitle: "Zutaten",
    placeholderNombreMateria: "Name",
    placeholderCostoMateria: "Kosten",
    placeholderUnidadMateria: "Einheit (g, ml, Stück)",
    btnAgregarMateria: "Zutat hinzufügen",
    gastosTitle: "Fixkosten",
    placeholderNombreGasto: "Name der Ausgabe (z. B. Strom)",
    placeholderCostoGasto: "Kosten",
    btnAgregarGasto: "Fixkosten hinzufügen",
    btnAgregarGastoReceta: "Fixkosten zum Rezept hinzufügen",
    placeholderGanancia: "Gewinnmarge (%)",
    conversorTitle: "Einheitenumrechner",
    placeholderValorConversor: "Wert",
    detalleRecetaTitle: "Rezeptdetails",
    editarRecetaTitle: "Rezept bearbeiten",
    duplicarRecetaTitle: "Rezept duplizieren",
    placeholderEditarNombreReceta: "Rezeptname",
    placeholderEditarUnidades: "Anzahl produzierter Einheiten",
    btnAgregarIngredienteEdit: "Zutat hinzufügen",
    btnGuardarCambiosReceta: "Änderungen speichern",
    editarMateriaTitle: "Zutat bearbeiten",
    placeholderEditarNombreMateria: "Name",
    placeholderEditarCostoMateria: "Kosten",
    placeholderEditarUnidadMateria: "Einheit (g, ml, Stück)",
    btnGuardarCambiosMateria: "Änderungen speichern",
    editarGastoTitle: "Fixkosten bearbeiten",
    placeholderEditarNombreGasto: "Name der Ausgabe",
    placeholderEditarCostoGasto: "Kosten",
    btnGuardarCambiosGasto: "Änderungen speichern",
    labelFotoReceta: "Foto hochladen",
    limpiarRecetas: "Rezepte löschen",
    limpiarMaterias: "Rohstoffe löschen",
    limpiarGastos: "Fixkosten löschen",
    labelNombre: "Name",
    labelUnidades: "Einheiten",
    labelTiempoCoccion: "Kochzeit",
    labelComentarios: "Kommentare",
    labelIngredientes: "Zutaten",
    labelGastosFijos: "Fixkosten",
    labelCostoTotal: "Gesamtkosten",
    labelCostoPorUnidad: "Kosten pro Einheit",
    labelGanancia: "Gewinn",
    labelPrecioSugerido: "Vorgeschlagener Preis",
    faqContent: `
      <ul class="faq-list">
        <li><strong>Was ist CostCalc Pro?</strong><br>
          CostCalc Pro ist eine Anwendung, mit der Sie die Produktionskosten von Rezepten berechnen können, indem Sie Zutaten, Fixkosten und eine Gewinnmarge verwenden, um einen vorgeschlagenen Stückpreis zu erhalten.</li>
        <li><strong>Wie füge ich Zutaten hinzu?</strong><br>
          Geben Sie im Bereich "Zutaten" den Namen, die Kosten und die Einheit für jede Zutat ein und klicken Sie auf "Zutat hinzufügen".</li>
        <li><strong>Wie erstelle ich ein Rezept?</strong><br>
          Gehen Sie zum Abschnitt "Rezepte", füllen Sie den Rezeptnamen, die Anzahl produzierter Einheiten, die Kochzeit, die Zutaten, die Fixkosten und die Gewinnmarge aus. Das Rezept wird automatisch gespeichert.</li>
        <li><strong>Wie werden Kosten und Preise berechnet?</strong><br>
          Die App summiert die Kosten der Zutaten und Fixkosten, teilt sie durch die Anzahl der produzierten Einheiten und wendet die Gewinnmarge an, um einen Preis pro Einheit vorzuschlagen.</li>
        <li><strong>Wie bearbeite oder dupliziere ich ein Rezept?</strong><br>
          Wählen Sie ein Rezept aus der Liste und verwenden Sie die Schaltflächen zum Bearbeiten oder Duplizieren. Im Bearbeitungsmodus können Sie alle Felder ändern, einschließlich der Gewinnmarge.</li>
        <li><strong>Wie verwalte ich die Fixkosten?</strong><br>
          Fügen Sie im Abschnitt "Fixkosten" den Namen und die Kosten für jede Ausgabe hinzu. Diese können einem Rezept zugewiesen werden und werden in die Gesamtkalkulation einbezogen.</li>
        <li><strong>Wie berechne ich den Gaspreis?</strong><br>
          Um den Gaspreis zu berechnen, verwenden Sie die Formel: ((Gasrechnung) / (Verbrauch in m³ / 0,32)) / 60. Dies ergibt die Kosten pro Zeiteinheit.</li>
        <li><strong>Wie funktioniert der Mini-Rechner?</strong><br>
          Klicken Sie auf das Logo, um den Mini-Rechner zu öffnen, geben Sie einen Rechenvorgang ein und drücken Sie "=" um das Ergebnis zu sehen.</li>
        <li><strong>Wie funktioniert der Umrechner?</strong><br>
          Geben Sie im Umrechner einen Wert ein und wählen Sie die Ausgangs- sowie die Zieleinheit. Klicken Sie auf "Umrechnen", um den umgerechneten Wert zu erhalten.</li>
        <li><strong>Wie importiere und exportiere ich Daten?</strong><br>
          Verwenden Sie die Export- und Import-Schaltflächen in der Kopfzeile, um Ihre Daten im JSON-Format zu speichern und zu laden.</li>
      </ul>
    `
  },

  ja: {
    headerTitle: "CostCalc Pro",
    navRecetas: "レシピ",
    navMaterias: "原材料",
    navConversor: "コンバーター",
    navGastos: "固定費",
    crearReceta: "レシピ作成",
    placeholderNombreReceta: "レシピの名前",
    placeholderUnidades: "生産単位数",
    placeholderTiempoCoccion: "調理時間（分）",
    placeholderComentarios: "コメント（任意）",
    btnAgregarIngrediente: "材料を追加",
    btnCalcularReceta: "レシピ計算",
    recetasGuardadas: "保存されたレシピ",
    materiaTitle: "原材料",
    placeholderNombreMateria: "名前",
    placeholderCostoMateria: "コスト",
    placeholderUnidadMateria: "単位（g, ml, 個）",
    btnAgregarMateria: "原材料を追加",
    gastosTitle: "固定費",
    placeholderNombreGasto: "費用の名前（例：電気）",
    placeholderCostoGasto: "コスト",
    btnAgregarGasto: "固定費を追加",
    btnAgregarGastoReceta: "レシピに固定費を追加",
    placeholderGanancia: "利益率 (%)",
    conversorTitle: "単位コンバーター",
    placeholderValorConversor: "値",
    detalleRecetaTitle: "レシピ詳細",
    editarRecetaTitle: "レシピ編集",
    duplicarRecetaTitle: "レシピ複製",
    placeholderEditarNombreReceta: "レシピの名前",
    placeholderEditarUnidades: "生産単位数",
    btnAgregarIngredienteEdit: "材料を追加",
    btnGuardarCambiosReceta: "変更を保存",
    editarMateriaTitle: "原材料編集",
    placeholderEditarNombreMateria: "名前",
    placeholderEditarCostoMateria: "コスト",
    placeholderEditarUnidadMateria: "単位（g, ml, 個）",
    btnGuardarCambiosMateria: "変更を保存",
    editarGastoTitle: "固定費編集",
    placeholderEditarNombreGasto: "費用の名前",
    placeholderEditarCostoGasto: "コスト",
    btnGuardarCambiosGasto: "変更を保存",
    labelFotoReceta: "写真をアップロード",
    limpiarRecetas: "レシピをクリア",
    limpiarMaterias: "原材料をクリア",
    limpiarGastos: "固定費をクリア",
    labelNombre: "名前",
    labelUnidades: "単位数",
    labelTiempoCoccion: "調理時間",
    labelComentarios: "コメント",
    labelIngredientes: "材料",
    labelGastosFijos: "固定費",
    labelCostoTotal: "合計コスト",
    labelCostoPorUnidad: "単価",
    labelGanancia: "利益",
    labelPrecioSugerido: "推奨価格",
    faqContent: `
      <ul class="faq-list">
        <li><strong>CostCalc Proとは何ですか？</strong><br>
          CostCalc Proは、原材料、固定費、利益率を使用してレシピの生産コストを計算し、1単位あたりの推奨価格を算出するアプリです。</li>
        <li><strong>原材料はどのように追加しますか？</strong><br>
          「原材料」セクションで、各原材料の名前、コスト、単位を入力し、「原材料を追加」をクリックします。</li>
        <li><strong>レシピはどのように作成しますか？</strong><br>
          「レシピ」セクションで、レシピの名前、生産単位数、調理時間、材料、固定費、利益率を入力してください。レシピは自動保存されます。</li>
        <li><strong>コストと価格はどのように計算されますか？</strong><br>
          材料費と固定費を合計し、生産単位数で割り、利益率を適用して1単位あたりの推奨価格を算出します。</li>
        <li><strong>レシピはどのように編集または複製しますか？</strong><br>
          リストからレシピを選び、編集または複製ボタンを使用します。編集モードでは、すべての項目（利益率を含む）を変更可能です。</li>
        <li><strong>固定費はどのように管理しますか？</strong><br>
          「固定費」セクションで、各費用の名前とコストを入力し、追加します。これらはレシピに割り当て、総計算に含まれます。</li>
        <li><strong>ガスの価格はどのように計算しますか？</strong><br>
          ガスの価格を計算するには、次の式を使用します：((ガスの請求書) / (消費メートル立方 / 0.32)) / 60。これにより、時間単位あたりのコストが得られます。</li>
        <li><strong>ミニ計算機はどのように使いますか？</strong><br>
          ロゴをクリックしてミニ計算機を開き、計算式を入力して「計算」ボタンを押すと結果が表示されます。</li>
        <li><strong>単位コンバーターはどのように機能しますか？</strong><br>
          変換器で数値を入力し、元の単位と変換先の単位を選択します。「変換」ボタンをクリックすると、変換結果が表示されます。</li>
        <li><strong>データはどのようにインポート/エクスポートしますか？</strong><br>
          ヘッダーのエクスポート・インポートボタンを使用して、JSON形式でデータを保存・読み込みし、バックアップや復元が可能です。</li>
      </ul>
    `
  },
  zh: {
    headerTitle: "CostCalc Pro",
    navRecetas: "食谱",
    navMaterias: "原材料",
    navConversor: "转换器",
    navGastos: "固定费用",
    crearReceta: "创建食谱",
    placeholderNombreReceta: "食谱名称",
    placeholderUnidades: "生产单位数",
    placeholderTiempoCoccion: "烹饪时间 (分钟)",
    placeholderComentarios: "备注 (可选)",
    btnAgregarIngrediente: "添加原料",
    btnCalcularReceta: "计算食谱",
    recetasGuardadas: "已保存食谱",
    materiaTitle: "原材料",
    placeholderNombreMateria: "名称",
    placeholderCostoMateria: "成本",
    placeholderUnidadMateria: "单位 (g, ml, 个)",
    btnAgregarMateria: "添加原材料",
    gastosTitle: "固定费用",
    placeholderNombreGasto: "费用名称（例如：电费）",
    placeholderCostoGasto: "成本",
    btnAgregarGasto: "添加固定费用",
    btnAgregarGastoReceta: "为食谱添加固定费用",
    placeholderGanancia: "利润百分比 (%)",
    conversorTitle: "单位转换器",
    placeholderValorConversor: "数值",
    detalleRecetaTitle: "食谱详情",
    editarRecetaTitle: "编辑食谱",
    duplicarRecetaTitle: "复制食谱",
    placeholderEditarNombreReceta: "食谱名称",
    placeholderEditarUnidades: "生产单位数",
    btnAgregarIngredienteEdit: "添加原料",
    btnGuardarCambiosReceta: "保存更改",
    editarMateriaTitle: "编辑原材料",
    placeholderEditarNombreMateria: "名称",
    placeholderEditarCostoMateria: "成本",
    placeholderEditarUnidadMateria: "单位 (g, ml, 个)",
    btnGuardarCambiosMateria: "保存更改",
    editarGastoTitle: "编辑固定费用",
    placeholderEditarNombreGasto: "费用名称",
    placeholderEditarCostoGasto: "成本",
    btnGuardarCambiosGasto: "保存更改",
    labelFotoReceta: "上传照片",
    limpiarRecetas: "清除食谱",
    limpiarMaterias: "清除原材料",
    limpiarGastos: "清除固定费用",
    labelNombre: "名称",
    labelUnidades: "单位数",
    labelTiempoCoccion: "烹饪时间",
    labelComentarios: "备注",
    labelIngredientes: "原料",
    labelGastosFijos: "固定费用",
    labelCostoTotal: "总成本",
    labelCostoPorUnidad: "每单位成本",
    labelGanancia: "利润",
    labelPrecioSugerido: "建议价格",
    faqContent: `
      <ul class="faq-list">
        <li><strong>什么是CostCalc Pro？</strong><br>
          CostCalc Pro是一款应用，通过使用原材料、固定费用和利润率来计算配方的生产成本，从而得出建议的单价。</li>
        <li><strong>如何添加原材料？</strong><br>
          在“原材料”部分，输入每种原材料的名称、成本和单位，然后点击“添加原材料”。</li>
        <li><strong>如何创建配方？</strong><br>
          进入“食谱”部分，填写配方名称、生产单位数、烹饪时间、原材料、固定费用和利润率，系统会自动保存配方。</li>
        <li><strong>成本和价格如何计算？</strong><br>
          系统将原材料成本和固定费用相加，除以生产单位数，再应用利润率计算出建议的单价。</li>
        <li><strong>如何编辑或复制配方？</strong><br>
          从列表中选择配方后，点击编辑或复制按钮。编辑模式下可以修改所有项，包括利润率。</li>
        <li><strong>如何管理固定费用？</strong><br>
          在“固定费用”部分，输入每项费用的名称和成本，然后添加。费用将被分配到配方中并计入总成本。</li>
        <li><strong>如何计算天然气价格？</strong><br>
          要计算天然气价格，请使用以下公式：((燃气账单) / (消耗的立方米数 / 0.32)) / 60，这将得到每单位时间的成本。</li>
        <li><strong>如何使用迷你计算器？</strong><br>
          点击logo打开迷你计算器，输入算式并点击“计算”按钮即可显示结果。</li>
        <li><strong>单位转换器如何工作？</strong><br>
          在转换器中输入数值，选择原单位和目标单位，点击“转换”按钮后即可获得转换后的结果。</li>
        <li><strong>如何导入和导出数据？</strong><br>
          使用页眉中的导出和导入按钮可以将数据以JSON格式保存或加载，方便数据备份与恢复。</li>
      </ul>
    `
  }
};


/* -------------------- Funciones de traducción y UI -------------------- */
function translateApp() {
  const t = translations[currentLang];
  // Encabezado
  document.getElementById("headerTitle").innerText = t.headerTitle;
  document.getElementById("navRecetasText").innerText = t.navRecetas;
  document.getElementById("navMateriasText").innerText = t.navMaterias;
  document.getElementById("navConversorText").innerText = t.navConversor;
  document.getElementById("navGastosText").innerText = t.navGastos;  
  // Sección Recetas (crear)
  document.getElementById("recetasTitle").innerText = t.crearReceta;
  document.getElementById("nombreReceta").placeholder = t.placeholderNombreReceta;
  document.getElementById("unidadesProduccion").placeholder = t.placeholderUnidades;
  document.getElementById("tiempoCoccion").placeholder = t.placeholderTiempoCoccion;
  document.getElementById("comentariosReceta").placeholder = t.placeholderComentarios;
  document.getElementById("btnAgregarIngrediente").innerText = t.btnAgregarIngrediente;
  document.getElementById("btnCalcularReceta").innerText = t.btnCalcularReceta;
  document.getElementById("recetasGuardadasTitle").innerText = t.recetasGuardadas;
  document.getElementById("fotoRecetaLabel").innerText = t.labelFotoReceta;
  document.getElementById("btnLimpiarRecetas").innerText = t.limpiarRecetas;
  if (document.getElementById("fotoRecetaEditLabel")) {
    document.getElementById("fotoRecetaEditLabel").innerText = t.labelFotoReceta;
  }
  document.getElementById("btnAgregarGastoReceta").innerText = t.btnAgregarGastoReceta;
  
if (document.getElementById("btnAgregarGastoRecetaEdit")) {
  document.getElementById("btnAgregarGastoRecetaEdit").innerText = t.btnAgregarGastoReceta;
}

  document.getElementById("porcentajeGanancia").placeholder = t.placeholderGanancia;
  // Sección Materias
  document.getElementById("materiaTitle").innerText = t.materiaTitle;
  document.getElementById("nombreMateria").placeholder = t.placeholderNombreMateria;
  document.getElementById("costoMateria").placeholder = t.placeholderCostoMateria;
  document.getElementById("unidadMateria").placeholder = t.placeholderUnidadMateria;
  document.getElementById("btnAgregarMateria").innerText = t.btnAgregarMateria;
  document.getElementById("btnLimpiarMaterias").innerText = t.limpiarMaterias;
  // Sección Gastos
  document.getElementById("gastosTitle").innerText = t.gastosTitle;
  document.getElementById("nombreGasto").placeholder = t.placeholderNombreGasto;
  document.getElementById("costoGasto").placeholder = t.placeholderCostoGasto;
  document.getElementById("btnAgregarGasto").innerText = t.btnAgregarGasto;
  document.getElementById("btnLimpiarGastos").innerText = t.limpiarGastos;
  // Conversor
  document.getElementById("conversorTitle").innerText = t.conversorTitle;
  document.getElementById("valorConversor").placeholder = t.placeholderValorConversor;
  // Modales Receta
  document.getElementById("detalleRecetaTitle").innerText = t.detalleRecetaTitle;
  if (duplicarMode) {
    document.getElementById("editarRecetaTitle").innerText =
      t.duplicarRecetaTitle || "Duplicar Receta";
  } else {
    document.getElementById("editarRecetaTitle").innerText = t.editarRecetaTitle;
  }
  document.getElementById("editarNombreReceta").placeholder = t.placeholderEditarNombreReceta;
  document.getElementById("editarUnidadesProduccion").placeholder = t.placeholderEditarUnidades;
  document.getElementById("editarTiempoCoccion").placeholder = t.placeholderTiempoCoccion;
  document.getElementById("btnAgregarIngredienteEdit").innerText = t.btnAgregarIngredienteEdit;
  document.getElementById("btnGuardarCambiosReceta").innerText = t.btnGuardarCambiosReceta;
  // Modales Materia
  document.getElementById("editarMateriaTitle").innerText = t.editarMateriaTitle;
  document.getElementById("editarNombreMateria").placeholder = t.placeholderEditarNombreMateria;
  document.getElementById("editarCostoMateria").placeholder = t.placeholderEditarCostoMateria;
  document.getElementById("editarUnidadMateria").placeholder = t.placeholderEditarUnidadMateria;
  document.getElementById("btnGuardarCambiosMateria").innerText = t.btnGuardarCambiosMateria;
  // Modales Gasto
  if (document.getElementById("editarGastoTitle")) {
    document.getElementById("editarGastoTitle").innerText = t.editarGastoTitle;
    document.getElementById("editarNombreGasto").placeholder = t.placeholderEditarNombreGasto;
    document.getElementById("editarCostoGasto").placeholder = t.placeholderEditarCostoGasto;
    document.getElementById("btnGuardarCambiosGasto").innerText = t.btnGuardarCambiosGasto;
  }
  // FAQ
  document.getElementById("faqTitle").innerText = "Preguntas Frecuentes";
  document.getElementById("faqContent").innerHTML = t.faqContent;
  if (document.getElementById("editarPorcentajeGanancia")) {
    document.getElementById("editarPorcentajeGanancia").placeholder = t.placeholderGanancia;
  }
  
}
function setLanguage(lang) {
  currentLang = lang;
  translateApp();
}

function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  document.getElementById("themeToggle").innerHTML = darkMode
    ? '<i class="fas fa-moon"></i>'
    : '<i class="fas fa-sun"></i>';
}

function showSection(sectionId) {
  document.getElementById("recetas-section").style.display =
    sectionId === "recetas-section" ? "block" : "none";
  document.getElementById("materias-section").style.display =
    sectionId === "materias-section" ? "block" : "none";
  document.getElementById("gastos-section").style.display =
    sectionId === "gastos-section" ? "block" : "none";
}

/* -------------------- Funciones para Materias Primas -------------------- */
function guardarMaterias() {
  localStorage.setItem("materias", JSON.stringify(materiasPrimas));
}

function mostrarMaterias() {
  const lista = document.getElementById("listaMaterias");
  lista.innerHTML = "";
  const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  materiasOrdenadas.forEach(function (materia) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${materia.nombre}: $${materia.costo} por ${materia.unidad}</span>
      <div class="lista-btns">
        <button class="edit" onclick="editarMateria('${materia.id}')"><i class="fas fa-edit"></i></button>
        <button class="eliminar" onclick="eliminarMateria('${materia.id}')"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
  });
}

function agregarMateria() {
  const nombre = document.getElementById("nombreMateria").value;
  const costo = document.getElementById("costoMateria").value;
  const unidad = document.getElementById("unidadMateria").value;
  if (nombre && costo && unidad) {
    const nuevaMateria = {
      id: Date.now().toString(),
      nombre,
      costo: parseFloat(costo),
      unidad,
    };
    materiasPrimas.push(nuevaMateria);
    guardarMaterias();
    mostrarMaterias();
    actualizarFijosReceta();
    document.getElementById("nombreMateria").value = "";
    document.getElementById("costoMateria").value = "";
    document.getElementById("unidadMateria").value = "";
  } else {
    alert("Completa todos los campos de la materia prima.");
  }
}

function editarMateria(id) {
  const index = materiasPrimas.findIndex((m) => m.id === id);
  if (index === -1) return;
  materiaEditIndex = index;
  const materia = materiasPrimas[index];
  document.getElementById("editarNombreMateria").value = materia.nombre;
  document.getElementById("editarCostoMateria").value = materia.costo;
  document.getElementById("editarUnidadMateria").value = materia.unidad;
  document.getElementById("modalMateriaEdit").style.display = "block";
}

function guardarEdicionMateria() {
  const nombre = document.getElementById("editarNombreMateria").value;
  const costo = document.getElementById("editarCostoMateria").value;
  const unidad = document.getElementById("editarUnidadMateria").value;
  if (nombre && costo && unidad) {
    materiasPrimas[materiaEditIndex] = {
      id: materiasPrimas[materiaEditIndex].id,
      nombre,
      costo: parseFloat(costo),
      unidad,
    };
    guardarMaterias();
    mostrarMaterias();
    actualizarRecetasConMateria();
    cerrarModalMateriaEdit();
  } else {
    alert("Completa todos los campos de edición.");
  }
}

function eliminarMateria(id) {
  if (confirm("¿Eliminar esta materia prima?")) {
    materiasPrimas = materiasPrimas.filter((m) => m.id !== id);
    guardarMaterias();
    mostrarMaterias();
    actualizarFijosReceta();
    // También convendría actualizar las recetas que usaban esta materia.
    actualizarRecetasConMateria();
  }
}

function cerrarModalMateriaEdit() {
  document.getElementById("modalMateriaEdit").style.display = "none";
}

function actualizarRecetasConMateria() {
  recetas.forEach(function (receta) {
    let nuevoCostoTotal = 0;
    receta.ingredientes.forEach(function (ing) {
      const materiaActual = materiasPrimas.find((m) => m.id === ing.id);
      if (materiaActual) {
        ing.costo = materiaActual.costo;
        ing.materia = materiaActual.nombre;
        ing.unidad = materiaActual.unidad;
      }
      nuevoCostoTotal += ing.cantidad * ing.costo;
    });
    receta.costoTotal = nuevoCostoTotal + receta.gastosIncluidos;
    receta.costoPorUnidad = receta.unidades ? receta.costoTotal / receta.unidades : 0;
    receta.precioSugerido =
      receta.costoPorUnidad * (1 + (receta.porcentajeGanancia || 0) / 100);
  });
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
}

/* -------------------- Funciones para Gastos Fijos -------------------- */
function guardarGastosFijos() {
  localStorage.setItem("gastosFijos", JSON.stringify(gastosFijos));
}

function mostrarGastos() {
  const lista = document.getElementById("listaGastos");
  lista.innerHTML = "";
  gastosFijos.forEach(function (gasto, index) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${gasto.nombre}: $${gasto.costo}</span>
      <div class="lista-btns">
        <button class="edit" onclick="editarGasto(${index})"><i class="fas fa-edit"></i></button>
        <button class="eliminar" onclick="eliminarGasto(${index})"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
  });
}

function actualizarFijosReceta() {
  const selects = document.querySelectorAll(".select-gasto");
  selects.forEach((select) => {
    const current = select.value;
    select.innerHTML = "";
    gastosFijos.forEach((gasto) => {
      const option = document.createElement("option");
      option.value = gasto.id;
      option.textContent = `${gasto.nombre} ($${gasto.costo})`;
      if (gasto.id === current) option.selected = true;
      select.appendChild(option);
    });
  });
}

function agregarGasto() {
  const nombre = document.getElementById("nombreGasto").value;
  const costo = document.getElementById("costoGasto").value;
  if (nombre && costo) {
    gastosFijos.push({ id: Date.now().toString(), nombre, costo: parseFloat(costo) });
    guardarGastosFijos();
    mostrarGastos();
    actualizarFijosReceta();
    document.getElementById("nombreGasto").value = "";
    document.getElementById("costoGasto").value = "";
  } else {
    alert("Completa los campos del gasto fijo.");
  }
}

function eliminarGasto(index) {
  if (confirm("¿Eliminar este gasto fijo?")) {
    gastosFijos.splice(index, 1);
    guardarGastosFijos();
    mostrarGastos();
    actualizarFijosReceta();
    actualizarRecetasConGasto();
  }
}

function editarGasto(index) {
  gastoEditIndex = index;
  const gasto = gastosFijos[index];
  document.getElementById("editarNombreGasto").value = gasto.nombre;
  document.getElementById("editarCostoGasto").value = gasto.costo;
  document.getElementById("modalGastoEdit").style.display = "block";
}

function guardarEdicionGasto() {
  const nombre = document.getElementById("editarNombreGasto").value;
  const costo = document.getElementById("editarCostoGasto").value;
  if (nombre && costo) {
    gastosFijos[gastoEditIndex] = {
      id: gastosFijos[gastoEditIndex].id,
      nombre,
      costo: parseFloat(costo),
    };
    guardarGastosFijos();
    mostrarGastos();
    actualizarFijosReceta();
    actualizarRecetasConGasto();
    cerrarModalGastoEdit();
  } else {
    alert("Completa todos los campos de edición del gasto fijo.");
  }
}

function cerrarModalGastoEdit() {
  document.getElementById("modalGastoEdit").style.display = "none";
}

function agregarGastoReceta() {
  const container = document.getElementById("fijosRecetaContainer");
  const div = document.createElement("div");
  div.className = "gasto-receta-row";

  const select = document.createElement("select");
  select.className = "select-gasto";
  gastosFijos.forEach(function (gasto) {
    const option = document.createElement("option");
    option.value = gasto.id;
    option.textContent = `${gasto.nombre} ($${gasto.costo})`;
    select.appendChild(option);
  });

  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";

  const btnRemove = document.createElement("button");
  btnRemove.classList.add("eliminar");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function () {
    container.removeChild(div);
  };

  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function agregarGastoRecetaEdit() {
  const container = document.getElementById("editarFijosRecetaContainer");
  const div = document.createElement("div");
  div.className = "gasto-receta-row";

  const select = document.createElement("select");
  select.className = "select-gasto";
  gastosFijos.forEach(function (gasto) {
    const option = document.createElement("option");
    option.value = gasto.id;
    option.textContent = `${gasto.nombre} ($${gasto.costo})`;
    select.appendChild(option);
  });

  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";

  const btnRemove = document.createElement("button");
  btnRemove.classList.add("eliminar");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function () {
    container.removeChild(div);
  };

  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function actualizarRecetasConGasto() {
  recetas.forEach(function (receta) {
    let nuevoGastos = 0;
    if (receta.gastosReceta) {
      receta.gastosReceta.forEach(function (gasto) {
        const gastoActual = gastosFijos.find((g) => g.id === gasto.id);
        if (gastoActual) {
          gasto.costo = gastoActual.costo;
          gasto.nombre = gastoActual.nombre;
          nuevoGastos += gasto.cantidad * gastoActual.costo;
        }
      });
    }
    receta.gastosIncluidos = nuevoGastos;
    let costoIngredientes = 0;
    receta.ingredientes.forEach(function (ing) {
      costoIngredientes += ing.cantidad * ing.costo;
    });
    receta.costoTotal = costoIngredientes + nuevoGastos;
    receta.costoPorUnidad = receta.unidades
      ? receta.costoTotal / receta.unidades
      : 0;
    receta.precioSugerido =
      receta.costoPorUnidad * (1 + (receta.porcentajeGanancia || 0) / 100);
  });
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
}

/* -------------------- Funciones para Recetas -------------------- */
function agregarIngredienteReceta() {
  const container = document.getElementById("ingredientesReceta");
  const div = document.createElement("div");
  div.className = "ingrediente-row";

  const select = document.createElement("select");
  select.className = "select-materia";

  const materiasOrdenadas = materiasPrimas.slice().sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
  materiasOrdenadas.forEach((materia) => {
    const option = document.createElement("option");
    option.value = materia.id;
    option.textContent = `${materia.nombre} (${materia.unidad})`;
    select.appendChild(option);
  });

  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";

  const btnRemove = document.createElement("button");
  btnRemove.classList.add("eliminar");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function () {
    container.removeChild(div);
  };

  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function agregarIngredienteRecetaEdit() {
  const container = document.getElementById("editarIngredientesReceta");
  const div = document.createElement("div");
  div.className = "ingrediente-row";

  const select = document.createElement("select");
  select.className = "select-materia";

  const materiasOrdenadas = materiasPrimas.slice().sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
  materiasOrdenadas.forEach((materia) => {
    const option = document.createElement("option");
    option.value = materia.id;
    option.textContent = `${materia.nombre} (${materia.unidad})`;
    select.appendChild(option);
  });

  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";

  const btnRemove = document.createElement("button");
  btnRemove.classList.add("eliminar");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function () {
    container.removeChild(div);
  };

  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function calcularReceta() {
  const nombreReceta = document.getElementById("nombreReceta").value;
  const unidadesProduccion = document.getElementById("unidadesProduccion").value;
  const tiempoCoccion = document.getElementById("tiempoCoccion").value;
  let comentarios = document.getElementById("comentariosReceta").value;
  
  if (!nombreReceta || !unidadesProduccion) {
    alert("Completa el nombre y número de unidades de la receta.");
    return;
  }

  if (comentarios) {
    comentarios = comentarios.replace(/\n/g, "<br>");
  }

  const containerIng = document.getElementById("ingredientesReceta");
  const filasIng = containerIng.getElementsByClassName("ingrediente-row");
  if (filasIng.length === 0) {
    alert("Agrega al menos un ingrediente.");
    return;
  }

  let costoTotalIngredientes = 0;
  let ingredientesArray = [];

  for (let i = 0; i < filasIng.length; i++) {
    const fila = filasIng[i];
    const select = fila.querySelector(".select-materia");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = select.value;
    const cantidad = parseFloat(inputCantidad.value);

    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida para todos los ingredientes.");
      return;
    }
    const materia = materiasPrimas.find((m) => m.id === selectedId);
    if (!materia) {
      alert("Materia no encontrada.");
      return;
    }
    costoTotalIngredientes += cantidad * materia.costo;
    ingredientesArray.push({
      id: materia.id,
      materia: materia.nombre,
      cantidad: cantidad,
      unidad: materia.unidad,
      costo: materia.costo,
    });
  }

  // Gastos de la receta
  const containerGastos = document.getElementById("fijosRecetaContainer");
  const filasGasto = containerGastos.getElementsByClassName("gasto-receta-row");
  let costoGastosReceta = 0;
  let gastosRecetaArray = [];

  for (let i = 0; i < filasGasto.length; i++) {
    const fila = filasGasto[i];
    const select = fila.querySelector(".select-gasto");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = select.value;
    const cantidad = parseFloat(inputCantidad.value);

    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida para los gastos fijos.");
      return;
    }
    const gastoObj = gastosFijos.find((g) => g.id === selectedId);
    if (!gastoObj) {
      alert("Gasto fijo no encontrado.");
      return;
    }
    const costoGasto = cantidad * gastoObj.costo;
    costoGastosReceta += costoGasto;
    gastosRecetaArray.push({
      id: gastoObj.id,
      nombre: gastoObj.nombre,
      costo: gastoObj.costo,
      cantidad: cantidad,
    });
  }

  const costoTotalFinal = costoTotalIngredientes + costoGastosReceta;
  const costoPorUnidad = costoTotalFinal / Number(unidadesProduccion);
  const porcentajeGanancia =
    parseFloat(document.getElementById("porcentajeGanancia").value) || 0;
  const precioSugerido = costoPorUnidad * (1 + porcentajeGanancia / 100);

  let nuevaReceta = {
    id: Date.now().toString(),
    nombre: nombreReceta,
    unidades: Number(unidadesProduccion),
    tiempoCoccion: tiempoCoccion,
    comentarios: comentarios,
    ingredientes: ingredientesArray,
    gastosReceta: gastosRecetaArray,
    gastosIncluidos: costoGastosReceta,
    costoTotal: costoTotalFinal,
    costoPorUnidad: costoPorUnidad,
    porcentajeGanancia: porcentajeGanancia,
    precioSugerido: precioSugerido,
    foto: null,
    idioma: currentLang
  };

  // Guardar la foto si se subió
  const file = document.getElementById("fotoReceta").files[0];
  if (file) {
    saveImage(nuevaReceta.id, file)
      .then(() => {
        console.log("Imagen guardada en IndexedDB");
      })
      .catch((err) => {
        console.error("Error guardando la imagen:", err);
      });
  }

  recetas.push(nuevaReceta);
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();

  // Limpieza
  document.getElementById("nombreReceta").value = "";
  document.getElementById("unidadesProduccion").value = "";
  document.getElementById("tiempoCoccion").value = "";
  document.getElementById("comentariosReceta").value = "";
  document.getElementById("fotoReceta").value = "";
  containerIng.innerHTML = "";
  containerGastos.innerHTML = "";
  document.getElementById("porcentajeGanancia").value = "";
}

function mostrarRecetas() {
  const lista = document.getElementById("listaRecetas");
  lista.innerHTML = "";
  recetas.forEach((receta, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${receta.nombre}</strong> (C/U:$${receta.costoPorUnidad.toFixed(2)})</span>
      <div class="lista-btns">
        <button class="ver" onclick="verReceta(${index})"><i class="fas fa-eye"></i></button>
        <button class="edit" onclick="editarReceta(${index})"><i class="fas fa-edit"></i></button>
        <button class="duplicar" onclick="duplicarReceta(${index})"><i class="fas fa-copy"></i></button>
        <button class="eliminar" onclick="eliminarReceta(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    lista.appendChild(li);
  });
}

function verReceta(index) {
  const receta = recetas[index];
  // Obtenemos las traducciones del idioma actual
  const t = translations[currentLang];

  const detalleDiv = document.getElementById("detalleReceta");
  detalleDiv.innerHTML = `
    <p><strong>${t.labelNombre}:</strong> ${receta.nombre}</p>
    <p><strong>${t.labelUnidades}:</strong> ${receta.unidades}</p>
    <p><strong>${t.labelTiempoCoccion}:</strong> ${receta.tiempoCoccion} min</p>
    <p><strong>${t.labelComentarios}:</strong> ${receta.comentarios || ""}</p>
    <hr>
    <p><strong>${t.labelIngredientes}:</strong></p>
    <ul>
      ${
        receta.ingredientes
          .map(
            (ing) =>
              `<li>${ing.materia} (${ing.cantidad} ${ing.unidad}) = $${(
                ing.cantidad * ing.costo
              ).toFixed(2)}</li>`
          )
          .join("")
      }
    </ul>
    <hr style="margin: 20px 0;">
    <p><strong>${t.labelGastosFijos}:</strong></p>
    <ul>
      ${
        receta.gastosReceta && receta.gastosReceta.length
          ? receta.gastosReceta
              .map(
                (g) =>
                  `<li>${g.nombre} x ${g.cantidad} = $${(
                    g.cantidad * g.costo
                  ).toFixed(2)}</li>`
              )
              .join("")
          : "<li>Ninguno</li>"
      }
    </ul>
    <hr>
    <p><strong>${t.labelCostoTotal}:</strong> $${receta.costoTotal.toFixed(2)}</p>
    <p><strong>${t.labelCostoPorUnidad}:</strong> $${receta.costoPorUnidad.toFixed(2)}</p>
    <p><strong>${t.labelGanancia}:</strong> ${receta.porcentajeGanancia}%</p>
    <p><strong>${t.labelPrecioSugerido}:</strong> $${receta.precioSugerido.toFixed(2)}</p>
  `;

  // Cargar foto
  const fotoDisplay = document.getElementById("fotoRecetaDisplay");
  getImage(receta.id)
    .then((blob) => {
      if (blob) {
        fotoDisplay.style.display = "block";
        fotoDisplay.src = URL.createObjectURL(blob);
      } else {
        fotoDisplay.style.display = "none";
      }
    })
    .catch((err) => {
      console.error("Error al cargar la imagen:", err);
      fotoDisplay.style.display = "none";
    });

  document.getElementById("modalRecetaView").style.display = "block";
}

/* -------------------- Funciones para Imprimir -------------------- */

function imprimirReceta() {
  // Obtiene el contenido del área de detalles de la receta
  const detalleRecetaEl = document.getElementById("detalleReceta");
  // Crea un contenedor temporal para clonar solo el contenido interno (sin la estructura del modal)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = detalleRecetaEl.innerHTML;

  // Obtiene la imagen de la receta (si existe)
  const fotoEl = document.getElementById("fotoRecetaDisplay");
  let imagenHTML = "";
  if (fotoEl && fotoEl.style.display !== "none" && fotoEl.src) {
    imagenHTML = `<div style="text-align: center; margin-bottom: 20px;">
                    <img src="${fotoEl.src}" alt="Foto de la receta" style="max-width: 100%; height: auto; border: none;" />
                  </div>`;
  }

  // Define el HTML para la ventana de impresión con estilos mínimos
  const printContent = `
    <html>
      <head>
        <title>Imprimir Receta</title>
        <style>
          /* Quita fondos y otros estilos que puedan hacer que se imprima como imagen */
          * { background: none !important; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, h3 { text-align: center; }
          p { margin: 0 0 10px; line-height: 1.5; }
          ul { list-style: disc; margin-left: 20px; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${imagenHTML}
        ${tempDiv.innerHTML}
      </body>
    </html>
  `;

  // Abre una nueva ventana y escribe el contenido preparado
  const printWindow = window.open("", "", "height=600,width=800");
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}



function cerrarModalRecetaView() {
  document.getElementById("modalRecetaView").style.display = "none";
}

function editarReceta(index) {
  duplicarMode = false;
  recetaEditIndex = index;
  const receta = recetas[index];
  
  // Establecer el idioma del modal según la receta guardada
  if (receta.idioma) {
    currentLang = receta.idioma;
    document.getElementById("langSelect").value = receta.idioma;
  }

  // Ajustar título
  translateApp(); // para que ponga "Editar Receta" si duplicarMode = false
  document.getElementById("modalRecetaEdit").style.display = "block";

  document.getElementById("editarNombreReceta").value = receta.nombre;
  document.getElementById("editarUnidadesProduccion").value = receta.unidades;
  document.getElementById("editarTiempoCoccion").value = receta.tiempoCoccion;
  document.getElementById("editarComentariosReceta").value = receta.comentarios
    ? receta.comentarios.replace(/<br>/g, "\n")
    : "";
  document.getElementById("editarPorcentajeGanancia").value =
    receta.porcentajeGanancia || 0;

  // Limpiar contenedores
  const ingContainer = document.getElementById("editarIngredientesReceta");
  ingContainer.innerHTML = "";
  // Cargar ingredientes
  receta.ingredientes.forEach((ing) => {
    const div = document.createElement("div");
    div.className = "ingrediente-row";

    const select = document.createElement("select");
    select.className = "select-materia";
    // Llenar el select
    const materiasOrdenadas = materiasPrimas.slice().sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
    materiasOrdenadas.forEach((materia) => {
      const option = document.createElement("option");
      option.value = materia.id;
      option.textContent = `${materia.nombre} (${materia.unidad})`;
      if (materia.id === ing.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.placeholder = "Cantidad";
    inputCantidad.className = "input-cantidad";
    inputCantidad.value = ing.cantidad;

    const btnRemove = document.createElement("button");
    btnRemove.classList.add("eliminar");
    btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
    btnRemove.onclick = function () {
      ingContainer.removeChild(div);
    };

    div.appendChild(select);
    div.appendChild(inputCantidad);
    div.appendChild(btnRemove);
    ingContainer.appendChild(div);
  });

  // Cargar gastos fijos
  const gastosContainer = document.getElementById("editarFijosRecetaContainer");
  gastosContainer.innerHTML = "";
  if (receta.gastosReceta) {
    receta.gastosReceta.forEach((g) => {
      const div = document.createElement("div");
      div.className = "gasto-receta-row";

      const select = document.createElement("select");
      select.className = "select-gasto";
      gastosFijos.forEach((gasto) => {
        const option = document.createElement("option");
        option.value = gasto.id;
        option.textContent = `${gasto.nombre} ($${gasto.costo})`;
        if (gasto.id === g.id) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      const inputCantidad = document.createElement("input");
      inputCantidad.type = "number";
      inputCantidad.placeholder = "Cantidad";
      inputCantidad.className = "input-cantidad";
      inputCantidad.value = g.cantidad;

      const btnRemove = document.createElement("button");
      btnRemove.classList.add("eliminar");
      btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemove.onclick = function () {
        gastosContainer.removeChild(div);
      };

      div.appendChild(select);
      div.appendChild(inputCantidad);
      div.appendChild(btnRemove);
      gastosContainer.appendChild(div);
    });
  }
}

function duplicarReceta(index) {
  duplicarMode = true;
  console.log("duplicarReceta called, duplicarMode set to", duplicarMode);
  recetaEditIndex = index;
  const receta = recetas[index];
  document.getElementById("editarNombreReceta").value = receta.nombre + " (Copia)";
  document.getElementById("editarUnidadesProduccion").value = receta.unidades;
  document.getElementById("editarTiempoCoccion").value = receta.tiempoCoccion || "";
  document.getElementById("editarComentariosReceta").value = receta.comentarios || "";
  document.getElementById("editarPorcentajeGanancia").value = receta.porcentajeGanancia || 0;
  
  // Copia los ingredientes
  const containerIng = document.getElementById("editarIngredientesReceta");
  containerIng.innerHTML = "";
  receta.ingredientes.forEach(function (ing) {
    const div = document.createElement("div");
    div.className = "ingrediente-row";
    const select = document.createElement("select");
    select.className = "select-materia";
    const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
    materiasOrdenadas.forEach(function (materia) {
      const option = document.createElement("option");
      option.value = materia.id;
      option.textContent = materia.nombre + " (" + materia.unidad + ")";
      if (materia.id === ing.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.placeholder = "Cantidad";
    inputCantidad.className = "input-cantidad";
    inputCantidad.value = ing.cantidad;
    const btnRemove = document.createElement("button");
    btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
    btnRemove.onclick = function () {
      containerIng.removeChild(div);
    };
    div.appendChild(select);
    div.appendChild(inputCantidad);
    div.appendChild(btnRemove);
    containerIng.appendChild(div);
  });
  
  // Copia los gastos fijos
  const containerGastos = document.getElementById("editarFijosRecetaContainer");
  containerGastos.innerHTML = "";
  if (receta.gastosReceta) {
    receta.gastosReceta.forEach(function (gasto) {
      const div = document.createElement("div");
      div.className = "gasto-receta-row";
      const select = document.createElement("select");
      select.className = "select-gasto";
      gastosFijos.forEach(function (g) {
        const option = document.createElement("option");
        option.value = g.id;
        option.textContent = g.nombre + " ($" + g.costo + ")";
        if (g.id === gasto.id) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      const inputCantidad = document.createElement("input");
      inputCantidad.type = "number";
      inputCantidad.placeholder = "Cantidad";
      inputCantidad.className = "input-cantidad";
      inputCantidad.value = gasto.cantidad;
      const btnRemove = document.createElement("button");
      btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemove.onclick = function () {
        containerGastos.removeChild(div);
      };
      div.appendChild(select);
      div.appendChild(inputCantidad);
      div.appendChild(btnRemove);
      containerGastos.appendChild(div);
    });
  }
  
  document.getElementById("modalRecetaEdit").style.display = "block";
}


async function guardarEdicionReceta() {
  console.log("guardarEdicionReceta llamado. duplicarMode =", duplicarMode);
  
  const nombre = document.getElementById("editarNombreReceta").value;
  const unidades = document.getElementById("editarUnidadesProduccion").value;
  const tiempoCoccion = document.getElementById("editarTiempoCoccion").value;
  let comentarios = document.getElementById("editarComentariosReceta").value;
  const porcentajeGanancia = parseFloat(document.getElementById("editarPorcentajeGanancia").value) || 0;
  
  if (!nombre || !unidades) {
    alert("Completa el nombre y número de unidades.");
    return;
  }
  
  if (comentarios) {
    comentarios = comentarios.replace(/\n/g, "<br>");
  }
  
  // Procesamos los ingredientes
  const containerIng = document.getElementById("editarIngredientesReceta");
  const filasIng = containerIng.getElementsByClassName("ingrediente-row");
  if (filasIng.length === 0) {
    alert("Agrega al menos un ingrediente.");
    return;
  }
  let costoTotalIngredientes = 0;
  let ingredientesArray = [];
  for (let i = 0; i < filasIng.length; i++) {
    const fila = filasIng[i];
    const select = fila.querySelector(".select-materia");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = select.value;
    const cantidad = parseFloat(inputCantidad.value);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida para todos los ingredientes.");
      return;
    }
    const materia = materiasPrimas.find(m => m.id === selectedId);
    if (!materia) {
      alert("Materia no encontrada.");
      return;
    }
    costoTotalIngredientes += cantidad * materia.costo;
    ingredientesArray.push({
      id: materia.id,
      materia: materia.nombre,
      cantidad: cantidad,
      unidad: materia.unidad,
      costo: materia.costo
    });
  }
  
  // Procesamos los gastos fijos
  const containerGastos = document.getElementById("editarFijosRecetaContainer");
  const filasGasto = containerGastos.getElementsByClassName("gasto-receta-row");
  let costoGastosReceta = 0;
  let gastosRecetaArray = [];
  for (let i = 0; i < filasGasto.length; i++) {
    const fila = filasGasto[i];
    const select = fila.querySelector(".select-gasto");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = select.value;
    const cantidad = parseFloat(inputCantidad.value);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida para todos los gastos fijos.");
      return;
    }
    const gastoObj = gastosFijos.find(g => g.id === selectedId);
    if (!gastoObj) {
      alert("Gasto fijo no encontrado.");
      return;
    }
    const costoGasto = cantidad * gastoObj.costo;
    costoGastosReceta += costoGasto;
    gastosRecetaArray.push({
      id: gastoObj.id,
      nombre: gastoObj.nombre,
      costo: gastoObj.costo,
      cantidad: cantidad
    });
  }
  
  const costoTotalFinal = costoTotalIngredientes + costoGastosReceta;
  const costoPorUnidad = costoTotalFinal / Number(unidades);
  const precioSugerido = costoPorUnidad * (1 + porcentajeGanancia / 100);
  
  // Usamos un nuevo ID para duplicar o el mismo para editar
  const newId = duplicarMode ? Date.now().toString() : recetas[recetaEditIndex].id;
  let recetaData = {
    id: newId,
    nombre: nombre,
    unidades: Number(unidades),
    tiempoCoccion: tiempoCoccion,
    comentarios: comentarios,
    ingredientes: ingredientesArray,
    gastosReceta: gastosRecetaArray,
    gastosIncluidos: costoGastosReceta,
    costoTotal: costoTotalFinal,
    costoPorUnidad: costoPorUnidad,
    porcentajeGanancia: porcentajeGanancia,
    precioSugerido: precioSugerido,
    foto: null,  // se asignará a continuación
    idioma: currentLang,
        
  };
  console.log("RecetaData:", recetaData);
  // Manejo de la imagen
  const fileEdit = document.getElementById("fotoRecetaEdit").files[0];
  if (fileEdit) {
    // Si se seleccionó una nueva imagen, la guardamos con el ID correspondiente
    try {
      await saveImage(newId, fileEdit);
      recetaData.foto = newId;
    } catch (err) {
      alert("Error al guardar la imagen: " + err);
    }
  } else {
    if (duplicarMode) {
      // En duplicar, si no se sube una nueva imagen, copiamos la imagen original (si existe)
      const originalFoto = recetas[recetaEditIndex].foto;
      if (originalFoto) {
        try {
          const blob = await getImage(originalFoto);
          if (blob) {
            await saveImage(newId, blob);
            recetaData.foto = newId;
          }
        } catch (err) {
          console.error("Error al copiar la imagen duplicada:", err);
        }
      }
    } else {
      // En edición, si no se selecciona nueva imagen, se conserva la imagen original
      recetaData.foto = recetas[recetaEditIndex].foto || null;
    }
  }
  
  // Actualizamos el array de recetas
  if (duplicarMode) {
    recetas.push(recetaData);
    console.log("Receta duplicada:", recetaData);
  } else {
    recetas[recetaEditIndex] = recetaData;
    console.log("Receta editada:", recetaData);
  }
  
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
  cerrarModalRecetaEdit();
  duplicarMode = false;
}

/* -------------------- Funcion Eliminar Receta -------------------- */

function eliminarReceta(index) {
  if (confirm("¿Eliminar esta receta?")) {
    const recetaEliminada = recetas.splice(index, 1)[0];
    localStorage.setItem("recetas", JSON.stringify(recetas));
    mostrarRecetas();
    // Puedes eliminar también la foto de IndexedDB si lo deseas
    if (recetaEliminada && recetaEliminada.id) {
      deleteImage(recetaEliminada.id).catch((err) => {
        console.error("Error eliminando imagen de la receta:", err);
      });
    }
  }
}

function limpiarRecetas() {
  if (confirm("¿Borrar todas las recetas?")) {
    recetas = [];
    localStorage.removeItem("recetas");
    mostrarRecetas();
  }
}

/* -------------------- Otras funciones (FAQ, import/export, etc.) -------------------- */
function abrirModalFAQ() {
  document.getElementById("modalFAQ").style.display = "block";
}
function cerrarModalFAQ() {
  document.getElementById("modalFAQ").style.display = "none";
}

/* Conversor */
function abrirModalConversor() {
  document.getElementById("modalConversor").style.display = "block";
}
function cerrarModalConversor() {
  document.getElementById("modalConversor").style.display = "none";
}
function convertirMedida() {
  const valor = parseFloat(document.getElementById("valorConversor").value) || 0;
  const unidadOrigen = document.getElementById("unidadOrigen").value;
  const unidadDestino = document.getElementById("unidadDestino").value;

  let factor = 1;
  // Conversiones simples (g <-> kg, ml <-> l)
  if (unidadOrigen === "g" && unidadDestino === "kg") factor = 0.001;
  if (unidadOrigen === "kg" && unidadDestino === "g") factor = 1000;
  if (unidadOrigen === "ml" && unidadDestino === "l") factor = 0.001;
  if (unidadOrigen === "l" && unidadDestino === "ml") factor = 1000;

  const resultado = valor * factor;
  document.getElementById("resultadoConversor").innerText = `${valor} ${unidadOrigen} = ${resultado} ${unidadDestino}`;
}

/* Mini Calculadora */
let miniCalcOperation = "";
function abrirMiniCalculator() {
  document.getElementById("modalMiniCalc").style.display = "block";
}
function cerrarMiniCalculator() {
  document.getElementById("modalMiniCalc").style.display = "none";
  miniCalcOperation = "";
  document.getElementById("miniCalcDisplay").innerText = "0";
}
function appendCalc(val) {
  if (miniCalcOperation === "" && val === ".") {
    miniCalcOperation = "0.";
  } else {
    miniCalcOperation += val;
  }
  document.getElementById("miniCalcDisplay").innerText = miniCalcOperation;
}
function clearCalc() {
  miniCalcOperation = "";
  document.getElementById("miniCalcDisplay").innerText = "0";
}
function calculateMini() {
  try {
    // eslint-disable-next-line no-eval
    const resultado = eval(miniCalcOperation);
    document.getElementById("miniCalcDisplay").innerText = resultado;
    miniCalcOperation = resultado.toString();
  } catch (e) {
    document.getElementById("miniCalcDisplay").innerText = "Error";
  }
}

/* Importar/Exportar JSON */
function exportData() {
  const data = {
    materiasPrimas,
    recetas,
    gastosFijos,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "costcalc_data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.materiasPrimas && imported.recetas && imported.gastosFijos) {
        materiasPrimas = imported.materiasPrimas;
        recetas = imported.recetas;
        gastosFijos = imported.gastosFijos;
        localStorage.setItem("materias", JSON.stringify(materiasPrimas));
        localStorage.setItem("recetas", JSON.stringify(recetas));
        localStorage.setItem("gastosFijos", JSON.stringify(gastosFijos));
        mostrarMaterias();
        mostrarRecetas();
        mostrarGastos();
        actualizarFijosReceta();
        alert("Datos importados con éxito.");
      } else {
        alert("Archivo inválido.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al importar datos.");
    }
  };
  reader.readAsText(file);
}

function limpiarMaterias() {
  if (confirm("¿Borrar todas las materias primas?")) {
    materiasPrimas = [];
    localStorage.removeItem("materias");
    mostrarMaterias();
    actualizarRecetasConMateria();
  }
}

function limpiarGastos() {
  if (confirm("¿Borrar todos los gastos fijos?")) {
    gastosFijos = [];
    localStorage.removeItem("gastosFijos");
    mostrarGastos();
    actualizarFijosReceta();
    actualizarRecetasConGasto();
  }
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
  translateApp();
  mostrarMaterias();
  mostrarRecetas();
  mostrarGastos();
});
function cerrarModalRecetaEdit() {
  document.getElementById("modalRecetaEdit").style.display = "none";
}
