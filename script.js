"use strict";

// Variables globales para edición y tema/idioma
let recetaEditIndex = null;
let materiaEditIndex = null;
let currentLang = "es"; // idioma por defecto
let darkMode = false;

// Inicialización de datos desde localStorage
let materiasPrimas = JSON.parse(localStorage.getItem("materias")) || [];
let recetas = JSON.parse(localStorage.getItem("recetas")) || [];

// Diccionario de traducciones
const translations = {
  es: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Recetas",
    navMaterias: "Materias Primas",
    navConversor: "Conversor",
    navBuscar: "Buscar",
    crearReceta: "Crear Receta",
    placeholderNombreReceta: "Nombre de la receta",
    placeholderUnidades: "Número de unidades producidas",
    placeholderComentarios: "Comentarios (opcional)",
    btnAgregarIngrediente: "Agregar Ingrediente",
    btnCalcularReceta: "Calcular Receta",
    recetasGuardadas: "Recetas Guardadas",
    materiaTitle: "Materias Primas",
    placeholderNombreMateria: "Nombre",
    placeholderCostoMateria: "Costo",
    placeholderUnidadMateria: "Unidad (g, ml, unidad)",
    btnAgregarMateria: "Agregar Materia Prima",
    conversorTitle: "Conversor de Medidas",
    placeholderValorConversor: "Valor",
    detalleRecetaTitle: "Detalle de Receta",
    editarRecetaTitle: "Editar Receta",
    placeholderEditarNombreReceta: "Nombre de la receta",
    placeholderEditarUnidades: "Número de unidades producidas",
    btnAgregarIngredienteEdit: "Agregar Ingrediente",
    btnGuardarCambiosReceta: "Guardar Cambios",
    editarMateriaTitle: "Editar Materia Prima",
    placeholderEditarNombreMateria: "Nombre",
    placeholderEditarCostoMateria: "Costo",
    placeholderEditarUnidadMateria: "Unidad (g, ml, unidad)",
    btnGuardarCambiosMateria: "Guardar Cambios",
    faqTitle: "Preguntas Frecuentes",
    faqContent: `
      <ul class="faq-list">
        <li><strong>¿Qué es CostCalc Pro?</strong><br>
            Es una aplicación para calcular el costo de producción de recetas usando materias primas. Por ejemplo, puedes saber cuánto cuesta producir cada pan o torta.</li>
        <li><strong>¿Cómo agrego una materia prima?</strong><br>
            Ve a la pestaña "Materias Primas", ingresa el nombre, costo y unidad (por ejemplo, "Harina", "$1.0" y "kg") y haz clic en "Agregar Materia Prima".</li>
        <li><strong>¿Cómo creo una receta?</strong><br>
            En la pestaña "Recetas", ingresa el nombre de la receta y el número de unidades producidas. Luego, añade ingredientes seleccionando materias primas y especificando cantidades. Por ejemplo, si registraste la harina a $1.0 por kg y usas 300 gramos en la receta, deberás ingresar 0.3 como cantidad de harina. Puedes incluir comentarios y, al presionar "Calcular Receta", verás el costo total y el costo por unidad.</li>
        <li><strong>¿Cómo edito una receta o materia prima?</strong><br>
            Usa el botón de editar (ícono de lápiz) en la lista para abrir un modal, modificar la información y luego guardar los cambios.</li>
        <li><strong>¿Cómo se calculan los costos?</strong><br>
            El costo total se obtiene multiplicando la cantidad de cada ingrediente por su costo y sumando los resultados. Por ejemplo, si usas 2 kg de harina a $1.0 y 1 l de agua a $0.2, el costo será: (2 x 1.0) + (1 x 0.2) = $2.2.</li>
      </ul>`
  },
  en: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Recipes",
    navMaterias: "Raw Materials",
    navConversor: "Converter",
    navBuscar: "Search",
    crearReceta: "Create Recipe",
    placeholderNombreReceta: "Recipe name",
    placeholderUnidades: "Number of units produced",
    placeholderComentarios: "Comments (optional)",
    btnAgregarIngrediente: "Add Ingredient",
    btnCalcularReceta: "Calculate Recipe",
    recetasGuardadas: "Saved Recipes",
    materiaTitle: "Raw Materials",
    placeholderNombreMateria: "Name",
    placeholderCostoMateria: "Cost",
    placeholderUnidadMateria: "Unit (g, ml, unit)",
    btnAgregarMateria: "Add Raw Material",
    conversorTitle: "Unit Converter",
    placeholderValorConversor: "Value",
    detalleRecetaTitle: "Recipe Details",
    editarRecetaTitle: "Edit Recipe",
    placeholderEditarNombreReceta: "Recipe name",
    placeholderEditarUnidades: "Number of units produced",
    btnAgregarIngredienteEdit: "Add Ingredient",
    btnGuardarCambiosReceta: "Save Changes",
    editarMateriaTitle: "Edit Raw Material",
    placeholderEditarNombreMateria: "Name",
    placeholderEditarCostoMateria: "Cost",
    placeholderEditarUnidadMateria: "Unit (g, ml, unit)",
    btnGuardarCambiosMateria: "Save Changes",
    faqTitle: "Frequently Asked Questions",
    faqContent: `
      <ul class="faq-list">
        <li><strong>What is CostCalc Pro?</strong><br>
            It is an application to calculate production costs of recipes using raw materials. For example, you can know the cost per unit of each bread or cake.</li>
        <li><strong>How do I add a raw material?</strong><br>
            Go to the "Raw Materials" tab, enter the name, cost, and unit (e.g., "Flour", "$1.0", "kg"), and click "Add Raw Material".</li>
        <li><strong>How do I create a recipe?</strong><br>
            In the "Recipes" tab, enter the recipe name and number of units produced. Then add ingredients by selecting raw materials and specifying quantities. For example, if you registered flour at $1.0 per kg and use 300 grams in the recipe, you should enter 0.3 as the quantity of flour. Optionally, add comments and click "Calculate Recipe" to see the total cost and cost per unit.</li>
        <li><strong>How do I edit a recipe or raw material?</strong><br>
            Use the edit button (pencil icon) in the list to open a modal, modify the information, and then save changes.</li>
        <li><strong>How are the costs calculated?</strong><br>
            The total cost is calculated by multiplying the quantity of each ingredient by its cost and summing up the values. For example, if you use 2 kg of flour at $1.0 and 1 l of water at $0.2, the cost is: (2 x 1.0) + (1 x 0.2) = $2.2.</li>
      </ul>`
  },
  pt: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Receitas",
    navMaterias: "Matérias-Primas",
    navConversor: "Conversor",
    navBuscar: "Pesquisar",
    crearReceta: "Criar Receita",
    placeholderNombreReceta: "Nome da receita",
    placeholderUnidades: "Número de unidades produzidas",
    placeholderComentarios: "Comentários (opcional)",
    btnAgregarIngrediente: "Adicionar Ingrediente",
    btnCalcularReceta: "Calcular Receita",
    recetasGuardadas: "Receitas Salvas",
    materiaTitle: "Matérias-Primas",
    placeholderNombreMateria: "Nome",
    placeholderCostoMateria: "Custo",
    placeholderUnidadMateria: "Unidade (g, ml, unidade)",
    btnAgregarMateria: "Adicionar Matéria-Prima",
    conversorTitle: "Conversor de Medidas",
    placeholderValorConversor: "Valor",
    detalleRecetaTitle: "Detalhes da Receita",
    editarRecetaTitle: "Editar Receita",
    placeholderEditarNombreReceta: "Nome da receita",
    placeholderEditarUnidades: "Número de unidades produzidas",
    btnAgregarIngredienteEdit: "Adicionar Ingrediente",
    btnGuardarCambiosReceta: "Salvar Alterações",
    editarMateriaTitle: "Editar Matéria-Prima",
    placeholderEditarNombreMateria: "Nome",
    placeholderEditarCostoMateria: "Custo",
    placeholderEditarUnidadMateria: "Unidade (g, ml, unidade)",
    btnGuardarCambiosMateria: "Salvar Alterações",
    faqTitle: "Perguntas Frequentes",
    faqContent: `
      <ul class="faq-list">
        <li><strong>O que é o CostCalc Pro?</strong><br>
            É um aplicativo para calcular o custo de produção de receitas usando matérias-primas. Por exemplo, você pode saber o custo por unidade de cada pão ou bolo.</li>
        <li><strong>Como adiciono uma matéria-prima?</strong><br>
            Vá até a aba "Matérias-Primas", insira o nome, custo e unidade (ex.: "Farinha", "$1.0", "kg") e clique em "Adicionar Matéria-Prima".</li>
        <li><strong>Como crio uma receita?</strong><br>
            Na aba "Receitas", insira o nome da receita e o número de unidades produzidas. Em seguida, adicione os ingredientes selecionando as matérias-primas e especificando as quantidades. Por exemplo, se você cadastrou a farinha a $1.0 por kg e utiliza 300 gramas na receita, deverá inserir 0.3 como quantidade de farinha. Você pode incluir comentários e, ao clicar em "Calcular Receita", ver o custo total e o custo por unidade.</li>
        <li><strong>Como edito uma receita ou matéria-prima?</strong><br>
            Utilize o botão de editar (ícone de lápis) na lista para abrir um modal, modificar as informações e salvar as alterações.</li>
        <li><strong>Como os custos são calculados?</strong><br>
            O custo total é calculado multiplicando a quantidade de cada ingrediente pelo seu custo e somando os valores. Por exemplo, se você usar 2 kg de farinha a $1.0 e 1 l de água a $0.2, o custo será: (2 x 1.0) + (1 x 0.2) = $2.2.</li>
      </ul>`
  }
};

// Actualiza los textos de la app según el idioma seleccionado
function translateApp() {
  const t = translations[currentLang];
  document.getElementById("headerTitle").innerText = t.headerTitle;
  document.getElementById("navRecetasText").innerText = t.navRecetas;
  document.getElementById("navMateriasText").innerText = t.navMaterias;
  document.getElementById("navConversorText").innerText = t.navConversor;
  document.getElementById("recetasTitle").innerText = t.crearReceta;
  document.getElementById("nombreReceta").placeholder = t.placeholderNombreReceta;
  document.getElementById("unidadesProduccion").placeholder = t.placeholderUnidades;
  document.getElementById("comentariosReceta").placeholder = t.placeholderComentarios;
  document.getElementById("btnAgregarIngrediente").innerText = t.btnAgregarIngrediente;
  document.getElementById("btnCalcularReceta").innerText = t.btnCalcularReceta;
  document.getElementById("recetasGuardadasTitle").innerText = t.recetasGuardadas;
  
  document.getElementById("materiaTitle").innerText = t.materiaTitle;
  document.getElementById("nombreMateria").placeholder = t.placeholderNombreMateria;
  document.getElementById("costoMateria").placeholder = t.placeholderCostoMateria;
  document.getElementById("unidadMateria").placeholder = t.placeholderUnidadMateria;
  document.getElementById("btnAgregarMateria").innerText = t.btnAgregarMateria;
  
  document.getElementById("conversorTitle").innerText = t.conversorTitle;
  document.getElementById("valorConversor").placeholder = t.placeholderValorConversor;
  
  document.getElementById("detalleRecetaTitle").innerText = t.detalleRecetaTitle;
  
  document.getElementById("editarRecetaTitle").innerText = t.editarRecetaTitle;
  document.getElementById("editarNombreReceta").placeholder = t.placeholderEditarNombreReceta;
  document.getElementById("editarUnidadesProduccion").placeholder = t.placeholderEditarUnidades;
  document.getElementById("btnAgregarIngredienteEdit").innerText = t.btnAgregarIngredienteEdit;
  document.getElementById("btnGuardarCambiosReceta").innerText = t.btnGuardarCambiosReceta;
  
  document.getElementById("editarMateriaTitle").innerText = t.editarMateriaTitle;
  document.getElementById("editarNombreMateria").placeholder = t.placeholderEditarNombreMateria;
  document.getElementById("editarCostoMateria").placeholder = t.placeholderEditarCostoMateria;
  document.getElementById("editarUnidadMateria").placeholder = t.placeholderEditarUnidadMateria;
  document.getElementById("btnGuardarCambiosMateria").innerText = t.btnGuardarCambiosMateria;
  
  document.getElementById("faqTitle").innerText = t.faqTitle;
  document.getElementById("faqContent").innerHTML = t.faqContent;
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

// Alterna la visibilidad de las secciones
function showSection(sectionId) {
  document.getElementById("recetas-section").style.display = sectionId === "recetas-section" ? "block" : "none";
  document.getElementById("materias-section").style.display = sectionId === "materias-section" ? "block" : "none";
}

/* ----- Funciones de Materias Primas ----- */
function guardarMaterias() {
  localStorage.setItem("materias", JSON.stringify(materiasPrimas));
}

function mostrarMaterias() {
  const lista = document.getElementById("listaMaterias");
  lista.innerHTML = "";
  materiasPrimas.forEach((materia, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${materia.nombre}: $${materia.costo} por ${materia.unidad}</span>
      <div class="lista-btns">
        <button onclick="editarMateria(${index})"><i class="fas fa-edit"></i></button>
        <button onclick="eliminarMateria(${index})"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
  });
}

function agregarMateria() {
  const nombre = document.getElementById("nombreMateria").value;
  const costo = document.getElementById("costoMateria").value;
  const unidad = document.getElementById("unidadMateria").value;
  if (nombre && costo && unidad) {
    const nuevaMateria = { id: Date.now(), nombre, costo: parseFloat(costo), unidad };
    materiasPrimas.push(nuevaMateria);
    guardarMaterias();
    mostrarMaterias();
    document.getElementById("nombreMateria").value = "";
    document.getElementById("costoMateria").value = "";
    document.getElementById("unidadMateria").value = "";
  } else {
    alert("Completa todos los campos de la materia prima.");
  }
}

function editarMateria(index) {
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
      unidad
    };
    guardarMaterias();
    mostrarMaterias();
    actualizarRecetasConMateria();
    cerrarModalMateriaEdit();
  } else {
    alert("Completa todos los campos de edición.");
  }
}

function eliminarMateria(index) {
  if (confirm("¿Eliminar esta materia prima?")) {
    materiasPrimas.splice(index, 1);
    guardarMaterias();
    mostrarMaterias();
  }
}

function cerrarModalMateriaEdit() {
  document.getElementById("modalMateriaEdit").style.display = "none";
}

function actualizarRecetasConMateria() {
  recetas.forEach(receta => {
    let nuevoCostoTotal = 0;
    receta.ingredientes.forEach(ing => {
      const materiaActual = materiasPrimas.find(m => m.id === ing.id);
      if (materiaActual) {
        ing.costo = materiaActual.costo;
        ing.materia = materiaActual.nombre;
        ing.unidad = materiaActual.unidad;
      }
      nuevoCostoTotal += ing.cantidad * ing.costo;
    });
    receta.costoTotal = nuevoCostoTotal;
    receta.costoPorUnidad = receta.unidades ? nuevoCostoTotal / receta.unidades : 0;
  });
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
}

/* ----- Funciones de Recetas ----- */
function agregarIngredienteReceta() {
  const container = document.getElementById("ingredientesReceta");
  const div = document.createElement("div");
  div.className = "ingrediente-row";
  
  const select = document.createElement("select");
  select.className = "select-materia";
  materiasPrimas.forEach(materia => {
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
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = () => container.removeChild(div);
  
  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function calcularReceta() {
  const nombreReceta = document.getElementById("nombreReceta").value;
  const unidadesProduccion = document.getElementById("unidadesProduccion").value;
  const comentarios = document.getElementById("comentariosReceta").value;
  if (!nombreReceta || !unidadesProduccion) {
    alert("Completa el nombre y número de unidades de la receta.");
    return;
  }
  const container = document.getElementById("ingredientesReceta");
  const filas = container.getElementsByClassName("ingrediente-row");
  if (filas.length === 0) {
    alert("Agrega al menos un ingrediente.");
    return;
  }
  let costoTotal = 0;
  let ingredientesArray = [];
  for (let fila of filas) {
    const select = fila.querySelector(".select-materia");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = Number(select.value);
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
    costoTotal += cantidad * materia.costo;
    ingredientesArray.push({
      id: materia.id,
      materia: materia.nombre,
      cantidad,
      unidad: materia.unidad,
      costo: materia.costo
    });
  }
  const costoPorUnidad = costoTotal / Number(unidadesProduccion);
  const receta = {
    nombre: nombreReceta,
    unidades: Number(unidadesProduccion),
    comentarios: comentarios,
    ingredientes: ingredientesArray,
    costoTotal,
    costoPorUnidad
  };
  recetas.push(receta);
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
  document.getElementById("nombreReceta").value = "";
  document.getElementById("unidadesProduccion").value = "";
  document.getElementById("comentariosReceta").value = "";
  container.innerHTML = "";
  document.getElementById("resultadoReceta").innerHTML = `<h3>Resultado de la Receta</h3>
    <p>Total: $${costoTotal.toFixed(2)}</p>
    <p>Costo por unidad: $${costoPorUnidad.toFixed(2)}</p>`;
}

function mostrarRecetas() {
  const lista = document.getElementById("listaRecetas");
  lista.innerHTML = "";
  recetas.forEach((receta, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${receta.nombre}</strong> - Total: $${receta.costoTotal.toFixed(2)} - C/U: $${receta.costoPorUnidad.toFixed(2)}
      <div class="lista-btns">
        <button onclick="verReceta(${index})"><i class="fas fa-eye"></i></button>
        <button onclick="editarReceta(${index})"><i class="fas fa-edit"></i></button>
        <button onclick="eliminarReceta(${index})"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
  });
}

function eliminarReceta(index) {
  if (confirm("¿Eliminar esta receta?")) {
    recetas.splice(index, 1);
    localStorage.setItem("recetas", JSON.stringify(recetas));
    mostrarRecetas();
  }
}

function verReceta(index) {
  const receta = recetas[index];
  let html = `<p><strong>Nombre:</strong> ${receta.nombre}</p>
    <p><strong>Unidades producidas:</strong> ${receta.unidades}</p>
    ${receta.comentarios ? `<p><strong>Comentarios:</strong> ${receta.comentarios}</p>` : "" }
    <p><strong>Total:</strong> $${receta.costoTotal.toFixed(2)}</p>
    <p><strong>Costo por unidad:</strong> $${receta.costoPorUnidad.toFixed(2)}</p>
    <h3>Ingredientes:</h3><ul>`;
  receta.ingredientes.forEach(ing => {
    html += `<li>${ing.materia} - ${ing.cantidad} ${ing.unidad} (Costo: $${ing.costo})</li>`;
  });
  html += "</ul>";
  document.getElementById("detalleReceta").innerHTML = html;
  document.getElementById("modalRecetaView").style.display = "block";
}

function cerrarModalRecetaView() {
  document.getElementById("modalRecetaView").style.display = "none";
}

function editarReceta(index) {
  recetaEditIndex = index;
  const receta = recetas[index];
  document.getElementById("editarNombreReceta").value = receta.nombre;
  document.getElementById("editarUnidadesProduccion").value = receta.unidades;
  const container = document.getElementById("editarIngredientesReceta");
  container.innerHTML = "";
  receta.ingredientes.forEach(ing => {
    const div = document.createElement("div");
    div.className = "ingrediente-row";
    const select = document.createElement("select");
    select.className = "select-materia";
    materiasPrimas.forEach(materia => {
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
    btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
    btnRemove.onclick = () => container.removeChild(div);
    div.appendChild(select);
    div.appendChild(inputCantidad);
    div.appendChild(btnRemove);
    container.appendChild(div);
  });
  document.getElementById("modalRecetaEdit").style.display = "block";
}

function cerrarModalRecetaEdit() {
  document.getElementById("modalRecetaEdit").style.display = "none";
}

function agregarIngredienteRecetaEdit() {
  const container = document.getElementById("editarIngredientesReceta");
  const div = document.createElement("div");
  div.className = "ingrediente-row";
  const select = document.createElement("select");
  select.className = "select-materia";
  materiasPrimas.forEach(materia => {
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
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = () => container.removeChild(div);
  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function guardarEdicionReceta() {
  const nombre = document.getElementById("editarNombreReceta").value;
  const unidades = document.getElementById("editarUnidadesProduccion").value;
  if (!nombre || !unidades) {
    alert("Completa el nombre y número de unidades de la receta.");
    return;
  }
  const container = document.getElementById("editarIngredientesReceta");
  const filas = container.getElementsByClassName("ingrediente-row");
  if (filas.length === 0) {
    alert("Agrega al menos un ingrediente.");
    return;
  }
  let costoTotal = 0;
  let ingredientesArray = [];
  for (let fila of filas) {
    const select = fila.querySelector(".select-materia");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = Number(select.value);
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
    costoTotal += cantidad * materia.costo;
    ingredientesArray.push({
      id: materia.id,
      materia: materia.nombre,
      cantidad,
      unidad: materia.unidad,
      costo: materia.costo
    });
  }
  const costoPorUnidad = costoTotal / Number(unidades);
  recetas[recetaEditIndex] = {
    nombre,
    unidades: Number(unidades),
    comentarios: recetas[recetaEditIndex].comentarios || "",
    ingredientes: ingredientesArray,
    costoTotal,
    costoPorUnidad
  };
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
  cerrarModalRecetaEdit();
}

/* ----- Funciones del Conversor ----- */
function convertirMedida() {
  const valor = parseFloat(document.getElementById("valorConversor").value);
  const unidadOrigen = document.getElementById("unidadOrigen").value;
  const unidadDestino = document.getElementById("unidadDestino").value;
  if (isNaN(valor)) {
    alert("Ingresa un valor numérico.");
    return;
  }
  let resultado;
  if ((unidadOrigen === "g" || unidadOrigen === "kg") && (unidadDestino === "g" || unidadDestino === "kg")) {
    let enGramos = unidadOrigen === "g" ? valor : valor * 1000;
    resultado = unidadDestino === "g" ? enGramos : enGramos / 1000;
  } else if ((unidadOrigen === "ml" || unidadOrigen === "l") && (unidadDestino === "ml" || unidadDestino === "l")) {
    let enMl = unidadOrigen === "ml" ? valor : valor * 1000;
    resultado = unidadDestino === "ml" ? enMl : enMl / 1000;
  } else {
    alert("Conversión no compatible.");
    return;
  }
  document.getElementById("resultadoConversor").innerHTML = `<p>Resultado: ${resultado}</p>`;
}

function abrirModalConversor() {
  document.getElementById("modalConversor").style.display = "block";
}

function cerrarModalConversor() {
  document.getElementById("modalConversor").style.display = "none";
}

function cerrarModalRecetaView() {
  document.getElementById("modalRecetaView").style.display = "none";
}

/* ----- Funciones del FAQ ----- */
function abrirModalFAQ() {
  document.getElementById("modalFAQ").style.display = "block";
}
function cerrarModalFAQ() {
  document.getElementById("modalFAQ").style.display = "none";
}

// Inicialización
window.onload = () => {
  showSection("recetas-section");
  mostrarMaterias();
  mostrarRecetas();
  translateApp();
};
