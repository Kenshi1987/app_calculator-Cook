"use strict";

// Variables globales
let recetaEditIndex = null;
let materiaEditIndex = null;
let gastoEditIndex = null;
let duplicarMode = false; // false: editar; true: duplicar
let currentLang = "es";   // idioma por defecto
let darkMode = false;

// Cargar datos desde localStorage (para sincronización multi-dispositivo se recomienda un backend)
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
            Es una aplicación para calcular el costo de producción de recetas usando materias primas. Por ejemplo, puedes saber cuánto cuesta producir cada pan o torta.</li>
        <li><strong>¿Cómo agrego una materia prima?</strong><br>
            Ve a la pestaña "Materias Primas", ingresa el nombre, costo y unidad (ej. "Harina", "$1.0", "kg") y haz clic en "Agregar Materia Prima".</li>
        <li><strong>¿Cómo creo una receta?</strong><br>
            Ingresa el nombre, número de unidades, tiempo de cocción y agrega ingredientes. Luego, de forma similar a los ingredientes, agrega los gastos fijos (selecciona de una lista y especifica cantidad) y define un % de ganancia. Se mostrará el costo solo de ingredientes, el total (ingredientes + gastos fijos) y el precio sugerido por unidad.</li>
        <li><strong>¿Cómo agrego gastos fijos?</strong><br>
            En la pestaña "Gastos Fijos", ingresa el nombre y costo (ej.: Luz, $0.5). Estos datos se guardan y se pueden usar en la receta, donde podrás seleccionarlos (con cantidad) y, además, editarlos.</li>
        <li><strong>¿Cómo edito o duplico una receta?</strong><br>
            Utiliza el botón de editar (ícono de lápiz) para modificar o el botón de duplicar (ícono de copia) para crear una nueva basada en una existente.</li>
        <li><strong>¿Cómo se calculan los costos?</strong><br>
            El costo total se calcula sumando el costo de los ingredientes y los gastos fijos seleccionados. El precio sugerido por unidad se obtiene dividiendo el costo total entre las unidades y aplicando el % de ganancia.</li>
        <li><strong>¿Cómo calcular el gas?</strong><br>
            El consumo promedio de gas de un horno es de 0.32 metros cúbicos por hora. Para calcular el precio de un minuto de gas, realiza la siguiente cuenta: (Costo de la boleta de gas / (Metros cúbicos consumidos en el mes / 0.32)) / 60.
        </li>
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
            It is an application to calculate production costs of recipes using raw materials. For example, you can know the cost per unit of each bread or cake.</li>
        <li><strong>How do I add a raw material?</strong><br>
            Go to the "Raw Materials" tab, enter the name, cost, and unit (e.g., "Flour", "$1.0", "kg") and click "Add Raw Material".</li>
        <li><strong>How do I create a recipe?</strong><br>
            Enter the recipe name, number of units, cooking time and add ingredients. Then, similarly, add fixed expenses (select from a list and specify quantity) and enter a profit percentage. The app will show the cost of ingredients only, the total cost (ingredients + fixed expenses) and the suggested price per unit.</li>
        <li><strong>How do I add fixed expenses?</strong><br>
            In the "Fixed Expenses" tab, enter expenses such as electricity, gas, packaging, or taxes. These are saved and can be selected (with quantity and edited) in a recipe.</li>
        <li><strong>How do I edit or duplicate a recipe?</strong><br>
            Use the edit button (pencil icon) to modify an existing recipe or the duplicate button (copy icon) to create a new one based on an existing recipe.</li>
        <li><strong>How are costs calculated?</strong><br>
            The total cost is the sum of ingredient costs plus the selected fixed expenses. The suggested price per unit is calculated by dividing the total cost by the number of units and applying the profit percentage.</li>
        <li><strong>How do I calculate the gas cost?</strong><br>
            A typical oven consumes 0.32 cubic meters of gas per hour. To calculate the price per minute of gas, perform the following calculation: (Cost of the gas bill / (Cubic meters consumed in the month / 0.32)) / 60.
        </li>
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
            É um aplicativo para calcular o custo de produção de receitas usando matérias-primas. Por exemplo, você pode saber quanto custa produzir cada pão ou bolo.</li>
        <li><strong>Como adicionar uma matéria-prima?</strong><br>
            Vá para a aba "Matérias-Primas", insira o nome, custo e unidade (ex.: "Farinha", "$1.0", "kg") e clique em "Adicionar Matéria-Prima".</li>
        <li><strong>Como criar uma receita?</strong><br>
            Insira o nome da receita, número de unidades, tempo de cozimento e adicione os ingredientes. Em seguida, adicione os gastos fixos (selecione da lista e informe a quantidade) e defina a porcentagem de lucro. O aplicativo exibirá o custo apenas dos ingredientes, o total (ingredientes + gastos fixos) e o preço sugerido por unidade.</li>
        <li><strong>Como adicionar gastos fixos?</strong><br>
            Na aba "Gastos Fixos", insira o nome e o custo (ex.: Luz, $0.5). Esses dados são salvos e poderão ser selecionados na criação da receita, onde você também poderá editá-los.</li>
        <li><strong>Como editar ou duplicar uma receita?</strong><br>
            Utilize o botão de editar (ícone de lápis) para modificar ou o botão de duplicar (ícone de cópia) para criar uma nova receita baseada em uma existente.</li>
        <li><strong>Como são calculados os custos?</strong><br>
            O custo total é a soma dos custos dos ingredientes com os gastos fixos selecionados. O custo por unidade é obtido dividindo o custo total pelo número de unidades e aplicando o percentual de lucro.</li>
        <li><strong>Como calcular o gás?</strong><br>
            O consumo médio de gás de um forno é de 0,32 metros cúbicos por hora. Para calcular o preço por minuto de gás, faça o seguinte cálculo: (Custo da conta de gás / (Metros cúbicos consumidos no mês / 0,32)) / 60.
        </li>
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
            CostCalc Proは、原材料を使ってレシピの生産コストを計算するアプリです。例えば、パンやケーキの単価を知ることができます。</li>
        <li><strong>原材料はどう追加しますか？</strong><br>
            「原材料」タブで、名前、コスト、単位（例：「小麦粉」「$1.0」「kg」）を入力し、「原材料を追加」をクリックします。</li>
        <li><strong>レシピはどう作成しますか？</strong><br>
            レシピの名前、生産単位数、調理時間を入力し、材料を追加します。次に、材料と同様に固定費を追加し、利益率を設定します。アプリは、材料のみのコスト、固定費込みの総コスト、1単位あたりの推奨販売価格を表示します。</li>
        <li><strong>固定費はどう追加しますか？</strong><br>
            「固定費」タブで、電気、ガス、包装、税金などの費用を入力します。これらの情報は保存され、レシピ作成時に選択でき、編集も可能です。</li>
        <li><strong>レシピの編集や複製はどうしますか？</strong><br>
            編集ボタン（鉛筆アイコン）で既存のレシピを修正し、複製ボタン（コピーアイコン）で新しいレシピを作成できます。</li>
        <li><strong>コストはどう計算されますか？</strong><br>
            総コストは、材料費と選択した固定費の合計です。1単位あたりのコストは、総コストを生産単位数で割り、利益率を加えて推奨販売価格を計算します。</li>
        <li><strong>ガスのコストはどう計算しますか？</strong><br>
            オーブンの平均ガス消費量は1時間あたり0.32立方メートルです。1分あたりのガス料金を求めるには、(ガス料金 ÷ (月間消費量（立方メートル） ÷ 0.32)) ÷ 60 の式を使用します。</li>
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
            这是一款通过原材料计算食谱生产成本的应用。例如，你可以知道每个面包或蛋糕的单价。</li>
        <li><strong>如何添加原材料？</strong><br>
            请在“原材料”标签中输入名称、成本和单位（例如，“面粉”、“$1.0”、“kg”），然后点击“添加原材料”。</li>
        <li><strong>如何创建食谱？</strong><br>
            在“食谱”标签中，输入食谱名称、生产单位数、烹饪时间，并添加原材料。接着，以与原材料相同的方式添加固定费用（从列表中选择并输入数量），并输入利润百分比。应用会显示仅计算原材料的成本、固定费用包含在内的总成本以及每单位建议售价。</li>
        <li><strong>如何添加固定费用？</strong><br>
            在“固定费用”标签中，输入电费、燃气费、包装费或税费等费用。这些数据会被保存，并在创建食谱时供选择，同时可以编辑固定费用。</li>
        <li><strong>如何编辑或复制食谱？</strong><br>
            使用编辑按钮（铅笔图标）修改已有食谱，或使用复制按钮（复制图标）基于已有食谱创建新食谱。</li>
        <li><strong>成本如何计算？</strong><br>
            总成本为原材料成本与所选固定费用的总和。每单位成本为总成本除以生产单位数，建议售价则根据利润百分比计算得出。</li>
        <li><strong>如何计算燃气费用？</strong><br>
            一个烤箱的平均燃气消耗量为每小时0.32立方米。要计算每分钟的燃气价格，请进行以下计算：(燃气账单的费用 ÷ (当月消耗的立方米数 ÷ 0.32)) ÷ 60。</li>
      </ul>
    `
  }
};

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
  
  document.getElementById("materiaTitle").innerText = t.materiaTitle;
  document.getElementById("nombreMateria").placeholder = t.placeholderNombreMateria;
  document.getElementById("costoMateria").placeholder = t.placeholderCostoMateria;
  document.getElementById("unidadMateria").placeholder = t.placeholderUnidadMateria;
  document.getElementById("btnAgregarMateria").innerText = t.btnAgregarMateria;
  
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

/* Funciones de Gastos Fijos (sección general) */
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
    gastosFijos.push({ id: Date.now(), nombre: nombre, costo: parseFloat(costo) });
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
  }
}

/* Funciones para editar gasto fijo */
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
      nombre: nombre,
      costo: parseFloat(costo)
    };
    guardarGastosFijos();
    mostrarGastos();
    actualizarFijosReceta();
    cerrarModalGastoEdit();
  } else {
    alert("Completa todos los campos de edición del gasto fijo.");
  }
}

function cerrarModalGastoEdit() {
  document.getElementById("modalGastoEdit").style.display = "none";
}

/* Funciones para gastos fijos en la receta */
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

/* Funciones de Materias Primas */
function guardarMaterias() {
  localStorage.setItem("materias", JSON.stringify(materiasPrimas));
}

function mostrarMaterias() {
  const lista = document.getElementById("listaMaterias");
  lista.innerHTML = "";
  materiasPrimas.forEach(function(materia, index) {
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
    const nuevaMateria = { id: Date.now(), nombre: nombre, costo: parseFloat(costo), unidad: unidad };
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
      nombre: nombre,
      costo: parseFloat(costo),
      unidad: unidad
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
      const materiaActual = materiasPrimas.find(function(m) { return m.id === ing.id; });
      if (materiaActual) {
        ing.costo = materiaActual.costo;
        ing.materia = materiaActual.nombre;
        ing.unidad = materiaActual.unidad;
      }
      nuevoCostoTotal += ing.cantidad * ing.costo;
    });
    receta.costoTotal = nuevoCostoTotal; // Los gastos fijos se sumarán al calcular la receta
    receta.costoPorUnidad = receta.unidades ? receta.costoTotal / receta.unidades : 0;
  });
  localStorage.setItem("recetas", JSON.stringify(recetas));
  mostrarRecetas();
}

/* Funciones de Recetas */
function agregarIngredienteReceta() {
  const container = document.getElementById("ingredientesReceta");
  const div = document.createElement("div");
  div.className = "ingrediente-row";
  
  const select = document.createElement("select");
  select.className = "select-materia";
  materiasPrimas.forEach(function(materia) {
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
  
  // Procesar ingredientes
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
    const selectedId = Number(select.value);
    const cantidad = parseFloat(inputCantidad.value);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida para todos los ingredientes.");
      return;
    }
    const materia = materiasPrimas.find(function(m) { return m.id === selectedId; });
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
  
  // Procesar gastos fijos en la receta
  const containerGastos = document.getElementById("fijosRecetaContainer");
  const filasGasto = containerGastos.getElementsByClassName("gasto-receta-row");
  let costoGastosReceta = 0;
  let gastosRecetaArray = [];
  for (let i = 0; i < filasGasto.length; i++) {
    const fila = filasGasto[i];
    const select = fila.querySelector(".select-gasto");
    const inputCantidad = fila.querySelector(".input-cantidad");
    const selectedId = Number(select.value);
    const cantidad = parseFloat(inputCantidad.value);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida para todos los gastos fijos.");
      return;
    }
    const gastoObj = gastosFijos.find(function(g) { return g.id === selectedId; });
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
  
  const receta = {
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
    precioSugerido: precioSugerido
  };
  
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
  
  document.getElementById("resultadoReceta").innerHTML = `<h3>Resultado de la Receta</h3>
    <p>Costo solo ingredientes: $${costoTotalIngredientes.toFixed(2)}</p>
    <p>Gastos fijos incluidos: $${costoGastosReceta.toFixed(2)}</p>
    <p>Total: $${costoTotalFinal.toFixed(2)}</p>
    <p>Costo por unidad: $${costoPorUnidad.toFixed(2)}</p>
    <p>Precio sugerido por unidad (con ${porcentajeGanancia}% de ganancia): $${precioSugerido.toFixed(2)}</p>`;
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
    recetas.splice(index, 1);
    localStorage.setItem("recetas", JSON.stringify(recetas));
    mostrarRecetas();
  }
}

function verReceta(index) {
  const receta = recetas[index];
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

/* Función para duplicar receta */
function duplicarReceta(index) {
  duplicarMode = true;
  const receta = JSON.parse(JSON.stringify(recetas[index]));
  document.getElementById("editarNombreReceta").value = receta.nombre + " (Duplicado)";
  document.getElementById("editarUnidadesProduccion").value = receta.unidades;
  document.getElementById("editarTiempoCoccion").value = receta.tiempoCoccion || "";
  document.getElementById("editarComentariosReceta").value = receta.comentarios || "";
  
  // Cargar ingredientes
  const containerIng = document.getElementById("editarIngredientesReceta");
  containerIng.innerHTML = "";
  receta.ingredientes.forEach(function(ing) {
    const div = document.createElement("div");
    div.className = "ingrediente-row";
    const select = document.createElement("select");
    select.className = "select-materia";
    materiasPrimas.forEach(function(materia) {
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
  
  // Cargar gastos fijos de la receta
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
  
  document.getElementById("editarRecetaTitle").innerText = translations[currentLang].duplicarRecetaTitle || "Duplicar Receta";
  document.getElementById("modalRecetaEdit").style.display = "block";
}

/* Modal FAQ */
function abrirModalFAQ() {
  document.getElementById("modalFAQ").style.display = "block";
}

function cerrarModalFAQ() {
  document.getElementById("modalFAQ").style.display = "none";
}

/* Funciones para exportar e importar datos */
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
        materiasPrimas = data.materias;
        recetas = data.recetas;
        gastosFijos = data.gastosFijos;
        localStorage.setItem("materias", JSON.stringify(materiasPrimas));
        localStorage.setItem("recetas", JSON.stringify(recetas));
        localStorage.setItem("gastosFijos", JSON.stringify(gastosFijos));
        actualizarFijosReceta();
        mostrarMaterias();
        mostrarRecetas();
        alert("Datos importados correctamente.");
      } else {
        alert("El archivo no contiene los datos requeridos.");
      }
    } catch (error) {
      alert("Error al importar los datos.");
    }
  };
  reader.readAsText(file);
}

/* Inicialización */
window.onload = function() {
  showSection("recetas-section");
  mostrarMaterias();
  mostrarRecetas();
  gastosFijos = JSON.parse(localStorage.getItem("gastosFijos")) || [];
  mostrarGastos();
  actualizarFijosReceta();
  translateApp();
};
