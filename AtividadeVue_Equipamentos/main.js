// Inicializando a aplicação Vue
const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    // Estado reativo
    const equipamentos = ref([]);
    const editando = ref(false);
    const idEditando = ref(null);

    // Modelo do equipamento atual (para formulário)
    const equipamentoAtual = ref({
      id: '',
      nome: '',
      categoria: '',
      patrimonio: '',
      status: 'disponível'
    });

    // Erros de validação
    const erroNome = ref(false);
    const erroCategoria = ref(false);
    const erroPatrimonio = ref(false);

    // Filtros
    const filtroCategoria = ref('');
    const filtroStatus = ref('');

    // Função para gerar ID único (simples, baseado em timestamp)
    const gerarIdUnico = () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    // Carregar dados do localStorage ao iniciar
    const carregarDoLocalStorage = () => {
      const dadosSalvos = localStorage.getItem('equipamentos-laboratorio');
      if (dadosSalvos) {
        equipamentos.value = JSON.parse(dadosSalvos);
      }
    };

    // Salvar dados no localStorage
    const salvarNoLocalStorage = () => {
      localStorage.setItem('equipamentos-laboratorio', JSON.stringify(equipamentos.value));
    };

    // Validar formulário
    const validarFormulario = () => {
      let valido = true;
      erroNome.value = !equipamentoAtual.value.nome.trim();
      erroCategoria.value = !equipamentoAtual.value.categoria.trim();
      erroPatrimonio.value = !equipamentoAtual.value.patrimonio.trim();

      if (erroNome.value || erroCategoria.value || erroPatrimonio.value) {
        valido = false;
      }
      return valido;
    };

    // Propriedade computada: formulário válido?
    const formularioValido = computed(() => {
      return equipamentoAtual.value.nome.trim() !== '' &&
             equipamentoAtual.value.categoria.trim() !== '' &&
             equipamentoAtual.value.patrimonio.trim() !== '';
    });

    // Propriedades computadas: contadores
    const totalEquipamentos = computed(() => equipamentos.value.length);
    const totalDisponiveis = computed(() => 
      equipamentos.value.filter(eq => eq.status === 'disponível').length
    );
    const totalEmprestados = computed(() => 
      equipamentos.value.filter(eq => eq.status === 'emprestado').length
    );

    // Propriedade computada: lista filtrada
    const equipamentosFiltrados = computed(() => {
      return equipamentos.value.filter(eq => {
        const matchCategoria = filtroCategoria.value 
          ? eq.categoria.toLowerCase().includes(filtroCategoria.value.toLowerCase())
          : true;
        const matchStatus = filtroStatus.value 
          ? eq.status === filtroStatus.value
          : true;
        return matchCategoria && matchStatus;
      });
    });

    // Propriedade computada: filtro ativo?
    const filtroAtivo = computed(() => {
      return filtroCategoria.value !== '' || filtroStatus.value !== '';
    });

    // Função: Adicionar ou Atualizar Equipamento
    const salvarEquipamento = () => {
      if (!validarFormulario()) {
        return; // Bloqueia se inválido
      }

      if (editando.value) {
        // Atualizar
        const index = equipamentos.value.findIndex(eq => eq.id === idEditando.value);
        if (index !== -1) {
          equipamentos.value[index] = { ...equipamentoAtual.value };
        }
        editando.value = false;
        idEditando.value = null;
      } else {
        // Adicionar novo
        const novoEquipamento = {
          ...equipamentoAtual.value,
          id: gerarIdUnico() // Gera ID único
        };
        equipamentos.value.push(novoEquipamento);
      }

      // Resetar formulário
      resetarFormulario();

      // Persistir no localStorage
      salvarNoLocalStorage();
    };

    // Função: Editar Equipamento
    const editarEquipamento = (equipamento) => {
      equipamentoAtual.value = { ...equipamento };
      editando.value = true;
      idEditando.value = equipamento.id;
      // Rolar até o formulário (acessibilidade)
      document.querySelector('.formulario').scrollIntoView({ behavior: 'smooth' });
    };

    // Função: Cancelar Edição
    const cancelarEdicao = () => {
      editando.value = false;
      idEditando.value = null;
      resetarFormulario();
    };

    // Função: Remover Equipamento
    const removerEquipamento = (id) => {
      if (window.confirm('Tem certeza que deseja remover este equipamento?')) {
        equipamentos.value = equipamentos.value.filter(eq => eq.id !== id);
        salvarNoLocalStorage();
      }
    };

    // Função: Resetar Formulário
    const resetarFormulario = () => {
      equipamentoAtual.value = {
        id: '',
        nome: '',
        categoria: '',
        patrimonio: '',
        status: 'disponível'
      };
      erroNome.value = false;
      erroCategoria.value = false;
      erroPatrimonio.value = false;
    };

    // Carregar dados ao iniciar
    carregarDoLocalStorage();

    // Retornar tudo que será usado no template
    return {
      // Estado
      equipamentos,
      editando,
      equipamentoAtual,
      erroNome,
      erroCategoria,
      erroPatrimonio,
      filtroCategoria,
      filtroStatus,
      // Computed
      formularioValido,
      totalEquipamentos,
      totalDisponiveis,
      totalEmprestados,
      equipamentosFiltrados,
      filtroAtivo,
      // Métodos
      salvarEquipamento,
      editarEquipamento,
      cancelarEdicao,
      removerEquipamento,
      resetarFormulario
    };
  }
}).mount('#app');