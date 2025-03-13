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
      request.onsuccess = function () {
        resolve();
      };
      request.onerror = function (e) {
        reject(e.target.error);
      };
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
      request.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

function deleteImage(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const request = store.delete(id);
      request.onsuccess = function () {
        resolve();
      };
      request.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

/* -------------------- Datos y Traducciones -------------------- */
// Variables globales
let recetaEditIndex = null;
let materiaEditIndex = null;
let gastoEditIndex = null;
let duplicarMode = false; // false: editar; true: duplicar
let currentLang = "es";   // idioma por defecto
let darkMode = false;
let duplicarRecetaData = null; // Para almacenar temporalmente la receta duplicada

// Datos en localStorage (sin imágenes)
let materiasPrimas = JSON.parse(localStorage.getItem("materias")) || [];
let recetas = JSON.parse(localStorage.getItem("recetas")) || [];
let gastosFijos = JSON.parse(localStorage.getItem("gastosFijos")) || [];

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
    faqTitle: "Preguntas Frecuentes",
    faqContent: `
      <ul class="faq-list">
        <li><strong>¿Qué es CostCalc Pro?</strong><br>
            Es una aplicación para calcular el costo de producción de recetas usando materias primas.</li>
        <li><strong>¿Cómo se agregan materias primas?</strong><br>
            En la sección "Materias Primas" ingresa nombre, costo y unidad, luego haz clic en "Agregar Materia Prima".</li>
        <li><strong>¿Cómo se crean las recetas?</strong><br>
            Ingresa el nombre, unidades, tiempo de cocción, ingredientes, gastos fijos y porcentaje de ganancia. La receta se guarda automáticamente.</li>
        <li><strong>¿Cómo se borran los datos?</strong><br>
            Utiliza los botones "Limpiar ..." en cada sección para borrar los datos almacenados en localStorage.</li>
      </ul>
    `,
    labelFotoReceta: "Subir foto (opcional)",
    labelFotoRecetaEdit: "Subir foto (opcional)"
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
    faqTitle: "Frequently Asked Questions",
    faqContent: `
      <ul class="faq-list">
        <li><strong>What is CostCalc Pro?</strong><br>
            It is an application to calculate production costs of recipes using raw materials.</li>
        <li><strong>How do I add a raw material?</strong><br>
            In the "Raw Materials" section, enter name, cost, and unit then click "Add Raw Material".</li>
        <li><strong>How do I create a recipe?</strong><br>
            Enter recipe details along with ingredients and fixed expenses. The recipe is saved automatically.</li>
        <li><strong>How can I clear data?</strong><br>
            Use the "Clear ..." buttons in each section to remove the stored data from localStorage.</li>
      </ul>
    `,
    labelFotoReceta: "Upload photo (optional)",
    labelFotoRecetaEdit: "Upload photo (optional)"
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
    faqTitle: "Perguntas Frequentes",
    faqContent: `
      <ul class="faq-list">
        <li><strong>O que é o CostCalc Pro?</strong><br>
            É um aplicativo para calcular o custo de produção de receitas usando matérias-primas.</li>
        <li><strong>Como adicionar uma matéria-prima?</strong><br>
            Na seção "Matérias-Primas", insira nome, custo e unidade e clique em "Adicionar Matéria-Prima".</li>
        <li><strong>Como criar uma receita?</strong><br>
            Insira os dados da receita, ingredientes e gastos fixos. A receita é salva automaticamente.</li>
        <li><strong>Como limpar os dados?</strong><br>
            Utilize os botões "Limpar ..." em cada seção para remover os dados do localStorage.</li>
      </ul>
    `,
    labelFotoReceta: "Enviar foto (opcional)",
    labelFotoRecetaEdit: "Enviar foto (opcional)"
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
    faqTitle: "よくある質問",
    faqContent: `
      <ul class="faq-list">
        <li><strong>CostCalc Proとは？</strong><br>
            CostCalc Proは、原材料を使ってレシピの生産コストを計算するアプリです。</li>
        <li><strong>原材料はどう追加しますか？</strong><br>
            「原材料」セクションで名前、コスト、単位を入力し「原材料を追加」をクリックします。</li>
        <li><strong>レシピはどう作成しますか？</strong><br>
            レシピの詳細、材料、固定費を入力すると自動的に保存されます。</li>
        <li><strong>データはどう消去しますか？</strong><br>
            各セクションの「クリア」ボタンでlocalStorageのデータを削除できます。</li>
      </ul>
    `,
    labelFotoReceta: "写真をアップロード（任意）",
    labelFotoRecetaEdit: "写真をアップロード（任意）"
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
    faqTitle: "常见问题",
    faqContent: `
      <ul class="faq-list">
        <li><strong>什么是 CostCalc Pro?</strong><br>
            这是一款通过原材料计算食谱生产成本的应用。</li>
        <li><strong>如何添加原材料？</strong><br>
            在“原材料”部分输入名称、成本、单位，然后点击“添加原材料”。</li>
        <li><strong>如何创建食谱？</strong><br>
            输入食谱详细信息、材料和固定费用后，食谱会自动保存。</li>
        <li><strong>如何清除数据？</strong><br>
            使用每个部分的“清除”按钮来删除localStorage中的数据。</li>
      </ul>
    `,
    labelFotoReceta: "上传照片（可选）",
    labelFotoRecetaEdit: "上传照片（可选）"
  }
};

/* -------------------- Funciones de traducción y UI -------------------- */
function translateApp() {
  const t = translations[currentLang];
  document.getElementById("headerTitle").innerText = t.headerTitle;
  document.getElementById("navRecetasText").innerText = t.navRecetas;
  document.getElementById("navMateriasText").innerText = t.navMaterias;
  document.getElementById("navConversorText").innerText = t.navConversor;
  document.getElementById("navGastosText").innerText = t.navGastos;
  document.getElementById("recetasTitle").innerText = t.crearReceta;
  document.getElementById("nombreReceta").placeholder = t.placeholderNombreReceta;
  document.getElementById("unidadesProduccion").placeholder = t.placeholderUnidades;
  document.getElementById("tiempoCoccion").placeholder = t.placeholderTiempoCoccion;
  document.getElementById("comentariosReceta").placeholder = t.placeholderComentarios;
  document.getElementById("btnAgregarIngrediente").innerText = t.btnAgregarIngrediente;
  document.getElementById("btnCalcularReceta").innerText = t.btnCalcularReceta;
  document.getElementById("recetasGuardadasTitle").innerText = t.recetasGuardadas;
  
  document.getElementById("fotoRecetaLabel").innerText = t.labelFotoReceta;
  if(document.getElementById("fotoRecetaEditLabel"))
    document.getElementById("fotoRecetaEditLabel").innerText = t.labelFotoRecetaEdit;
  
  document.getElementById("btnAgregarGastoReceta").innerText = t.btnAgregarGastoReceta;
  document.getElementById("porcentajeGanancia").placeholder = t.placeholderGanancia;
  
  document.getElementById("materiaTitle").innerText = t.materiaTitle;
  document.getElementById("nombreMateria").placeholder = t.placeholderNombreMateria;
  document.getElementById("costoMateria").placeholder = t.placeholderCostoMateria;
  document.getElementById("unidadMateria").placeholder = t.placeholderUnidadMateria;
  document.getElementById("btnAgregarMateria").innerText = t.btnAgregarMateria;
  
  document.getElementById("gastosTitle").innerText = t.gastosTitle;
  document.getElementById("nombreGasto").placeholder = t.placeholderNombreGasto;
  document.getElementById("costoGasto").placeholder = t.placeholderCostoGasto;
  document.getElementById("btnAgregarGasto").innerText = t.btnAgregarGasto;
  
  document.getElementById("conversorTitle").innerText = t.conversorTitle;
  document.getElementById("valorConversor").placeholder = t.placeholderValorConversor;
  
  document.getElementById("detalleRecetaTitle").innerText = t.detalleRecetaTitle;
  
  if (duplicarMode) {
    document.getElementById("editarRecetaTitle").innerText = t.duplicarRecetaTitle || "Duplicar Receta";
  } else {
    document.getElementById("editarRecetaTitle").innerText = t.editarRecetaTitle;
  }
  document.getElementById("editarNombreReceta").placeholder = t.placeholderEditarNombreReceta;
  document.getElementById("editarUnidadesProduccion").placeholder = t.placeholderEditarUnidades;
  document.getElementById("editarTiempoCoccion").placeholder = t.placeholderTiempoCoccion;
  document.getElementById("btnAgregarIngredienteEdit").innerText = t.btnAgregarIngredienteEdit;
  document.getElementById("btnGuardarCambiosReceta").innerText = t.btnGuardarCambiosReceta;
  
  document.getElementById("editarMateriaTitle").innerText = t.editarMateriaTitle;
  document.getElementById("editarNombreMateria").placeholder = t.placeholderEditarNombreMateria;
  document.getElementById("editarCostoMateria").placeholder = t.placeholderEditarCostoMateria;
  document.getElementById("editarUnidadMateria").placeholder = t.placeholderEditarUnidadMateria;
  document.getElementById("btnGuardarCambiosMateria").innerText = t.btnGuardarCambiosMateria;
  
  if (document.getElementById("modalGastoEdit")) {
    document.getElementById("editarGastoTitle").innerText = t.editarGastoTitle;
    document.getElementById("editarNombreGasto").placeholder = t.placeholderEditarNombreGasto;
    document.getElementById("editarCostoGasto").placeholder = t.placeholderEditarCostoGasto;
    document.getElementById("btnGuardarCambiosGasto").innerText = t.btnGuardarCambiosGasto;
  }
  
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

function showSection(sectionId) {
  document.getElementById("recetas-section").style.display = (sectionId === "recetas-section") ? "block" : "none";
  document.getElementById("materias-section").style.display = (sectionId === "materias-section") ? "block" : "none";
  document.getElementById("gastos-section").style.display = (sectionId === "gastos-section") ? "block" : "none";
}

/* -------------------- Funciones para Materias Primas -------------------- */
function guardarMaterias() {
  localStorage.setItem("materias", JSON.stringify(materiasPrimas));
}

function mostrarMaterias() {
  const lista = document.getElementById("listaMaterias");
  lista.innerHTML = "";
  const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  materiasOrdenadas.forEach(function(materia) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${materia.nombre}: $${materia.costo} por ${materia.unidad}</span>
      <div class="lista-btns">
        <button onclick="editarMateria('${materia.id}')"><i class="fas fa-edit"></i></button>
        <button onclick="eliminarMateria('${materia.id}')"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
  });
}

function agregarMateria() {
  const nombre = document.getElementById("nombreMateria").value;
  const costo = document.getElementById("costoMateria").value;
  const unidad = document.getElementById("unidadMateria").value;
  if (nombre && costo && unidad) {
    const nuevaMateria = { id: Date.now().toString(), nombre, costo: parseFloat(costo), unidad };
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
  const index = materiasPrimas.findIndex(m => m.id === id);
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

function eliminarMateria(id) {
  if (confirm("¿Eliminar esta materia prima?")) {
    materiasPrimas = materiasPrimas.filter(m => m.id !== id);
    guardarMaterias();
    mostrarMaterias();
    actualizarFijosReceta();
  }
}

function cerrarModalMateriaEdit() {
  document.getElementById("modalMateriaEdit").style.display = "none";
}

function actualizarRecetasConMateria() {
  recetas.forEach(function(receta) {
    let nuevoCostoTotal = 0;
    receta.ingredientes.forEach(function(ing) {
      const materiaActual = materiasPrimas.find(m => m.id === ing.id);
      if (materiaActual) {
        ing.costo = materiaActual.costo;
        ing.materia = materiaActual.nombre;
        ing.unidad = materiaActual.unidad;
      }
      nuevoCostoTotal += ing.cantidad * ing.costo;
    });
    receta.costoTotal = nuevoCostoTotal + receta.gastosIncluidos;
    receta.costoPorUnidad = receta.unidades ? receta.costoTotal / receta.unidades : 0;
    receta.precioSugerido = receta.costoPorUnidad * (1 + (receta.porcentajeGanancia || 0) / 100);
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
  gastosFijos.forEach(function(gasto, index) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${gasto.nombre}: $${gasto.costo}</span>
      <div class="lista-btns">
        <button onclick="editarGasto(${index})"><i class="fas fa-edit"></i></button>
        <button onclick="eliminarGasto(${index})"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
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
    actualizarRecetasConGasto();
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
      costo: parseFloat(costo)
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
  gastosFijos.forEach(function(gasto) {
    const option = document.createElement("option");
    option.value = gasto.id;
    option.textContent = gasto.nombre + " ($" + gasto.costo + ")";
    select.appendChild(option);
  });
  
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";
  
  const btnRemove = document.createElement("button");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function() {
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
  gastosFijos.forEach(function(gasto) {
    const option = document.createElement("option");
    option.value = gasto.id;
    option.textContent = gasto.nombre + " ($" + gasto.costo + ")";
    select.appendChild(option);
  });
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";
  const btnRemove = document.createElement("button");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function() {
    container.removeChild(div);
  };
  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function actualizarRecetasConGasto() {
  recetas.forEach(function(receta) {
    let nuevoGastos = 0;
    if (receta.gastosReceta) {
      receta.gastosReceta.forEach(function(gasto) {
        const gastoActual = gastosFijos.find(g => g.id === gasto.id);
        if (gastoActual) {
          gasto.costo = gastoActual.costo;
          gasto.nombre = gastoActual.nombre;
          nuevoGastos += gasto.cantidad * gastoActual.costo;
        }
      });
    }
    receta.gastosIncluidos = nuevoGastos;
    let costoIngredientes = 0;
    receta.ingredientes.forEach(function(ing) {
      costoIngredientes += ing.cantidad * ing.costo;
    });
    receta.costoTotal = costoIngredientes + nuevoGastos;
    receta.costoPorUnidad = receta.unidades ? receta.costoTotal / receta.unidades : 0;
    receta.precioSugerido = receta.costoPorUnidad * (1 + (receta.porcentajeGanancia || 0)/100);
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
  const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  materiasOrdenadas.forEach(function(materia) {
    const option = document.createElement("option");
    option.value = materia.id;
    option.textContent = materia.nombre + " (" + materia.unidad + ")";
    select.appendChild(option);
  });
  
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";
  
  const btnRemove = document.createElement("button");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function() {
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
  const costoPorUnidad = costoTotalFinal / Number(unidadesProduccion);
  const porcentajeGanancia = parseFloat(document.getElementById("porcentajeGanancia").value) || 0;
  const precioSugerido = costoPorUnidad * (1 + porcentajeGanancia / 100);
  
  // Crear receta con un id único
  let receta = {
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
    // Guardaremos solo la referencia al id de la imagen en IndexedDB
    foto: null
  };
  
  const file = document.getElementById("fotoReceta").files[0];
  if (file) {
    saveImage(receta.id, file)
      .then(() => {
        receta.foto = receta.id;
        recetas.push(receta);
        localStorage.setItem("recetas", JSON.stringify(recetas));
        mostrarRecetas();
        // Limpiar campos
        document.getElementById("nombreReceta").value = "";
        document.getElementById("unidadesProduccion").value = "";
        document.getElementById("tiempoCoccion").value = "";
        document.getElementById("comentariosReceta").value = "";
        document.getElementById("porcentajeGanancia").value = "";
        document.getElementById("fotoReceta").value = "";
        containerIng.innerHTML = "";
        containerGastos.innerHTML = "";
      })
      .catch(err => {
        alert("Error guardando la imagen: " + err);
      });
  } else {
    recetas.push(receta);
    localStorage.setItem("recetas", JSON.stringify(recetas));
    mostrarRecetas();
    // Limpiar campos
    document.getElementById("nombreReceta").value = "";
    document.getElementById("unidadesProduccion").value = "";
    document.getElementById("tiempoCoccion").value = "";
    document.getElementById("comentariosReceta").value = "";
    document.getElementById("porcentajeGanancia").value = "";
    containerIng.innerHTML = "";
    containerGastos.innerHTML = "";
  }
}

function mostrarRecetas() {
  const lista = document.getElementById("listaRecetas");
  lista.innerHTML = "";
  recetas.forEach(function(receta, index) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${receta.nombre}</strong> - Total: $${receta.costoTotal.toFixed(2)} - C/U: $${receta.costoPorUnidad.toFixed(2)}
      <div class="lista-btns">
        <button onclick="verReceta(${index})"><i class="fas fa-eye"></i></button>
        <button onclick="editarReceta(${index})"><i class="fas fa-edit"></i></button>
        <button onclick="duplicarReceta(${index})" class="duplicar"><i class="fas fa-copy"></i></button>
        <button onclick="eliminarReceta(${index})"><i class="fas fa-trash"></i></button>
      </div>`;
    lista.appendChild(li);
  });
}

function eliminarReceta(index) {
  if (confirm("¿Eliminar esta receta?")) {
    const receta = recetas[index];
    // Borrar imagen de IndexedDB si existe
    if (receta.foto) {
      deleteImage(receta.foto).catch(err => console.error("Error borrando imagen:", err));
    }
    recetas.splice(index, 1);
    localStorage.setItem("recetas", JSON.stringify(recetas));
    mostrarRecetas();
  }
}

function verReceta(index) {
  const receta = recetas[index];
  const fotoEl = document.getElementById("fotoRecetaDisplay");
  if (receta.foto) {
    getImage(receta.foto)
      .then(blob => {
        if (blob) {
          fotoEl.src = URL.createObjectURL(blob);
          fotoEl.style.display = "block";
        } else {
          fotoEl.style.display = "none";
        }
      })
      .catch(err => {
        console.error("Error obteniendo imagen:", err);
        fotoEl.style.display = "none";
      });
  } else {
    fotoEl.style.display = "none";
  }
  let html = `<p><strong>Nombre:</strong> ${receta.nombre}</p>
    <p><strong>Unidades producidas:</strong> ${receta.unidades}</p>
    <p><strong>Tiempo de cocción:</strong> ${receta.tiempoCoccion} min</p>
    ${receta.comentarios ? `<p><strong>Comentarios:</strong><br>${receta.comentarios}</p>` : ""}
    <p><strong>Costo solo ingredientes:</strong> $${(receta.costoTotal - receta.gastosIncluidos).toFixed(2)}</p>
    <p><strong>Gastos fijos incluidos:</strong> $${receta.gastosIncluidos.toFixed(2)}</p>
    <p><strong>Total:</strong> $${receta.costoTotal.toFixed(2)}</p>
    <p><strong>Costo por unidad:</strong> $${receta.costoPorUnidad.toFixed(2)}</p>
    <p><strong>Precio sugerido por unidad:</strong> $${receta.precioSugerido.toFixed(2)}</p>
    <h3>Ingredientes:</h3><ul>`;
  receta.ingredientes.forEach(function(ing) {
    html += `<li>${ing.materia} - ${ing.cantidad} ${ing.unidad} (Costo: $${ing.costo})</li>`;
  });
  html += "</ul>";
  html += "<h3>Gastos fijos incluidos:</h3><ul>";
  receta.gastosReceta.forEach(function(gasto) {
    html += `<li>${gasto.nombre} - ${gasto.cantidad} (Costo unitario: $${gasto.costo})</li>`;
  });
  html += "</ul>";
  document.getElementById("detalleReceta").innerHTML = html;
  document.getElementById("modalRecetaView").style.display = "block";
}

function cerrarModalRecetaView() {
  document.getElementById("modalRecetaView").style.display = "none";
}

function editarReceta(index) {
  duplicarMode = false;
  recetaEditIndex = index;
  const receta = recetas[index];
  document.getElementById("editarNombreReceta").value = receta.nombre;
  document.getElementById("editarUnidadesProduccion").value = receta.unidades;
  document.getElementById("editarTiempoCoccion").value = receta.tiempoCoccion || "";
  document.getElementById("editarComentariosReceta").value = receta.comentarios || "";
  
  const containerIng = document.getElementById("editarIngredientesReceta");
  containerIng.innerHTML = "";
  receta.ingredientes.forEach(function(ing) {
    const div = document.createElement("div");
    div.className = "ingrediente-row";
    const select = document.createElement("select");
    select.className = "select-materia";
    const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
    materiasOrdenadas.forEach(function(materia) {
      const option = document.createElement("option");
      option.value = materia.id;
      option.textContent = materia.nombre + " (" + materia.unidad + ")";
      if (materia.id === ing.id) { option.selected = true; }
      select.appendChild(option);
    });
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.placeholder = "Cantidad";
    inputCantidad.className = "input-cantidad";
    inputCantidad.value = ing.cantidad;
    const btnRemove = document.createElement("button");
    btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
    btnRemove.onclick = function() {
      containerIng.removeChild(div);
    };
    div.appendChild(select);
    div.appendChild(inputCantidad);
    div.appendChild(btnRemove);
    containerIng.appendChild(div);
  });
  
  const containerGastos = document.getElementById("editarFijosRecetaContainer");
  containerGastos.innerHTML = "";
  if (receta.gastosReceta) {
    receta.gastosReceta.forEach(function(gasto) {
      const div = document.createElement("div");
      div.className = "gasto-receta-row";
      const select = document.createElement("select");
      select.className = "select-gasto";
      gastosFijos.forEach(function(g) {
        const option = document.createElement("option");
        option.value = g.id;
        option.textContent = g.nombre + " ($" + g.costo + ")";
        if (g.id === gasto.id) { option.selected = true; }
        select.appendChild(option);
      });
      const inputCantidad = document.createElement("input");
      inputCantidad.type = "number";
      inputCantidad.placeholder = "Cantidad";
      inputCantidad.className = "input-cantidad";
      inputCantidad.value = gasto.cantidad;
      const btnRemove = document.createElement("button");
      btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemove.onclick = function() {
        containerGastos.removeChild(div);
      };
      div.appendChild(select);
      div.appendChild(inputCantidad);
      div.appendChild(btnRemove);
      containerGastos.appendChild(div);
    });
  }
  
  document.getElementById("fotoRecetaEdit").value = "";
  duplicarMode = false;
  document.getElementById("editarRecetaTitle").innerText = translations[currentLang].editarRecetaTitle;
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
  const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  materiasOrdenadas.forEach(function(materia) {
    const option = document.createElement("option");
    option.value = materia.id;
    option.textContent = materia.nombre + " (" + materia.unidad + ")";
    select.appendChild(option);
  });
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";
  const btnRemove = document.createElement("button");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function() {
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
  gastosFijos.forEach(function(gasto) {
    const option = document.createElement("option");
    option.value = gasto.id;
    option.textContent = gasto.nombre + " ($" + gasto.costo + ")";
    select.appendChild(option);
  });
  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";
  inputCantidad.className = "input-cantidad";
  const btnRemove = document.createElement("button");
  btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
  btnRemove.onclick = function() {
    container.removeChild(div);
  };
  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnRemove);
  container.appendChild(div);
}

function duplicarReceta(index) {
  duplicarMode = true;
  duplicarRecetaData = JSON.parse(JSON.stringify(recetas[index]));
  // No se conserva el id original; se asignará uno nuevo al duplicar
  document.getElementById("editarNombreReceta").value = duplicarRecetaData.nombre + " (Duplicado)";
  document.getElementById("editarUnidadesProduccion").value = duplicarRecetaData.unidades;
  document.getElementById("editarTiempoCoccion").value = duplicarRecetaData.tiempoCoccion || "";
  document.getElementById("editarComentariosReceta").value = duplicarRecetaData.comentarios || "";
  
  const containerIng = document.getElementById("editarIngredientesReceta");
  containerIng.innerHTML = "";
  duplicarRecetaData.ingredientes.forEach(function(ing) {
    const div = document.createElement("div");
    div.className = "ingrediente-row";
    const select = document.createElement("select");
    select.className = "select-materia";
    const materiasOrdenadas = materiasPrimas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
    materiasOrdenadas.forEach(function(materia) {
      const option = document.createElement("option");
      option.value = materia.id;
      option.textContent = materia.nombre + " (" + materia.unidad + ")";
      if (materia.id === ing.id) { option.selected = true; }
      select.appendChild(option);
    });
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.placeholder = "Cantidad";
    inputCantidad.className = "input-cantidad";
    inputCantidad.value = ing.cantidad;
    const btnRemove = document.createElement("button");
    btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
    btnRemove.onclick = function() {
      containerIng.removeChild(div);
    };
    div.appendChild(select);
    div.appendChild(inputCantidad);
    div.appendChild(btnRemove);
    containerIng.appendChild(div);
  });
  
  const containerGastos = document.getElementById("editarFijosRecetaContainer");
  containerGastos.innerHTML = "";
  if (duplicarRecetaData.gastosReceta) {
    duplicarRecetaData.gastosReceta.forEach(function(gasto) {
      const div = document.createElement("div");
      div.className = "gasto-receta-row";
      const select = document.createElement("select");
      select.className = "select-gasto";
      gastosFijos.forEach(function(g) {
        const option = document.createElement("option");
        option.value = g.id;
        option.textContent = g.nombre + " ($" + g.costo + ")";
        if (g.id === gasto.id) { option.selected = true; }
        select.appendChild(option);
      });
      const inputCantidad = document.createElement("input");
      inputCantidad.type = "number";
      inputCantidad.placeholder = "Cantidad";
      inputCantidad.className = "input-cantidad";
      inputCantidad.value = gasto.cantidad;
      const btnRemove = document.createElement("button");
      btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemove.onclick = function() {
        containerGastos.removeChild(div);
      };
      div.appendChild(select);
      div.appendChild(inputCantidad);
      div.appendChild(btnRemove);
      containerGastos.appendChild(div);
    });
  }
  
  document.getElementById("editarRecetaTitle").innerText = translations[currentLang].duplicarRecetaTitle || "Duplicar Receta";
  document.getElementById("modalRecetaEdit").style.display = "block";
}

function guardarEdicionReceta() {
  const nombre = document.getElementById("editarNombreReceta").value;
  const unidades = document.getElementById("editarUnidadesProduccion").value;
  const tiempoCoccion = document.getElementById("editarTiempoCoccion").value;
  const comentarios = document.getElementById("editarComentariosReceta").value;
  
  if (!nombre || !unidades) {
    alert("Completa el nombre y número de unidades de la receta.");
    return;
  }
  
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
  const porcentajeGanancia = parseFloat(document.getElementById("porcentajeGanancia").value) || 0;
  const precioSugerido = costoPorUnidad * (1 + porcentajeGanancia / 100);
  
  if (duplicarMode) {
    // En duplicar, crear nueva receta con id nuevo
    const newId = Date.now().toString();
    let newReceta = {
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
      foto: null
    };
    const file = document.getElementById("fotoRecetaEdit").files[0];
    if (file) {
      saveImage(newId, file)
        .then(() => {
          newReceta.foto = newId;
          recetas.push(newReceta);
          localStorage.setItem("recetas", JSON.stringify(recetas));
          mostrarRecetas();
          cerrarModalRecetaEdit();
          duplicarMode = false;
          duplicarRecetaData = null;
        })
        .catch(err => alert("Error guardando la imagen: " + err));
    } else if (duplicarRecetaData && duplicarRecetaData.foto) {
      // Si no se selecciona nueva imagen, copiar la imagen original
      getImage(duplicarRecetaData.foto)
        .then(blob => {
          if (blob) {
            return saveImage(newId, blob);
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          newReceta.foto = newId;
          recetas.push(newReceta);
          localStorage.setItem("recetas", JSON.stringify(recetas));
          mostrarRecetas();
          cerrarModalRecetaEdit();
          duplicarMode = false;
          duplicarRecetaData = null;
        })
        .catch(err => alert("Error copiando la imagen: " + err));
    } else {
      newReceta.foto = null;
      recetas.push(newReceta);
      localStorage.setItem("recetas", JSON.stringify(recetas));
      mostrarRecetas();
      cerrarModalRecetaEdit();
      duplicarMode = false;
      duplicarRecetaData = null;
    }
  } else {
    // Modo edición: actualizar receta existente
    const recetaActual = recetas[recetaEditIndex];
    recetaActual.nombre = nombre;
    recetaActual.unidades = Number(unidades);
    recetaActual.tiempoCoccion = tiempoCoccion;
    recetaActual.comentarios = comentarios;
    recetaActual.ingredientes = ingredientesArray;
    recetaActual.gastosReceta = gastosRecetaArray;
    recetaActual.gastosIncluidos = costoGastosReceta;
    recetaActual.costoTotal = costoTotalFinal;
    recetaActual.costoPorUnidad = costoPorUnidad;
    recetaActual.porcentajeGanancia = porcentajeGanancia;
    recetaActual.precioSugerido = precioSugerido;
    
    const file = document.getElementById("fotoRecetaEdit").files[0];
    if (file) {
      saveImage(recetaActual.id, file)
        .then(() => {
          recetaActual.foto = recetaActual.id;
          localStorage.setItem("recetas", JSON.stringify(recetas));
          mostrarRecetas();
          cerrarModalRecetaEdit();
        })
        .catch(err => alert("Error actualizando la imagen: " + err));
    } else {
      // Si no se selecciona nueva imagen, se conserva la anterior
      localStorage.setItem("recetas", JSON.stringify(recetas));
      mostrarRecetas();
      cerrarModalRecetaEdit();
    }
  }
}

/* -------------------- Funciones para Exportar/Importar Datos -------------------- */
function exportData() {
  const data = {
    materias: materiasPrimas,
    recetas: recetas,
    gastosFijos: gastosFijos
  };
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
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
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.materias && data.recetas && data.gastosFijos) {
        data.materias.forEach(materiaImport => {
          if (!materiasPrimas.some(m => m.nombre.trim().toLowerCase() === materiaImport.nombre.trim().toLowerCase())) {
            materiasPrimas.push(materiaImport);
          }
        });
        data.gastosFijos.forEach(gastoImport => {
          if (!gastosFijos.some(g => g.nombre.trim().toLowerCase() === gastoImport.nombre.trim().toLowerCase())) {
            gastosFijos.push(gastoImport);
          }
        });
        data.recetas.forEach(recetaImport => {
          if (!recetas.some(r => r.nombre.trim().toLowerCase() === recetaImport.nombre.trim().toLowerCase())) {
            recetas.push(recetaImport);
          }
        });
        localStorage.setItem("materias", JSON.stringify(materiasPrimas));
        localStorage.setItem("gastosFijos", JSON.stringify(gastosFijos));
        localStorage.setItem("recetas", JSON.stringify(recetas));
        mostrarMaterias();
        mostrarRecetas();
        mostrarGastos();
        actualizarFijosReceta();
        actualizarRecetasConGasto();
        alert("Datos importados correctamente.");
      } else {
        alert("El archivo no contiene datos válidos.");
      }
    } catch (error) {
      alert("Error al importar los datos: " + error);
    }
  };
  reader.readAsText(file);
}

/* -------------------- Conversor y Mini Calculadora -------------------- */
function convertirMedida() {
  const valor = parseFloat(document.getElementById("valorConversor").value);
  const unidadOrigen = document.getElementById("unidadOrigen").value;
  const unidadDestino = document.getElementById("unidadDestino").value;
  if (isNaN(valor)) {
    alert("Ingrese un valor numérico.");
    return;
  }
  
  let resultado = 0;
  if ((unidadOrigen === "g" || unidadOrigen === "kg") && (unidadDestino === "g" || unidadDestino === "kg")) {
    if (unidadOrigen === "g" && unidadDestino === "kg") {
      resultado = valor / 1000;
    } else if (unidadOrigen === "kg" && unidadDestino === "g") {
      resultado = valor * 1000;
    } else {
      resultado = valor;
    }
  }
  else if ((unidadOrigen === "ml" || unidadOrigen === "l") && (unidadDestino === "ml" || unidadDestino === "l")) {
    if (unidadOrigen === "ml" && unidadDestino === "l") {
      resultado = valor / 1000;
    } else if (unidadOrigen === "l" && unidadDestino === "ml") {
      resultado = valor * 1000;
    } else {
      resultado = valor;
    }
  } else {
    alert("Conversión entre unidades incompatibles.");
    return;
  }
  
  document.getElementById("resultadoConversor").innerText = "Resultado: " + resultado;
}

function abrirModalConversor() {
  document.getElementById("modalConversor").style.display = "block";
}

function cerrarModalConversor() {
  document.getElementById("modalConversor").style.display = "none";
}

function abrirMiniCalculator() {
  document.getElementById("modalMiniCalc").style.display = "block";
}

function cerrarMiniCalculator() {
  document.getElementById("modalMiniCalc").style.display = "none";
}

function calcularMini() {
  const input = document.getElementById("miniCalcInput").value;
  try {
    const resultado = eval(input);
    document.getElementById("miniCalcResult").innerText = resultado;
  } catch (error) {
    document.getElementById("miniCalcResult").innerText = "Error";
  }
}

function abrirModalFAQ() {
  document.getElementById("modalFAQ").style.display = "block";
}

function cerrarModalFAQ() {
  document.getElementById("modalFAQ").style.display = "none";
}

/* -------------------- Funciones para limpiar datos -------------------- */
function limpiarMaterias() {
  if (confirm("¿Estás seguro de eliminar todas las Materias Primas?")) {
    materiasPrimas = [];
    localStorage.removeItem("materias");
    mostrarMaterias();
    alert("Materias Primas eliminadas.");
  }
}

function limpiarRecetas() {
  if (confirm("¿Estás seguro de eliminar todas las Recetas?")) {
    // Borrar imágenes de IndexedDB para cada receta que tenga foto
    recetas.forEach(receta => {
      if (receta.foto) {
        deleteImage(receta.foto).catch(err => console.error("Error borrando imagen:", err));
      }
    });
    recetas = [];
    localStorage.removeItem("recetas");
    mostrarRecetas();
    alert("Recetas eliminadas.");
  }
}

function limpiarGastos() {
  if (confirm("¿Estás seguro de eliminar todos los Gastos Fijos?")) {
    gastosFijos = [];
    localStorage.removeItem("gastosFijos");
    mostrarGastos();
    alert("Gastos Fijos eliminados.");
  }
}

/* -------------------- Función reservada para actualizar UI de gastos fijos -------------------- */
function actualizarFijosReceta() {}

/* -------------------- Inicialización -------------------- */
window.onload = function() {
  translateApp();
  mostrarMaterias();
  mostrarRecetas();
  mostrarGastos();
};
