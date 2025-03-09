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
            CostCalc Pro es una aplicación que te permite calcular el costo de producción de recetas utilizando materias primas. Por ejemplo, puedes ingresar el costo de harina, agua y otros ingredientes para saber cuánto cuesta producir cada unidad de tu receta.</li>
        <li><strong>¿Cómo agrego una materia prima?</strong><br>
            Ve a la solapa "Materias Primas", ingresa el nombre, costo y la unidad (por ejemplo, “Harina”, "$0.50" y "kg") y haz clic en "Agregar Materia Prima". Estas materias se usarán al crear tus recetas.</li>
        <li><strong>¿Cómo creo una receta?</strong><br>
            En la solapa "Recetas", ingresa el nombre de la receta y el número de unidades que produces. Puedes agregar comentarios si lo deseas. Luego, añade ingredientes seleccionando una materia prima y especificando la cantidad (por ejemplo, 2 kg de harina). Finalmente, haz clic en "Calcular Receta" para ver el costo total y el costo por unidad.</li>
        <li><strong>¿Cómo edito una receta o materia prima?</strong><br>
            En la lista de recetas o materias, utiliza el botón de editar (icono de lápiz) para abrir un modal con la información actual. Realiza los cambios necesarios y presiona "Guardar Cambios".</li>
        <li><strong>¿Cómo se calculan los costos?</strong><br>
            El costo total de una receta se calcula multiplicando la cantidad de cada ingrediente por su costo y luego sumando estos valores. Por ejemplo, si usas 2 kg de harina a $0.50 por kg y 1 litro de agua a $0.20, el costo será: (2 x 0.50) + (1 x 0.20) = $1.20.</li>
      </ul>`
  },
  en: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Recipes",
    navMaterias: "Raw Materials",
    navConversor: "Converter",
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
            CostCalc Pro is an application that helps you calculate production costs of recipes using raw materials. For example, you can input the cost of flour, water, etc., to know the cost per unit of your recipe.</li>
        <li><strong>How do I add a raw material?</strong><br>
            Go to the "Raw Materials" tab, enter the name, cost, and unit (e.g., “Flour”, "$0.50" and "kg"), and click "Add Raw Material". These materials will be available when creating recipes.</li>
        <li><strong>How do I create a recipe?</strong><br>
            In the "Recipes" tab, enter the recipe name and the number of units produced. You can add optional comments. Then, add ingredients by selecting a raw material and specifying the quantity (e.g., 2 kg of flour). Click "Calculate Recipe" to see the total cost and cost per unit.</li>
        <li><strong>How do I edit a recipe or raw material?</strong><br>
            In the saved recipes or raw materials list, use the edit button (pencil icon) to open a modal with the current information. Make your changes and click "Save Changes".</li>
        <li><strong>How are costs calculated?</strong><br>
            The total cost of a recipe is calculated by multiplying the quantity of each ingredient by its cost and then summing the results. For instance, if you use 2 kg of flour at $0.50 per kg and 1 liter of water at $0.20, the cost would be: (2 x 0.50) + (1 x 0.20) = $1.20.</li>
      </ul>`
  },
  pt: {
    headerTitle: "CostCalc Pro",
    navRecetas: "Receitas",
    navMaterias: "Matérias-Primas",
    navConversor: "Conversor",
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
            CostCalc Pro é um aplicativo que ajuda a calcular o custo de produção de receitas utilizando matérias-primas. Por exemplo, você pode inserir o custo da farinha, água, etc., para saber o custo por unidade de sua receita.</li>
        <li><strong>Como adiciono uma matéria-prima?</strong><br>
            Vá até a aba "Matérias-Primas", insira o nome, custo e unidade (ex.: “Farinha”, “$0,50” e “kg”) e clique em "Adicionar Matéria-Prima". Essas matérias estarão disponíveis para a criação de receitas.</li>
        <li><strong>Como crio uma receita?</strong><br>
            Na aba "Receitas", insira o nome da receita e o número de unidades produzidas. Você pode adicionar comentários opcionais. Em seguida, adicione os ingredientes selecionando uma matéria-prima e especificando a quantidade (ex.: 2 kg de farinha). Clique em "Calcular Receita" para ver o custo total e o custo por unidade.</li>
        <li><strong>Como edito uma receita ou matéria-prima?</strong><br>
            Na lista de receitas ou matérias-primas, use o botão de editar (ícone de lápis) para abrir um modal com as informações atuais. Faça as alterações necessárias e clique em "Salvar Alterações".</li>
        <li><strong>Como os custos são calculados?</strong><br>
            O custo total de uma receita é calculado multiplicando a quantidade de cada ingrediente pelo seu custo e somando os resultados. Por exemplo, se você usar 2 kg de farinha a $0,50 por kg e 1 litro de água a $0,20, o custo será: (2 x 0,50) + (1 x 0,20) = $1,20.</li>
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
  
  // Actualiza FAQ
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

// Funciones para alternar secciones
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

// Conversor
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

// FAQ Modal
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
