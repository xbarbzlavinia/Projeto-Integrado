document.addEventListener('DOMContentLoaded', async () => {
            // Logs de inicialização
            console.log('reciclador.html: DOMContentLoaded disparado.');

            // Referências aos elementos DOM
            const userNameDisplayHeader = document.getElementById('userNameDisplayRecicladorHeader');
            const userNameDisplayDropdown = document.getElementById('userNameDisplayRecicladorDropdown');
            const userEmailDisplayDropdown = document.getElementById('userEmailDisplayRecicladorDropdown');
            const userTypeDisplayDropdown = document.getElementById('userTypeDisplayRecicladorDropdown');
            const logoutButton = document.getElementById('logoutButtonReciclador');
            const accountHubToggle = document.getElementById('accountHubToggle');
            const accountHubDropdown = document.getElementById('accountHubDropdown');
            
            // Abas
            const dashboardTab = document.getElementById('dashboardTab');
            const enviarLixoTab = document.getElementById('enviarLixoTab'); // Usado para "Lixos Disponíveis"
            const statusTab = document.getElementById('statusTab'); // Usado para "Minhas Coletas"

            // Seções
            const dashboardSection = document.getElementById('dashboardSection');
            const enviarLixoSection = document.getElementById('enviarLixoSection'); // Conteúdo de Lixos Disponíveis
            const statusSection = document.getElementById('statusSection'); // Conteúdo de Minhas Coletas

            // Elementos da seção Lixos Disponíveis
            const availableLixosList = document.getElementById('availableLixosList'); // Alterado para o container dos cards
            const enviarLixoMessage = document.getElementById('enviarLixoMessage'); // Mensagem para Lixos Disponíveis
            const availableTipoLixoFilter = document.getElementById('availableTipoLixoFilter');
            const availablePontoColetaNameFilter = document.getElementById('availablePontoColetaNameFilter');

            // Elementos da seção Status
            const myCollectionsList = document.getElementById('myCollectionsList'); // Alterado para o container dos cards
            const statusMessage = document.getElementById('statusMessage'); // Mensagem para Minhas Coletas
            const myCollectionsTipoLixoFilter = document.getElementById('myCollectionsTipoLixoFilter');
            const myCollectionsPontoColetaNameFilter = document.getElementById('myCollectionsPontoColetaNameFilter');


            // Elementos do Dashboard
            const coletadoSemanaCount = document.getElementById('coletadoSemanaCount');
            const coletadoMesCount = document.getElementById('coletadoMesCount');
            const totalColetadoCount = document.getElementById('totalColetadoCount');
            const aCaminhoDashboardTableBody = document.getElementById('aCaminhoDashboardTableBody');
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
            console.log('reciclador.html: userId do localStorage:', userId);
            console.log('reciclador.html: userType do localStorage:', userType);
            console.log('reciclador.html: userName do localStorage:', userName);
            console.log('reciclador.html: userEmail do localStorage:', userEmail);

            // --- Verificação de Autenticação e Tipo de Usuário ---
            if (!userId || userType !== 'Reciclador') {
                console.warn('reciclador.html: Usuário não autenticado ou não é Reciclador. Redirecionando para login.');
                window.location.href = 'login.html'; // Redireciona se não for Reciclador ou não autenticado
                return; // Impede que o resto do script seja executado
            }
            userNameDisplayHeader.textContent = userName; // Exibe o nome do usuário no header
            userNameDisplayDropdown.textContent = `Olá, ${userName}!`; // Exibe o nome do usuário no dropdown
            userEmailDisplayDropdown.textContent = userEmail; // Exibe o email no dropdown
            userTypeDisplayDropdown.textContent = userType; // Exibe o tipo de usuário no dropdown
            console.log('reciclador.html: Usuário autenticado e é Reciclador.');

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
                console.log('reciclador.html: showTab chamada para:', tabId);
                document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));

                document.getElementById(tabId + 'Tab').classList.add('active');
                document.getElementById(tabId + 'Section').classList.remove('hidden');

                if (tabId === 'enviarLixo') { // Para o Reciclador, esta aba é "Lixos Disponíveis"
                    console.log('reciclador.html: Carregando Lixos Disponíveis...');
                    loadAvailableLixos();
                } else if (tabId === 'status') { // Para o Reciclador, esta aba é "Minhas Coletas"
                    console.log('reciclador.html: Carregando Minhas Coletas...');
                    loadMyCollections();
                } else if (tabId === 'dashboard') {
                    console.log('reciclador.html: Carregando Estatísticas do Dashboard...');
                    loadDashboardStats();
                }
            }

            showTab('dashboard'); // Ativar a aba Dashboard por padrão

            dashboardTab.addEventListener('click', () => showTab('dashboard'));
            enviarLixoTab.addEventListener('click', () => showTab('enviarLixo'));
            statusTab.addEventListener('click', () => showTab('status'));

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
            // --- Lógica para Carregar Lixos Disponíveis (na aba Lixos Disponíveis / Enviar Lixo) ---
            async function loadAvailableLixos() {
                console.log('reciclador.html: loadAvailableLixos iniciada.');
                availableLixosList.innerHTML = ''; // Limpa o container dos cards
                enviarLixoMessage.textContent = 'Carregando lixos disponíveis...';
                enviarLixoMessage.className = 'mt-4 text-center text-gray-500 text-sm';

                const tipoLixoFilter = availableTipoLixoFilter.value;
                const pontoColetaNameFilter = availablePontoColetaNameFilter.value.trim();

                let url = 'http://localhost:3000/lixo/disponivel';
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
                    console.log('reciclador.html: Resposta da API de lixos disponíveis:', response.status);
                    if (!response.ok) throw new Error('Erro ao carregar lixos disponíveis');
                    const lixos = await response.json();
                    console.log('reciclador.html: Lixos disponíveis carregados:', lixos.length, lixos);

                    if (lixos.length === 0) {
                        enviarLixoMessage.textContent = 'Nenhum lixo disponível para coleta no momento ou nenhum lixo corresponde aos filtros.';
                        return;
                    }

                    enviarLixoMessage.textContent = '';

                    lixos.forEach(lixo => {
                        const card = document.createElement('div');
                        card.className = `bg-blue-600 p-4 rounded-lg shadow-md flex flex-col items-center justify-between relative transition-all duration-300 ease-in-out transform hover:scale-105`; // Azul para lixo Pendente
                        
                        const dataPostagem = new Date(lixo.data_postagem).toLocaleString('pt-BR');

                        card.innerHTML = `
                            <h3 class="text-xl font-bold text-white mb-2 text-center">${lixo.nome_lixo}</h3>
                            ${getLixoIconSvg(lixo.tipo_lixo)}
                            <div class="text-white text-center text-sm">
                                <p><strong class="font-semibold">Tipo:</strong> ${lixo.tipo_lixo}</p>
                                <p><strong class="font-semibold">Ponto:</strong> ${lixo.nome_ponto}</p>
                                <p><strong class="font-semibold">Produtor:</strong> ${lixo.nome_produtor}</p>
                                <p class="text-xs text-white opacity-75">Postado em: ${dataPostagem}</p>
                            </div>
                            <div class="flex flex-col w-full mt-4 space-y-2">
                                <button data-id="${lixo.id_lixo}" class="collect-lixo-btn bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 flex items-center justify-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 00-2 2v2.167a.5.5 0 01-.157.345L5 14.5m6-8L9 11m4-5L9 11m4-5L14 10m4-5L17 10m-3-5V4m3 0V3m-3 0H7m0 0L6 14m0 0L5 14m0 0L4 14m0 0L3 14m0 0L2 14m0 0L1 14m0 0v-2.167a.5.5 0 00-.157-.345L.5 14.5m11.5-8L13 11m-4-5L13 11m-4-5L14 10m4-5L17 10m-3-5V4m3 0V3m-3 0H7m0 0L6 14m0 0L5 14m0 0L4 14m0 0L3 14m0 0L2 14m0 0L1 14"></path></svg>
                                    <span>Coletar</span>
                                </button>
                                <button data-id="${lixo.id_lixo}" data-name="${lixo.nome_lixo}" class="view-comments-btn bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 flex items-center justify-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.764 9.764 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    <span>Comentários</span>
                                </button>
                            </div>
                        `;
                        availableLixosList.appendChild(card);

                        // Adiciona ouvintes de evento para os botões de coletar (APÓS criá-los)
                        card.querySelector('.collect-lixo-btn').addEventListener('click', async (e) => {
                            console.log('reciclador.html: Botão Coletar Lixo clicado.');
                            const lixoId = e.currentTarget.dataset.id;
                            if (confirm('Deseja realmente coletar este lixo?')) {
                                await collectLixo(lixoId);
                            }
                        });

                        // Adiciona ouvintes de evento para os botões de comentários (APÓS criá-los)
                        card.querySelector('.view-comments-btn').addEventListener('click', (e) => {
                            console.log('reciclador.html: Botão Comentários clicado.');
                            const lixoId = e.currentTarget.dataset.id;
                            const lixoName = e.currentTarget.dataset.name;
                            openCommentsModal(lixoId, lixoName);
                        });
                    });

                }
                catch (error) {
                    console.error('reciclador.html: Erro ao carregar lixos disponíveis:', error);
                    enviarLixoMessage.textContent = 'Erro ao carregar lixos disponíveis. Tente novamente.';
                    enviarLixoMessage.className = 'mt-4 text-center text-red-600 text-sm font-medium';
                }
            }

            // Ouvintes de evento para os filtros da aba Lixos Disponíveis
            availableTipoLixoFilter.addEventListener('change', loadAvailableLixos);
            availablePontoColetaNameFilter.addEventListener('input', loadAvailableLixos);


            // --- Lógica para Coletar Lixo pelo Reciclador ---
            async function collectLixo(lixoId) {
                console.log('reciclador.html: Tentando coletar lixo com ID:', lixoId);
                try {
                    const response = await fetch(`http://localhost:3000/lixo/${lixoId}/coletar`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_reciclador_fk: Number(userId) }) // Garante que userId é um número
                    });
                    console.log('reciclador.html: Resposta da API de coletar lixo:', response.status);
                    const data = await response.json();
                    if (response.ok) {
                        alert(data.message);
                        loadAvailableLixos();
                        loadMyCollections();
                        showTab('status'); // Mudar para a aba "Status / Minhas Coletas"
                    } else {
                        alert(data.message || 'Erro ao marcar lixo para coleta.');
                    }
                } catch (error) {
                    console.error('reciclador.html: Erro ao coletar lixo:', error);
                    alert('Erro de conexão ao marcar lixo para coleta.');
                }
            }

            // --- Lógica para Carregar Minhas Coletas (na aba Status) ---
            async function loadMyCollections() {
                console.log('reciclador.html: loadMyCollections iniciada para userId:', userId);
                myCollectionsList.innerHTML = ''; // Limpa o container dos cards
                statusMessage.textContent = 'Carregando suas coletas...';
                statusMessage.className = 'mt-4 text-center text-gray-500 text-sm';

                const tipoLixoFilter = myCollectionsTipoLixoFilter.value;
                const pontoColetaNameFilter = myCollectionsPontoColetaNameFilter.value.trim();

                let url = `http://localhost:3000/lixo/reciclador/${Number(userId)}`;
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
                    // Garante que userId é um número para a URL
                    const response = await fetch(url);
                    console.log(`reciclador.html: Resposta da API lixo/reciclador/${userId} com filtros:`, response.status);
                    if (!response.ok) throw new Error('Erro ao carregar minhas coletas');
                    const lixos = await response.json();
                    console.log('reciclador.html: Lixos carregados em Minhas Coletas:', lixos.length, lixos);

                    if (lixos.length === 0) {
                        statusMessage.textContent = 'Você ainda não tem coletas atribuídas ou concluídas que correspondam aos filtros.';
                        return;
                    }

                    statusMessage.textContent = '';

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
                        const produtorNome = lixo.nome_produtor || 'N/A';

                        card.innerHTML = `
                            <h3 class="text-xl font-bold text-white mb-2 text-center">${lixo.nome_lixo}</h3>
                            ${getLixoIconSvg(lixo.tipo_lixo)}
                            <div class="text-white text-center text-sm">
                                <p><strong class="font-semibold">Tipo:</strong> ${lixo.tipo_lixo}</p>
                                <p><strong class="font-semibold">Status:</strong> ${lixo.status}</p>
                                <p><strong class="font-semibold">Ponto:</strong> ${lixo.nome_ponto}</p>
                                <p><strong class="font-semibold">Produtor:</strong> ${produtorNome}</p>
                                <p class="text-xs text-white opacity-75">Postado em: ${dataPostagem}</p>
                                ${lixo.status === 'Coletado' ? `<p class="text-xs text-white opacity-75">Coletado em: ${dataColeta}</p>` : ''}
                            </div>
                            <div class="flex flex-col w-full mt-4 space-y-2">
                                ${lixo.status === 'Reciclador à caminho' ?
                                `
                                <button data-id="${lixo.id_lixo}" class="confirm-btn bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 flex items-center justify-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>Confirmar</span>
                                </button>
                                <button data-id="${lixo.id_lixo}" class="cancel-collection-btn bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 flex items-center justify-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    <span>Cancelar Coleta</span>
                                </button>
                                ` :
                                `<span class="text-gray-400 text-xs text-center w-full">Ação Indisponível</span>`
                                }
                                <button data-id="${lixo.id_lixo}" data-name="${lixo.nome_lixo}" class="view-comments-btn bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-bold py-2 px-4 rounded-lg w-full transition duration-300 flex items-center justify-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.764 9.764 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    <span>Comentários</span>
                                </button>
                            </div>
                        `;
                        myCollectionsList.appendChild(card);

                        // Adiciona ouvintes de evento para os botões de ação
                        if (lixo.status === 'Reciclador à caminho') {
                            card.querySelector('.confirm-btn').addEventListener('click', async (e) => {
                                console.log('reciclador.html: Botão Confirmar Coleta clicado.');
                                const lixoId = e.currentTarget.dataset.id;
                                if (confirm('Tem certeza que deseja confirmar a coleta deste lixo?')) {
                                    await confirmCollection(lixoId);
                                }
                            });

                            card.querySelector('.cancel-collection-btn').addEventListener('click', async (e) => {
                                console.log('reciclador.html: Botão Cancelar Coleta clicado.');
                                const lixoId = e.currentTarget.dataset.id;
                                if (confirm('Tem certeza que deseja cancelar a coleta deste lixo? Ele voltará a ficar disponível para outros recicladores.')) {
                                    await cancelCollection(lixoId);
                                }
                            });
                        }

                        card.querySelector('.view-comments-btn').addEventListener('click', (e) => {
                            console.log('reciclador.html: Botão Comentários clicado.');
                            const lixoId = e.currentTarget.dataset.id;
                            const lixoName = e.currentTarget.dataset.name;
                            openCommentsModal(lixoId, lixoName);
                        });

                    });

                } catch (error) {
                    console.error('reciclador.html: Erro ao carregar minhas coletas:', error);
                    statusMessage.textContent = 'Erro ao carregar suas coletas. Tente novamente.';
                    statusMessage.className = 'mt-4 text-center text-red-600 text-sm font-medium';
                }
            }
            // Ouvintes de evento para os filtros da aba Status
            myCollectionsTipoLixoFilter.addEventListener('change', loadMyCollections);
            myCollectionsPontoColetaNameFilter.addEventListener('input', loadMyCollections);


            // --- Lógica para Confirmar Coleta pelo Reciclador ---
            async function confirmCollection(lixoId) {
                console.log('reciclador.html: Tentando confirmar coleta para ID:', lixoId);
                try {
                    const response = await fetch(`http://localhost:3000/lixo/${lixoId}/confirmar`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_reciclador_fk: Number(userId) }) // Garante que userId é um número
                    });
                    console.log('reciclador.html: Resposta da API de confirmar coleta:', response.status);
                    const data = await response.json();
                    if (response.ok) {
                        alert(data.message);
                        loadMyCollections();
                        loadDashboardStats();
                    } else {
                        alert(data.message || 'Erro ao confirmar coleta.');
                    }
                } catch (error) {
                    console.error('reciclador.html: Erro ao confirmar coleta:', error);
                    alert('Erro de conexão ao confirmar coleta.');
                }
            }

            // --- Lógica para Cancelar Coleta pelo Reciclador ---
            async function cancelCollection(lixoId) {
                console.log('reciclador.html: Tentando cancelar coleta para ID:', lixoId);
                try {
                    const response = await fetch(`http://localhost:3000/lixo/${lixoId}/cancelar-reciclador`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_reciclador_fk: Number(userId) }) // Garante que userId é um número
                    });
                    console.log('reciclador.html: Resposta da API de cancelar coleta:', response.status);
                    const data = await response.json();
                    if (response.ok) {
                        alert(data.message);
                        loadMyCollections();
                        loadAvailableLixos();
                        loadDashboardStats();
                    } else {
                        alert(data.message || 'Erro ao cancelar coleta.');
                    }
                } catch (error) {
                    console.error('reciclador.html: Erro ao cancelar coleta:', error);
                    alert('Erro de conexão ao cancelar coleta.');
                }
            }

            // --- Lógica para Carregar Estatísticas do Dashboard ---
            async function loadDashboardStats() {
                console.log('reciclador.html: loadDashboardStats iniciada para userId:', userId);
                dashboardMessage.textContent = 'Carregando estatísticas...';
                dashboardMessage.className = 'mt-4 text-center text-gray-500 text-sm';
                try {
                    // Garante que userId é um número para a URL
                    const response = await fetch(`http://localhost:3000/dashboard/reciclador/stats/${Number(userId)}`);
                    console.log(`reciclador.html: Resposta da API de estatísticas do reciclador/${userId}:`, response.status);
                    if (!response.ok) throw new Error('Erro ao carregar lixos para estatísticas');
                    const stats = await response.json();
                    console.log('reciclador.html: Estatísticas carregadas:', stats);

                    coletadoSemanaCount.textContent = stats.coletado_semana;
                    coletadoMesCount.textContent = stats.coletado_mes;
                    totalColetadoCount.textContent = stats.total_coletado;

                    // Carregar lixos a caminho recentes
                    aCaminhoDashboardTableBody.innerHTML = '';
                    if (stats.a_caminho_recentes.length === 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td colspan="3" class="py-3 px-6 text-center text-gray-500">Nenhum lixo a caminho no momento.</td>`;
                        aCaminhoDashboardTableBody.appendChild(row);
                    } else {
                        stats.a_caminho_recentes.forEach(lixo => {
                            const row = document.createElement('tr');
                            row.className = 'border-b border-gray-200 hover:bg-gray-100';
                            const dataPostagem = new Date(lixo.data_postagem).toLocaleString('pt-BR');
                            row.innerHTML = `
                                <td class="py-3 px-6 text-left">${lixo.nome_lixo}</td>
                                <td class="py-3 px-6 text-left">${lixo.tipo_lixo}</td>
                                <td class="py-3 px-6 text-left">${dataPostagem}</td>
                            `;
                            aCaminhoDashboardTableBody.appendChild(row);
                        });
                    }

                    dashboardMessage.textContent = '';

                } catch (error) {
                    console.error('reciclador.html: Erro ao carregar estatísticas do dashboard:', error);
                    dashboardMessage.textContent = 'Erro ao carregar estatísticas. Tente novamente.';
                    dashboardMessage.className = 'mt-4 text-center text-red-600 text-sm font-medium';
                }
            }

            // --- Lógica do Modal de Comentários ---
            async function openCommentsModal(lixoId, lixoName) {
                console.log('reciclador.html: Abrindo modal de comentários para Lixo ID:', lixoId);
                currentLixoIdForComments = lixoId;
                lixoNameForComments.textContent = lixoName;
                commentsList.innerHTML = '<p class="text-gray-500 text-center">Carregando comentários...</p>';
                commentMessage.textContent = '';
                newCommentText.value = '';
                commentsModal.classList.remove('hidden');

                await loadComments(lixoId);
            }

            closeCommentsModal.addEventListener('click', () => {
                console.log('reciclador.html: Fechando modal de comentários.');
                commentsModal.classList.add('hidden');
                currentLixoIdForComments = null;
            });

            async function loadComments(lixoId) {
                console.log('reciclador.html: Carregando comentários para Lixo ID:', lixoId);
                try {
                    const response = await fetch(`http://localhost:3000/lixo/${Number(lixoId)}/comentarios`);
                    console.log(`reciclador.html: Resposta da API de comentários para lixo ${lixoId}:`, response.status);
                    if (!response.ok) throw new Error('Erro ao carregar comentários');
                    const comments = await response.json();
                    console.log('reciclador.html: Comentários carregados:', comments.length, comments);

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
                    console.error('reciclador.html: Erro ao carregar comentários:', error);
                    commentsList.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar comentários.</p>';
                }
            }

            addCommentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                console.log('reciclador.html: Formulário de adicionar comentário enviado.');
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
                    console.log('reciclador.html: Resposta da API de adicionar comentário:', response.status);
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
                    console.error('reciclador.html: Erro ao adicionar comentário:', error);
                    commentMessage.textContent = 'Erro de conexão ao adicionar comentário.';
                    commentMessage.classList.add('text-red-600');
                }
            });

            // --- Lógica de Logout ---
            logoutButton.addEventListener('click', () => {
                console.log('reciclador.html: Botão de logout clicado.');
                localStorage.removeItem('userType');
                localStorage.removeItem('userName');
                localStorage.removeItem('id_usuario');
                localStorage.removeItem('userEmail'); // Limpa também o email
                window.location.href = 'login.html';
            });
        });