document.addEventListener('DOMContentLoaded', async () => {
            // Logs de inicialização
            console.log('produtor.html: DOMContentLoaded disparado.');

            // Referências aos elementos DOM
            const userNameDisplayHeader = document.getElementById('userNameDisplayProdutorHeader');
            const userNameDisplayDropdown = document.getElementById('userNameDisplayProdutorDropdown');
            const userEmailDisplayDropdown = document.getElementById('userEmailDisplayProdutorDropdown');
            const userTypeDisplayDropdown = document.getElementById('userTypeDisplayProdutorDropdown');
            const logoutButton = document.getElementById('logoutButtonProdutor');
            const accountHubToggle = document.getElementById('accountHubToggle');
            const accountHubDropdown = document.getElementById('accountHubDropdown');
            
            // Abas
            const dashboardTab = document.getElementById('dashboardTab');
            const enviarLixoTab = document.getElementById('enviarLixoTab');
            const statusTab = document.getElementById('statusTab');

            // Seções
            const dashboardSection = document.getElementById('dashboardSection');
            const enviarLixoSection = document.getElementById('enviarLixoSection');
            const statusSection = document.getElementById('statusSection');

            // Elementos da seção Enviar Lixo
            const addLixoForm = document.getElementById('addLixoForm');
            const nomeLixoInput = document.getElementById('nomeLixo');
            const tipoLixoSelect = document.getElementById('tipoLixo');
            const pontoColetaSelect = document.getElementById('pontoColeta');
            const enviarLixoMessage = document.getElementById('enviarLixoMessage');

            // Elementos da seção Status
            const myLixosList = document.getElementById('myLixosList'); // Alterado para o container dos cards
            const statusMessage = document.getElementById('statusMessage');
            const statusTipoLixoFilter = document.getElementById('statusTipoLixoFilter');
            const statusPontoColetaNameFilter = document.getElementById('statusPontoColetaNameFilter');


            // Elementos do Dashboard
            const lixoSemanaCount = document.getElementById('lixoSemanaCount');
            const lixoMesCount = document.getElementById('lixoMesCount');
            const lixoTotalCount = document.getElementById('lixoTotalCount');
            const collectedLixosDashboardTableBody = document.getElementById('collectedLixosDashboardTableBody');
            const dashboardMessage = document.getElementById('dashboardMessage');

            // Elementos do Modal de Comentários
            const commentsModal = document.getElementById('commentsModal');
            const closeCommentsModal = document.getElementById('closeCommentsModal');
            const lixoNameForComments = document.getElementById('lixoNameForComments');
            const commentsList = document.getElementById('commentsList');
            const addCommentForm = document.getElementById('addCommentForm');
            const newCommentText = document.getElementById('newCommentText');
            const commentMessage = document.getElementById('commentMessage');

            let currentLixoIdForComments = null; // Variável para armazenar o ID do lixo atualmente visualizado no modal

            // Recupera dados do usuário do localStorage
            const userId = localStorage.getItem('id_usuario');
            const userName = localStorage.getItem('userName');
            const userType = localStorage.getItem('userType');
            const userEmail = localStorage.getItem('userEmail'); // Assumindo que você salva o email no localStorage

            // Logs de depuração dos dados do usuário
            console.log('produtor.html: userId do localStorage:', userId);
            console.log('produtor.html: userType do localStorage:', userType);
            console.log('produtor.html: userName do localStorage:', userName);
            console.log('produtor.html: userEmail do localStorage:', userEmail);


            // --- Verificação de Autenticação e Tipo de Usuário ---
            if (!userId || userType !== 'Produtor') {
                console.warn('produtor.html: Usuário não autenticado ou não é Produtor. Redirecionando para login.');
                window.location.href = 'login.html'; // Redireciona se não for Produtor ou não autenticado
                return; // Impede que o resto do script seja executado
            }
            userNameDisplayHeader.textContent = userName; // Exibe o nome do usuário no header
            userNameDisplayDropdown.textContent = `Olá, ${userName}!`; // Exibe o nome do usuário no dropdown
            userEmailDisplayDropdown.textContent = userEmail; // Exibe o email no dropdown
            userTypeDisplayDropdown.textContent = userType; // Exibe o tipo de usuário no dropdown

            console.log('produtor.html: Usuário autenticado e é Produtor.');

            // --- Lógica do Account Hub (Dropdown de Conta) ---
            accountHubToggle.addEventListener('click', (event) => {
                event.stopPropagation(); // Impede que o clique se propague para o document e feche o dropdown
                accountHubDropdown.classList.toggle('hidden');
            });

            // Fecha o dropdown se o usuário clicar fora dele
            document.addEventListener('click', (event) => {
                if (!accountHubToggle.contains(event.target) && !accountHubDropdown.contains(event.target)) {
                    accountHubDropdown.classList.add('hidden');
                }
            });

            // --- Lógica de Abas (Tabs) ---
            function showTab(tabId) {
                console.log('produtor.html: showTab chamada para:', tabId);
                // Remove a classe 'active' de todos os botões de aba
                document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
                // Oculta todas as seções de conteúdo das abas
                document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));

                // Adiciona a classe 'active' ao botão da aba clicada
                document.getElementById(tabId + 'Tab').classList.add('active');
                // Exibe a seção de conteúdo correspondente
                document.getElementById(tabId + 'Section').classList.remove('hidden');

                // Carrega dados específicos dependendo da aba
                if (tabId === 'status') {
                    console.log('produtor.html: Carregando Meus Lixos...');
                    loadMyLixos();
                } else if (tabId === 'dashboard') {
                    console.log('produtor.html: Carregando Estatísticas do Dashboard...');
                    loadDashboardStats();
                } else if (tabId === 'enviarLixo') {
                    console.log('produtor.html: Limpando e preparando Ponto de Coleta para Enviar Lixo...');
                    pontoColetaSelect.innerHTML = '<option value="">Selecione o Tipo de Lixo primeiro</option>'; // Limpa ao entrar na aba
                }
            }

            // Ativar a aba Dashboard por padrão ao carregar a página
            showTab('dashboard');

            // Adicionar ouvintes de evento aos botões das abas
            dashboardTab.addEventListener('click', () => showTab('dashboard'));
            enviarLixoTab.addEventListener('click', () => showTab('enviarLixo'));
            statusTab.addEventListener('click', () => showTab('status'));

            // --- Carregar Pontos de Coleta (para a aba Enviar Lixo) ---
            // Esta função agora recebe um tipoLixo para filtrar os pontos
            async function loadPontoColeta(selectedTipoLixo) {
                console.log('produtor.html: loadPontoColeta iniciada para tipo:', selectedTipoLixo);
                pontoColetaSelect.innerHTML = '<option value="">Carregando Pontos de Coleta...</option>'; // Feedback de carregamento
                try {
                    let url = 'http://localhost:3000/pontos-coleta';
                    if (selectedTipoLixo && selectedTipoLixo !== '') {
                        url += `?tipo_lixo=${encodeURIComponent(selectedTipoLixo)}`;
                    }
                    
                    const response = await fetch(url);
                    console.log('produtor.html: Resposta da API de pontos de coleta:', response.status);
                    if (!response.ok) throw new Error('Erro ao carregar pontos de coleta');
                    const pontos = await response.json();
                    console.log('produtor.html: Pontos de coleta carregados:', pontos.length, pontos);

                    pontoColetaSelect.innerHTML = '<option value="">Selecione um Ponto de Coleta</option>';
                    if (pontos.length === 0) {
                         pontoColetaSelect.innerHTML = '<option value="">Nenhum ponto de coleta para este tipo</option>';
                    } else {
                        pontos.forEach(ponto => {
                            const option = document.createElement('option');
                            option.value = ponto.id_ponto;
                            option.textContent = `${ponto.nome_ponto} - ${ponto.endereco}`;
                            pontoColetaSelect.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('produtor.html: Erro ao carregar pontos de coleta:', error);
                    pontoColetaSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                    enviarLixoMessage.textContent = 'Erro ao carregar pontos de coleta. Tente novamente.';
                    enviarLixoMessage.className = 'mt-4 text-center text-red-600 text-sm font-medium';
                }
            }

            // Ouvinte de evento para o select de tipo de lixo
            tipoLixoSelect.addEventListener('change', () => {
                const selectedTipoLixo = tipoLixoSelect.value;
                if (selectedTipoLixo) {
                    loadPontoColeta(selectedTipoLixo);
                } else {
                    pontoColetaSelect.innerHTML = '<option value="">Selecione o Tipo de Lixo primeiro</option>';
                }
            });

            // --- Lógica para Adicionar Lixo (na aba Enviar Lixo) ---
            addLixoForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                console.log('produtor.html: Formulário de adicionar lixo enviado.');
                enviarLixoMessage.textContent = '';
                enviarLixoMessage.className = 'mt-4 text-center text-sm font-medium';

                const nome_lixo = nomeLixoInput.value.trim();
                const tipo_lixo = tipoLixoSelect.value;
                const id_ponto_coleta_fk = pontoColetaSelect.value;

                if (!nome_lixo || !tipo_lixo || !id_ponto_coleta_fk) {
                    enviarLixoMessage.textContent = 'Por favor, preencha todos os campos.';
                    enviarLixoMessage.classList.add('text-red-600');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/lixo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome_lixo, tipo_lixo, id_produtor_fk: Number(userId), id_ponto_coleta_fk: Number(id_ponto_coleta_fk) }) // Garante que IDs são números
                    });
                    console.log('produtor.html: Resposta da API de postar lixo:', response.status);

                    const data = await response.json();

                    if (response.ok) {
                        enviarLixoMessage.textContent = data.message;
                        enviarLixoMessage.classList.add('text-green-600');
                        addLixoForm.reset(); // Limpa o formulário
                        // Recarrega os pontos de coleta para o tipo selecionado após o reset
                        loadPontoColeta(tipoLixoSelect.value);
                        loadMyLixos(); // Atualiza a lista de lixos após adicionar
                        loadDashboardStats(); // Atualiza os dados do dashboard
                    } else {
                        enviarLixoMessage.textContent = data.message || 'Erro ao postar lixo.';
                        enviarLixoMessage.classList.add('text-red-600');
                    }
                } catch (error) {
                    console.error('produtor.html: Erro ao postar lixo:', error);
                    enviarLixoMessage.textContent = 'Erro de conexão ao postar lixo.';
                    enviarLixoMessage.classList.add('text-red-600');
                }
            });

            // Função auxiliar para obter o SVG do ícone baseado no tipo de lixo
            function getLixoIconSvg(tipoLixo) {
                switch (tipoLixo.toLowerCase()) {
                    case 'organico':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.99 7.42A3.99 3.99 0 0110 6c1.17 0 2.24.4 3.01 1.07l.02.02.04.04.04.04a.5.5 0 01-.08.7.5.5 0 01-.7-.08l-.04-.04-.04-.04A2.99 2.99 0 0010 7c-.88 0-1.68.29-2.31.78l-.04-.04-.04-.04a.5.5 0 01-.08-.7zM9.5 13a.5.5 0 00-1 0v.5a.5.5 0 001 0V13zM10 10a.5.5 0 01-.5-.5V9a.5.5 0 011 0v.5a.5.5 0 01-.5.5zM10.5 13a.5.5 0 00-1 0v.5a.5.5 0 001 0V13z" clip-rule="evenodd"></path></svg>`;
                    case 'plastico':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-8-8a8 8 0 1116 0 8 8 0 01-16 0z" clip-rule="evenodd"></path></svg>`; // Icone de garrafa genérico
                    case 'papel':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h10V8.414L10.586 4H6z" clip-rule="evenodd"></path></svg>`; // Icone de papel genérico
                    case 'vidro':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v12H6V4z" clip-rule="evenodd"></path></svg>`; // Icone de vidro genérico
                    case 'metal':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM10 8a1 1 0 00-1-1V5a1 1 0 102 0v2a1 1 0 00-1 1z" clip-rule="evenodd"></path></svg>`; // Icone de metal genérico
                    case 'eletronico':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM10 8a1 1 0 00-1-1V5a1 1 0 102 0v2a1 1 0 00-1 1z"></path></svg>`; // Icone eletrônico genérico
                    case 'bateria':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11 2a1 1 0 00-1 1v1.172a3 3 0 00-.914 5.257L8.707 10.5A1 1 0 018.707 12H7a1 1 0 100 2h1.707a1 1 0 01.707.293L10 15.293V18a1 1 0 102 0v-2.707a1 1 0 01.293-.707L13.293 14a1 1 0 10-1.414-1.414L10 11.293V8.707a1 1 0 01-.293-.707L8.707 7A1 1 0 007 7.707V9a1 1 0 100 2h1.707a1 1 0 01.707.293L10 12.293V14a1 1 0 102 0v-1.707a1 1 0 01.293-.707L13.293 9a1 1 0 10-1.414-1.414L10 9.293V7a1 1 0 00-1-1V3a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`; // Icone de bateria genérico
                    case 'borracha':
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`; // Icone de borracha genérico
                    default:
                        return `<svg class="w-20 h-20 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-9-8a9 9 0 1118 0 9 9 0 01-18 0z" clip-rule="evenodd"></path></svg>`; // Ícone genérico de descarte
                }
            }


            // --- Lógica para Carregar Meus Lixos (na aba Status) ---
            async function loadMyLixos() {
                console.log('produtor.html: loadMyLixos iniciada para userId:', userId);
                myLixosList.innerHTML = ''; // Limpa o container dos cards
                statusMessage.textContent = 'Carregando seus lixos...';
                statusMessage.className = 'mt-4 text-center text-gray-500 text-sm';

                const tipoLixoFilter = statusTipoLixoFilter.value;
                const pontoColetaNameFilter = statusPontoColetaNameFilter.value.trim();

                let url = `http://localhost:3000/lixo/produtor/${Number(userId)}`;
                const queryParams = [];

                if (tipoLixoFilter) {
                    queryParams.push(`tipo_lixo=${encodeURIComponent(tipoLixoFilter)}`);
                }
                if (pontoColetaNameFilter) {
                    queryParams.push(`nome_ponto=${encodeURIComponent(pontoColetaNameFilter.toLowerCase())}`);
                }

                if (queryParams.length > 0) {
                    url += `?${queryParams.join('&')}`;
                }

                try {
                    const response = await fetch(url);
                    console.log(`produtor.html: Resposta da API lixo/produtor/${userId} com filtros:`, response.status);
                    if (!response.ok) throw new Error('Erro ao carregar meus lixos');
                    const lixos = await response.json();
                    console.log('produtor.html: Lixos carregados:', lixos.length, lixos);


                    if (lixos.length === 0) {
                        statusMessage.textContent = 'Você ainda não postou nenhum lixo ou nenhum lixo corresponde aos filtros.';
                        return;
                    }

                    statusMessage.textContent = ''; // Limpa a mensagem de carregamento

                    lixos.forEach(lixo => {
                        const card = document.createElement('div');
                        card.className = `bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-between relative transition-all duration-300 ease-in-out transform hover:scale-105
                            ${lixo.status === 'Pendente' ? 'bg-blue-600' : ''}
                            ${lixo.status === 'Reciclador à caminho' ? 'bg-yellow-500' : ''}
                            ${lixo.status === 'Coletado' ? 'bg-green-500' : ''}
                            ${lixo.status === 'Cancelado' ? 'bg-red-500' : ''}
                        `;
                        
                        const dataPostagem = new Date(lixo.data_postagem).toLocaleString('pt-BR');
                        const dataColeta = lixo.data_coleta ? new Date(lixo.data_coleta).toLocaleString('pt-BR') : 'N/A';
                        const recicladorNome = lixo.nome_reciclador || 'Aguardando Reciclador';

                        card.innerHTML = `
                            <button data-id="${lixo.id_lixo}" class="cancel-lixo-btn absolute top-2 right-2 text-white bg-red-700 rounded-full w-6 h-6 flex items-center justify-center text-xs focus:outline-none hover:bg-red-800 transition duration-300" title="Cancelar Lixo">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h3 class="text-xl font-bold text-white mb-2 text-center">${lixo.nome_lixo}</h3>
                            ${getLixoIconSvg(lixo.tipo_lixo)}
                            <div class="text-white text-center text-sm">
                                <p><strong class="font-semibold">Tipo:</strong> ${lixo.tipo_lixo}</p>
                                <p><strong class="font-semibold">Ponto:</strong> ${lixo.nome_ponto}</p>
                                <p><strong class="font-semibold">Status:</strong> ${lixo.status}</p>
                                <p><strong class="font-semibold">Reciclador:</strong> ${recicladorNome}</p>
                                <p class="text-xs text-white opacity-75">Postado em: ${dataPostagem}</p>
                                ${lixo.status === 'Coletado' ? `<p class="text-xs text-white opacity-75">Coletado em: ${dataColeta}</p>` : ''}
                            </div>
                            <button data-id="${lixo.id_lixo}" data-name="${lixo.nome_lixo}" class="view-comments-btn mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 flex items-center justify-center space-x-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.764 9.764 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <span>Comentários</span>
                            </button>
                        `;
                        myLixosList.appendChild(card);

                        // Adiciona ouvintes de evento para os botões de cancelar (APÓS criá-los)
                        if (lixo.status !== 'Coletado' && lixo.status !== 'Cancelado') {
                            card.querySelector('.cancel-lixo-btn').addEventListener('click', async (e) => {
                                console.log('produtor.html: Botão Cancelar Lixo clicado.');
                                const lixoId = e.currentTarget.dataset.id; // Use currentTarget para garantir o elemento clicado
                                if (confirm('Tem certeza que deseja cancelar este lixo?')) {
                                    await cancelLixo(lixoId);
                                }
                            });
                        } else {
                            // Se o status for "Coletado" ou "Cancelado", remove o botão de cancelar
                            const cancelButton = card.querySelector('.cancel-lixo-btn');
                            if (cancelButton) cancelButton.remove();
                        }

                        // Adiciona ouvintes de evento para os botões de comentários (APÓS criá-los)
                        card.querySelector('.view-comments-btn').addEventListener('click', (e) => {
                            console.log('produtor.html: Botão Comentários clicado.');
                            const lixoId = e.currentTarget.dataset.id;
                            const lixoName = e.currentTarget.dataset.name;
                            openCommentsModal(lixoId, lixoName);
                        });
                    });

                } catch (error) {
                    console.error('produtor.html: Erro ao carregar meus lixos:', error);
                    statusMessage.textContent = 'Erro ao carregar seus lixos. Tente novamente.';
                    statusMessage.className = 'mt-4 text-center text-red-600 text-sm font-medium';
                }
            }

            // Ouvintes de evento para os filtros da aba Status
            statusTipoLixoFilter.addEventListener('change', loadMyLixos);
            statusPontoColetaNameFilter.addEventListener('input', loadMyLixos);


            // --- Lógica para Cancelar Lixo pelo Produtor ---
            async function cancelLixo(lixoId) {
                console.log('produtor.html: Tentando cancelar lixo com ID:', lixoId);
                try {
                    const response = await fetch(`http://localhost:3000/lixo/${lixoId}/cancelar-produtor`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_produtor_fk: Number(userId) }) // Garante que userId é um número
                    });
                    console.log('produtor.html: Resposta da API de cancelar lixo:', response.status);
                    const data = await response.json();
                    if (response.ok) {
                        alert(data.message);
                        loadMyLixos();
                        loadDashboardStats();
                    } else {
                        alert(data.message || 'Erro ao cancelar lixo.');
                    }
                } catch (error) {
                    console.error('produtor.html: Erro ao cancelar lixo:', error);
                    alert('Erro de conexão ao cancelar lixo.');
                }
            }

            // --- Lógica para Carregar Estatísticas do Dashboard ---
            async function loadDashboardStats() {
                console.log('produtor.html: loadDashboardStats iniciada para userId:', userId);
                dashboardMessage.textContent = 'Carregando estatísticas...';
                dashboardMessage.className = 'mt-4 text-center text-gray-500 text-sm';
                try {
                    // Garante que userId é um número para a URL
                    const response = await fetch(`http://localhost:3000/dashboard/produtor/stats/${Number(userId)}`);
                    console.log(`produtor.html: Resposta da API de estatísticas do produtor/${userId}:`, response.status);
                    if (!response.ok) throw new Error('Erro ao carregar lixos para estatísticas');
                    const stats = await response.json();
                    console.log('produtor.html: Estatísticas carregadas:', stats);

                    lixoSemanaCount.textContent = stats.semana;
                    lixoMesCount.textContent = stats.mes;
                    lixoTotalCount.textContent = stats.total;

                    // Carregar lixos coletados recentes
                    collectedLixosDashboardTableBody.innerHTML = '';
                    if (stats.coletados_recentes.length === 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td colspan="3" class="py-3 px-6 text-center text-gray-500">Nenhum lixo coletado recentemente.</td>`;
                        collectedLixosDashboardTableBody.appendChild(row);
                    } else {
                        stats.coletados_recentes.forEach(lixo => {
                            const row = document.createElement('tr');
                            row.className = 'border-b border-gray-200 hover:bg-gray-100';
                            const dataColeta = new Date(lixo.data_coleta).toLocaleString('pt-BR');
                            row.innerHTML = `
                                <td class="py-3 px-6 text-left">${lixo.nome_lixo}</td>
                                <td class="py-3 px-6 text-left">${lixo.tipo_lixo}</td>
                                <td class="py-3 px-6 text-left">${dataColeta}</td>
                            `;
                            collectedLixosDashboardTableBody.appendChild(row);
                        });
                    }

                    dashboardMessage.textContent = '';

                } catch (error) {
                    console.error('produtor.html: Erro ao carregar estatísticas do dashboard:', error);
                    dashboardMessage.textContent = 'Erro ao carregar estatísticas. Tente novamente.';
                    dashboardMessage.className = 'mt-4 text-center text-red-600 text-sm font-medium';
                }
            }

            // --- Lógica do Modal de Comentários ---
            async function openCommentsModal(lixoId, lixoName) {
                console.log('produtor.html: Abrindo modal de comentários para Lixo ID:', lixoId);
                currentLixoIdForComments = lixoId;
                lixoNameForComments.textContent = lixoName;
                commentsList.innerHTML = '<p class="text-gray-500 text-center">Carregando comentários...</p>';
                commentMessage.textContent = '';
                newCommentText.value = '';
                commentsModal.classList.remove('hidden');

                await loadComments(lixoId);
            }

            closeCommentsModal.addEventListener('click', () => {
                console.log('produtor.html: Fechando modal de comentários.');
                commentsModal.classList.add('hidden');
                currentLixoIdForComments = null;
            });

            async function loadComments(lixoId) {
                console.log('produtor.html: Carregando comentários para Lixo ID:', lixoId);
                try {
                    const response = await fetch(`http://localhost:3000/lixo/${Number(lixoId)}/comentarios`);
                    console.log(`produtor.html: Resposta da API de comentários para lixo ${lixoId}:`, response.status);
                    if (!response.ok) throw new Error('Erro ao carregar comentários');
                    const comments = await response.json();
                    console.log('produtor.html: Comentários carregados:', comments.length, comments);

                    commentsList.innerHTML = '';

                    if (comments.length === 0) {
                        commentsList.innerHTML = '<p class="text-gray-500 text-center">Nenhum comentário ainda. Seja o primeiro!</p>';
                    } else {
                        comments.forEach(comment => {
                            const commentDiv = document.createElement('div');
                            commentDiv.className = 'border-b border-gray-200 last:border-b-0 py-2';
                            const commentDate = new Date(comment.data_comentario).toLocaleString('pt-BR');
                            commentDiv.innerHTML = `
                                <p class="text-gray-900 font-semibold">${comment.nome_usuario} (${comment.tipo_usuario}) <span class="text-gray-500 text-xs">- ${commentDate}</span></p>
                                <p class="text-gray-700">${comment.texto}</p>
                            `;
                            commentsList.appendChild(commentDiv);
                        });
                        commentsList.scrollTop = commentsList.scrollHeight;
                    }
                } catch (error) {
                    console.error('produtor.html: Erro ao carregar comentários:', error);
                    commentsList.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar comentários.</p>';
                }
            }

            addCommentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                console.log('produtor.html: Formulário de adicionar comentário enviado.');
                commentMessage.textContent = '';
                commentMessage.className = 'mt-2 text-sm text-center font-medium';

                const texto = newCommentText.value.trim();
                if (!texto) {
                    commentMessage.textContent = 'O comentário não pode estar vazio.';
                    commentMessage.classList.add('text-red-600');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/lixo/${Number(currentLixoIdForComments)}/comentarios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_usuario_fk: Number(userId), texto })
                    });
                    console.log('produtor.html: Resposta da API de adicionar comentário:', response.status);
                    const data = await response.json();
                    if (response.ok) {
                        commentMessage.textContent = data.message;
                        commentMessage.classList.add('text-green-600');
                        newCommentText.value = '';
                        await loadComments(currentLixoIdForComments);
                    } else {
                        commentMessage.textContent = data.message || 'Erro ao adicionar comentário.';
                        commentMessage.classList.add('text-red-600');
                    }
                } catch (error) {
                    console.error('produtor.html: Erro ao adicionar comentário:', error);
                    commentMessage.textContent = 'Erro de conexão ao adicionar comentário.';
                    commentMessage.classList.add('text-red-600');
                }
            });

            // --- Lógica de Logout ---
            logoutButton.addEventListener('click', () => {
                console.log('produtor.html: Botão de logout clicado.');
                localStorage.removeItem('userType');
                localStorage.removeItem('userName');
                localStorage.removeItem('id_usuario');
                localStorage.removeItem('userEmail'); // Limpa também o email
                window.location.href = 'login.html';
            });
        });