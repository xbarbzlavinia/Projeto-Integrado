document.addEventListener('DOMContentLoaded', async () => {
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
            const availableLixosTab = document.getElementById('availableLixosTab'); // Renomeado para Coletar Lixo
            const myCollectionsTab = document.getElementById('myCollectionsTab'); // Renomeado para Status (Minhas Coletas)

            // Seções
            const dashboardSection = document.getElementById('dashboardSection');
            const availableLixosSection = document.getElementById('availableLixosSection'); // Conteúdo de Coletar Lixo
            const myCollectionsSection = document.getElementById('myCollectionsSection'); // Conteúdo de Minhas Coletas

            // Elementos da seção Lixos Disponíveis (Coletar Lixo)
            const availableLixosList = document.getElementById('availableLixosList');
            const availableLixosMessage = document.getElementById('availableLixosMessage');
            const availableTipoLixoFilter = document.getElementById('availableTipoLixoFilter');
            const availablePontoColetaNameFilter = document.getElementById('availablePontoColetaNameFilter');

            // Elementos da seção Minhas Coletas (Status)
            const myCollectionsList = document.getElementById('myCollectionsList');
            const myCollectionsMessage = document.getElementById('myCollectionsMessage');
            const myCollectionsTipoLixoFilter = document.getElementById('myCollectionsTipoLixoFilter');
            const myCollectionsPontoColetaNameFilter = document.getElementById('myCollectionsPontoColetaNameFilter');

            // Elementos do Dashboard
            const coletadoSemanaCount = document.getElementById('coletadoSemanaCount');
            const coletadoMesCount = document.getElementById('coletadoMesCount');
            const totalColetadoCount = document.getElementById('totalColetadoCount');
            const collectedRecicladorLixosDashboardList = document.getElementById('collectedRecicladorLixosDashboardList');
            const dashboardMessage = document.getElementById('dashboardMessage');

            // Elementos do Modal de Comentários
            const commentsModal = document.getElementById('commentsModal');
            const closeCommentsModal = document.getElementById('closeCommentsModal');
            const lixoNameForComments = document.getElementById('lixoNameForComments');
            const commentsList = document.getElementById('commentsList');
            const addCommentForm = document.getElementById('addCommentForm');
            const newCommentText = document.getElementById('newCommentText');
            const commentMessage = document.getElementById('commentMessage');

            let currentLixoIdForComments = null;

            // --- Dados Fictícios (Simulados) ---
            let simulatedLixos = JSON.parse(localStorage.getItem('simulatedLixos')) || [];
            let simulatedPontos = [
                { id: 101, nome_ponto: 'Ecoponto Praia da Costa', tipo_ponto: 'Plástico, Papel', endereco: 'Av. Antônio Gil Veloso, s/n - Praia da Costa, Vila Velha - ES' },
                { id: 102, nome_ponto: 'Ponto Comunitário Cobilândia', tipo_ponto: 'Orgânico', endereco: 'Rua Santa Terezinha, 50 - Cobilândia, Vila Velha - ES' },
                { id: 103, nome_ponto: 'Coleta Eletrônicos Glória', tipo_ponto: 'Eletrônico, Borracha', endereco: 'Rua da Indústria, 300 - Glória, Vila Velha - ES' },
                { id: 104, nome_ponto: 'Ecoponto Coqueiral', tipo_ponto: 'Vidro, Metal', endereco: 'Av. Santa Leopoldina, 800 - Coqueiral de Itaparica, Vila Velha - ES' },
                { id: 105, nome_ponto: 'Coleta Baterias Centro', tipo_ponto: 'Bateria', endereco: 'Av. Jerônimo Monteiro, 900 - Centro, Vila Velha - ES' }
            ];
            let simulatedUsers = [ // Apenas para referência interna de nomes
                { id: 1, email: 'produtor@exemplo.com', nome: 'Produtor Teste', tipo: 'Produtor' },
                { id: 2, email: 'reciclador@exemplo.com', nome: 'Reciclador Teste', tipo: 'Reciclador' }
            ];

            // Inicializa alguns lixos se estiver vazio para simulação
            if (simulatedLixos.length === 0) {
                simulatedLixos = [
                    { id_lixo: 1, nome_lixo: 'Garrafas PET', tipo_lixo: 'Plástico', status: 'Pendente', data_postagem: new Date('2025-06-01T10:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 101, comentarios: [] },
                    { id_lixo: 2, nome_lixo: 'Resto de Fruta', tipo_lixo: 'Orgânico', status: 'Reciclador à caminho', data_postagem: new Date('2025-06-03T11:30:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: 2, id_ponto_coleta_fk: 102, comentarios: [{id_comentario:1, id_lixo_fk:2, id_usuario_fk:1, texto:"Preciso que seja coletado logo!", data_comentario: new Date('2025-06-03T11:40:00Z').toISOString() }] },
                    { id_lixo: 3, nome_lixo: 'Jornal Velho', tipo_lixo: 'Papel', status: 'Pendente', data_postagem: new Date('2025-06-05T09:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 101, comentarios: [] },
                    { id_lixo: 4, nome_lixo: 'Garrafa de Vinho', tipo_lixo: 'Vidro', status: 'Pendente', data_postagem: new Date('2025-06-07T14:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 104, comentarios: [] },
                    { id_lixo: 5, nome_lixo: 'Pilhas Usadas', tipo_lixo: 'Bateria', status: 'Coletado', data_postagem: new Date('2025-05-20T16:00:00Z').toISOString(), data_coleta: new Date('2025-05-21T09:00:00Z').toISOString(), id_produtor_fk: 1, id_reciclador_fk: 2, id_ponto_coleta_fk: 105, comentarios: [] },
                    { id_lixo: 6, nome_lixo: 'Caixa de Leite', tipo_lixo: 'Papel', status: 'Pendente', data_postagem: new Date('2025-06-08T10:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 101, comentarios: [] },
                    { id_lixo: 7, nome_lixo: 'Resto de Almoço', tipo_lixo: 'Orgânico', status: 'Coletado', data_postagem: new Date('2025-05-28T13:00:00Z').toISOString(), data_coleta: new Date('2025-05-29T08:00:00Z').toISOString(), id_produtor_fk: 1, id_reciclador_fk: 2, id_ponto_coleta_fk: 102, comentarios: [] },
                    { id_lixo: 8, nome_lixo: 'Fio de Cobre', tipo_lixo: 'Metal', status: 'Pendente', data_postagem: new Date('2025-06-10T10:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 104, comentarios: [] },
                    { id_lixo: 9, nome_lixo: 'Bateria de Carro', tipo_lixo: 'Bateria', status: 'Pendente', data_postagem: new Date('2025-06-11T10:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 105, comentarios: [] },
                    { id_lixo: 10, nome_lixo: 'Casca de Legume', tipo_lixo: 'Orgânico', status: 'Pendente', data_postagem: new Date('2025-06-12T10:00:00Z').toISOString(), data_coleta: null, id_produtor_fk: 1, id_reciclador_fk: null, id_ponto_coleta_fk: 102, comentarios: [] },
                ];
                localStorage.setItem('simulatedLixos', JSON.stringify(simulatedLixos));
            }


            // Recupera dados do usuário do localStorage
            const userId = Number(localStorage.getItem('id_usuario')); // Converter para Number é importante
            const userName = localStorage.getItem('userName');
            const userType = localStorage.getItem('userType');
            const userEmail = localStorage.getItem('userEmail');

            // --- Verificação de Autenticação e Tipo de Usuário ---
            if (!userId || userType !== 'Reciclador') {
                window.location.href = 'login.html'; // Redireciona para o login.html
                return;
            }
            userNameDisplayHeader.textContent = userName;
            userNameDisplayDropdown.textContent = `Olá, ${userName}!`;
            userEmailDisplayDropdown.textContent = userEmail;
            userTypeDisplayDropdown.textContent = userType;

            // --- Lógica do Account Hub (Dropdown de Conta) ---
            accountHubToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                accountHubDropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', (event) => {
                if (!accountHubToggle.contains(event.target) && !accountHubDropdown.contains(event.target)) {
                    accountHubDropdown.classList.add('hidden');
                }
            });

            // --- Lógica de Abas (Tabs) ---
            function showTab(tabId) {
                document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));

                // Atualiza a aba clicada para 'active'
                const clickedTabButton = document.getElementById(tabId + 'Tab');
                clickedTabButton.classList.add('active');
                
                // Atualiza o estado da imagem do botão
                document.querySelectorAll('.tab-button').forEach(button => {
                    const img = button.querySelector('img');
                    if (button.classList.contains('active')) {
                        img.style.filter = 'brightness(0) saturate(100%) invert(86%) sepia(10%) saturate(372%) hue-rotate(82deg) brightness(103%) contrast(96%)'; 
                    } else {
                        img.style.filter = 'brightness(0) invert(1)'; 
                    }
                });

                document.getElementById(tabId + 'Section').classList.remove('hidden');

                if (tabId === 'availableLixos') { 
                    loadAvailableLixos();
                } else if (tabId === 'myCollections') { 
                    loadMyCollections();
                } else if (tabId === 'dashboard') {
                    loadDashboardStats();
                }
            }
            showTab('dashboard'); // Ativar a aba Dashboard por padrão
            dashboardTab.addEventListener('click', (e) => {
                e.preventDefault();
                showTab('dashboard');
            });
            availableLixosTab.addEventListener('click', (e) => {
                e.preventDefault();
                showTab('availableLixos');
            });
            myCollectionsTab.addEventListener('click', (e) => {
                e.preventDefault();
                showTab('myCollections');
            });


            // Função auxiliar para obter o SVG do ícone baseado no tipo de lixo
            function getLixoIconSvg(tipoLixo) {
                switch (tipoLixo.toLowerCase()) {
                    case 'orgânico':
                        return `<img class="icon-lixo" src="./img/organico.svg" alt="ícone de lixo">`;
                    case 'plástico':
                        return `<img class="icon-lixo" src="./img/plastico.svg" alt="ícone de lixo">`;
                    case 'papel':
                        return `<img class="icon-lixo" src="./img/papel.svg" alt="ícone de lixo">`;
                    case 'vidro':
                        return `<img class="icon-lixo" src="./img/vidro.svg" alt="ícone de lixo">`;
                    case 'metal':
                        return `<img class="icon-lixo" src="./img/metal.svg" alt="ícone de lixo">`;
                    case 'eletrônico':
                        return `<img class="icon-lixo" src="./img/eletronico.svg" alt="ícone de lixo">`;
                    case 'bateria':
                        return `<img class="icon-lixo" src="./img/bateria.svg" alt="ícone de lixo">`;
                    case 'borracha':
                        return `<img class="icon-lixo" src="./img/borracha.svg" alt="ícone de lixo">`;
                    default:
                        return `<svg class="icon-lixo" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M25 5C13.97 5 5 13.97 5 25s8.97 20 20 20 20-8.97 20-20S36.03 5 25 5zm0 35c-8.28 0-15-6.72-15-15s6.72-15 15-15 15 6.72 15 15-6.72 15-15 15zM22.5 15h5v20h-5zM15 22.5h20v5H15z"/></svg>`;
                }
            }

            // --- Lógica para Carregar Lixos Disponíveis (na aba Coletar Lixo) ---
            async function loadAvailableLixos() {
                availableLixosList.innerHTML = '';
                availableLixosMessage.textContent = 'Carregando lixos disponíveis...';
                availableLixosMessage.classList.remove('hidden');

                const tipoLixoFilter = availableTipoLixoFilter.value;
                const pontoColetaNameFilter = availablePontoColetaNameFilter.value.trim().toLowerCase();

                let filteredLixos = simulatedLixos.filter(lixo => lixo.status === 'Pendente');

                if (tipoLixoFilter) {
                    filteredLixos = filteredLixos.filter(lixo => lixo.tipo_lixo.toLowerCase().includes(tipoLixoFilter.toLowerCase()));
                }
                if (pontoColetaNameFilter) {
                    filteredLixos = filteredLixos.filter(lixo => {
                        const ponto = simulatedPontos.find(p => p.id === lixo.id_ponto_coleta_fk);
                        return ponto && ponto.nome_ponto.toLowerCase().includes(pontoColetaNameFilter);
                    });
                }
                
                if (filteredLixos.length === 0) {
                    availableLixosMessage.textContent = 'Nenhum lixo disponível para coleta no momento ou nenhum lixo corresponde aos filtros.';
                    return;
                }

                availableLixosMessage.classList.add('hidden');
                availableLixosList.classList.remove('hidden');

                filteredLixos.forEach(lixo => {
                    const pontoColeta = simulatedPontos.find(p => p.id === lixo.id_ponto_coleta_fk);
                    const produtor = simulatedUsers.find(u => u.id === lixo.id_produtor_fk);

                    const card = document.createElement('div');
                    card.className = `lixo-card status-Pendente`; /* Usando classe customizada para status */
                    
                    const dataPostagem = new Date(lixo.data_postagem).toLocaleString('pt-BR');

                    card.innerHTML = `
                        <h3>${lixo.nome_lixo}</h3>
                        ${getLixoIconSvg(lixo.tipo_lixo)}
                        <div class="lixo-card-details">
                            <p><strong>Tipo:</strong> ${lixo.tipo_lixo}</p>
                            <p><strong>Ponto:</strong> ${pontoColeta ? pontoColeta.nome_ponto : 'N/A'}</p>
                            <p><strong>Produtor:</strong> ${produtor ? produtor.nome : 'N/A'}</p>
                            <p class="text-muted">Postado em: ${dataPostagem}</p>
                        </div>
                        <div class="card-buttons-container">
                            <button data-id="${lixo.id_lixo}" class="action-button collect-lixo-btn">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 00-2 2v2.167a.5.5 0 01-.157.345L5 14.5m6-8L9 11m4-5L9 11m4-5L14 10m4-5L17 10m-3-5V4m3 0V3m-3 0H7m0 0L6 14m0 0L5 14m0 0L4 14m0 0L3 14m0 0L2 14m0 0L1 14m0 0v-2.167a.5.5 0 00-.157-.345L.5 14.5m11.5-8L13 11m-4-5L13 11m-4-5L14 10m4-5L17 10m-3-5V4m3 0V3m-3 0H7m0 0L6 14m0 0L5 14m0 0L4 14m0 0L3 14m0 0L2 14m0 0L1 14"></path></svg>
                                <span>Coletar</span>
                            </button>
                            <button data-id="${lixo.id_lixo}" data-name="${lixo.nome_lixo}" class="comments-button view-comments-btn">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.764 9.764 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <span>Comentários</span>
                            </button>
                        </div>
                    `;
                    availableLixosList.appendChild(card);

                    card.querySelector('.collect-lixo-btn').addEventListener('click', async (e) => {
                        const lixoId = Number(e.currentTarget.dataset.id);
                        if (confirm('Deseja realmente coletar este lixo?')) {
                            const lixoIndex = simulatedLixos.findIndex(item => item.id_lixo === lixoId);
                            if (lixoIndex !== -1 && simulatedLixos[lixoIndex].status === 'Pendente') {
                                simulatedLixos[lixoIndex].status = 'Reciclador à caminho';
                                simulatedLixos[lixoIndex].id_reciclador_fk = userId;
                                localStorage.setItem('simulatedLixos', JSON.stringify(simulatedLixos));
                                alert('Lixo marcado para coleta com sucesso.');
                                loadAvailableLixos();
                                loadMyCollections();
                                showTab('myCollections'); // Redireciona para Minhas Coletas
                            } else if (lixoIndex !== -1) {
                                alert(`Este lixo não está disponível para coleta (status: ${simulatedLixos[lixoIndex].status}).`);
                            }
                        }
                    });

                    card.querySelector('.view-comments-btn').addEventListener('click', (e) => {
                        const lixoId = Number(e.currentTarget.dataset.id);
                        const lixoName = e.currentTarget.dataset.name;
                        openCommentsModal(lixoId, lixoName);
                    });
                });
            }

            availableTipoLixoFilter.addEventListener('change', loadAvailableLixos);
            availablePontoColetaNameFilter.addEventListener('input', loadAvailableLixos);

            // --- Lógica para Carregar Minhas Coletas (na aba Status) ---
            async function loadMyCollections() {
                myCollectionsList.innerHTML = '';
                myCollectionsMessage.textContent = 'Carregando suas coletas...';
                myCollectionsMessage.classList.remove('hidden');

                let filteredLixos = simulatedLixos.filter(lixo =>
                    lixo.id_reciclador_fk === userId && lixo.status !== 'Pendente' && lixo.status !== 'Cancelado'
                );

                const tipoLixoFilter = myCollectionsTipoLixoFilter.value;
                const pontoColetaNameFilter = myCollectionsPontoColetaNameFilter.value.trim().toLowerCase();

                if (tipoLixoFilter) {
                    filteredLixos = filteredLixos.filter(lixo => lixo.tipo_lixo.toLowerCase().includes(tipoLixoFilter.toLowerCase()));
                }
                if (pontoColetaNameFilter) {
                    filteredLixos = filteredLixos.filter(lixo => {
                        const ponto = simulatedPontos.find(p => p.id === lixo.id_ponto_coleta_fk);
                        return ponto && ponto.nome_ponto.toLowerCase().includes(pontoColetaNameFilter);
                    });
                }
                
                if (filteredLixos.length === 0) {
                    myCollectionsMessage.textContent = 'Você ainda não tem coletas atribuídas ou concluídas que correspondam aos filtros.';
                    return;
                }

                myCollectionsMessage.classList.add('hidden');
                myCollectionsList.classList.remove('hidden');

                filteredLixos.forEach(lixo => {
                    const pontoColeta = simulatedPontos.find(p => p.id === lixo.id_ponto_coleta_fk);
                    const produtor = simulatedUsers.find(u => u.id === lixo.id_produtor_fk);

                    const card = document.createElement('div');
                    card.className = `lixo-card status-${lixo.status.replace(/\s/g, '-')}`; /* Ajuste para nomes de classe válidos */
                    
                    const dataPostagem = new Date(lixo.data_postagem).toLocaleString('pt-BR');
                    const dataColeta = lixo.data_coleta ? new Date(lixo.data_coleta).toLocaleString('pt-BR') : 'N/A';
                    const produtorNome = produtor ? produtor.nome : 'N/A';

                    card.innerHTML = `
                        <h3>${lixo.nome_lixo}</h3>
                        ${getLixoIconSvg(lixo.tipo_lixo)}
                        <div class="lixo-card-details">
                            <p><strong>Tipo:</strong> ${lixo.tipo_lixo}</p>
                            <p><strong>Status:</strong> ${lixo.status}</p>
                            <p><strong>Ponto:</strong> ${pontoColeta ? pontoColeta.nome_ponto : 'N/A'}</p>
                            <p><strong>Produtor:</strong> ${produtorNome}</p>
                            <p class="text-muted">Postado em: ${dataPostagem}</p>
                            ${lixo.status === 'Coletado' ? `<p class="text-muted">Coletado em: ${dataColeta}</p>` : ''}
                        </div>
                        <div class="card-buttons-container">
                            ${lixo.status === 'Reciclador à caminho' ?
                            `
                            <button data-id="${lixo.id_lixo}" class="action-button confirm-btn">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Confirmar</span>
                            </button>
                            <button data-id="${lixo.id_lixo}" class="action-button cancel-collection-btn">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                <span>Cancelar Coleta</span>
                            </button>
                            ` :
                            `<span class="action-unavailable">Ação Indisponível</span>`
                            }
                            <button data-id="${lixo.id_lixo}" data-name="${lixo.nome_lixo}" class="comments-button view-comments-btn">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.764 9.764 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <span>Comentários</span>
                            </button>
                        </div>
                    `;
                    myCollectionsList.appendChild(card);

                    if (lixo.status === 'Reciclador à caminho') {
                        card.querySelector('.confirm-btn').addEventListener('click', async (e) => {
                            const lixoId = Number(e.currentTarget.dataset.id);
                            if (confirm('Tem certeza que deseja confirmar a coleta deste lixo?')) {
                                const lixoIndex = simulatedLixos.findIndex(item => item.id_lixo === lixoId);
                                if (lixoIndex !== -1 && simulatedLixos[lixoIndex].id_reciclador_fk === userId) {
                                    simulatedLixos[lixoIndex].status = 'Coletado';
                                    simulatedLixos[lixoIndex].data_coleta = new Date().toISOString();
                                    localStorage.setItem('simulatedLixos', JSON.stringify(simulatedLixos));
                                    alert('Coleta confirmada com sucesso.');
                                    loadMyCollections();
                                    loadDashboardStats();
                                }
                            }
                        });

                        card.querySelector('.cancel-collection-btn').addEventListener('click', async (e) => {
                            const lixoId = Number(e.currentTarget.dataset.id);
                            if (confirm('Tem certeza que deseja cancelar a coleta deste lixo? Ele voltará a ficar disponível para outros recicladores.')) {
                                const lixoIndex = simulatedLixos.findIndex(item => item.id_lixo === lixoId);
                                if (lixoIndex !== -1 && simulatedLixos[lixoIndex].id_reciclador_fk === userId) {
                                    simulatedLixos[lixoIndex].status = 'Pendente';
                                    simulatedLixos[lixoIndex].id_reciclador_fk = null;
                                    simulatedLixos[lixoIndex].data_coleta = null;
                                    localStorage.setItem('simulatedLixos', JSON.stringify(simulatedLixos));
                                    alert('Coleta cancelada pelo reciclador, lixo voltou a ser Pendente.');
                                    loadMyCollections();
                                    loadAvailableLixos();
                                    loadDashboardStats();
                                }
                            }
                        });
                    }

                    card.querySelector('.view-comments-btn').addEventListener('click', (e) => {
                        const lixoId = Number(e.currentTarget.dataset.id);
                        const lixoName = e.currentTarget.dataset.name;
                        openCommentsModal(lixoId, lixoName);
                    });
                });
            }

            myCollectionsTipoLixoFilter.addEventListener('change', loadMyCollections);
            myCollectionsPontoColetaNameFilter.addEventListener('input', loadMyCollections);

            // --- Gráficos Chart.js para Reciclador ---
            let coletadoSemanaChartInstance = null;
            let coletadoMesChartInstance = null;

            function renderRecicladorCharts(myCollectedLixos) {
                // Gráfico Semanal
                const lixosColetadosPorDiaSemana = Array(7).fill(0); // 0-Domingo, 1-Segunda...
                const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                
                myCollectedLixos.forEach(lixo => {
                    const date = new Date(lixo.data_coleta);
                    lixosColetadosPorDiaSemana[date.getDay()]++;
                });

                const ctxSemana = document.getElementById('coletadoSemanaChart').getContext('2d');
                if (coletadoSemanaChartInstance) {
                    coletadoSemanaChartInstance.destroy(); // Destrói a instância anterior
                }
                coletadoSemanaChartInstance = new Chart(ctxSemana, {
                    type: 'bar',
                    data: {
                        labels: daysOfWeek,
                        datasets: [{
                            label: 'Lixos Coletados',
                            data: lixosColetadosPorDiaSemana,
                            backgroundColor: '#F28F00', // Laranja
                            borderColor: '#d98200',
                            borderWidth: 1,
                            borderRadius: 5,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    title: (context) => context[0].label,
                                    label: (context) => `${context.dataset.label}: ${context.raw}`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    color: '#4a5568'
                                },
                                grid: {
                                    color: '#e2e8f0'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#4a5568'
                                },
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });

                // Gráfico Mensal
                const lixosColetadosPorMes = Array(12).fill(0);
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                
                myCollectedLixos.forEach(lixo => {
                    const date = new Date(lixo.data_coleta);
                    lixosColetadosPorMes[date.getMonth()]++;
                });

                const ctxMes = document.getElementById('coletadoMesChart').getContext('2d');
                if (coletadoMesChartInstance) {
                    coletadoMesChartInstance.destroy(); // Destrói a instância anterior
                }
                coletadoMesChartInstance = new Chart(ctxMes, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Lixos Coletados',
                            data: lixosColetadosPorMes,
                            backgroundColor: 'rgba(3, 140, 127, 0.4)', /* Verde com transparência */
                            borderColor: '#038C7F', /* Verde */
                            borderWidth: 2,
                            tension: 0.3, /* Curva suave */
                            pointBackgroundColor: '#038C7F',
                            pointBorderColor: '#038C7F',
                            pointRadius: 4,
                            fill: true,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    title: (context) => months[context[0].dataIndex],
                                    label: (context) => `${context.dataset.label}: ${context.raw}`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    color: '#4a5568'
                                },
                                grid: {
                                    color: '#e2e8f0'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#4a5568'
                                },
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }

            // --- Lógica para Carregar Estatísticas e Lixos Coletados do Dashboard ---
            async function loadDashboardStats() {
                dashboardMessage.textContent = 'Carregando estatísticas...';
                dashboardMessage.classList.remove('hidden');

                const myCollectedLixos = simulatedLixos.filter(lixo => lixo.id_reciclador_fk === userId && lixo.status === 'Coletado');
                const myLixosOnTheWay = simulatedLixos.filter(lixo => lixo.id_reciclador_fk === userId && lixo.status === 'Reciclador à caminho');

                const totalColetado = myCollectedLixos.length;
                
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const coletadoSemana = myCollectedLixos.filter(lixo => new Date(lixo.data_coleta) >= startOfWeek).length;
                const coletadoMes = myCollectedLixos.filter(lixo => new Date(lixo.data_coleta) >= startOfMonth).length;

                const lixoColetadoRecentemente = myCollectedLixos.sort((a, b) => new Date(b.data_coleta) - new Date(a.data_coleta)); // Ordena do mais recente para o mais antigo

                coletadoSemanaCount.textContent = coletadoSemana;
                coletadoMesCount.textContent = coletadoMes;
                totalColetadoCount.textContent = totalColetado;

                renderRecicladorCharts(myCollectedLixos); // Renderiza os gráficos do Chart.js para reciclador

                // Carrega os cards de lixo coletado no dashboard
                collectedRecicladorLixosDashboardList.innerHTML = '';
                if (lixoColetadoRecentemente.length === 0) {
                    dashboardMessage.textContent = 'Nenhum lixo coletado recentemente para exibir.';
                    dashboardMessage.classList.remove('hidden');
                    collectedRecicladorLixosDashboardList.classList.add('hidden');
                } else {
                    dashboardMessage.classList.add('hidden'); // Esconde a mensagem se houver lixos
                    collectedRecicladorLixosDashboardList.classList.remove('hidden');
                    lixoColetadoRecentemente.forEach(lixo => {
                        const pontoColeta = simulatedPontos.find(p => p.id === lixo.id_ponto_coleta_fk);
                        const produtor = simulatedUsers.find(u => u.id === lixo.id_produtor_fk);

                        const card = document.createElement('div');
                        card.className = `lixo-card status-Coletado`; /* Sempre verde para coletado */
                        
                        const dataPostagem = new Date(lixo.data_postagem).toLocaleString('pt-BR');
                        const dataColeta = lixo.data_coleta ? new Date(lixo.data_coleta).toLocaleString('pt-BR') : 'N/A';
                        const produtorNome = produtor ? produtor.nome : 'N/A';

                        card.innerHTML = `
                            <h3>${lixo.nome_lixo}</h3>
                            ${getLixoIconSvg(lixo.tipo_lixo)}
                            <div class="lixo-card-details">
                                <p><strong>Tipo:</strong> ${lixo.tipo_lixo}</p>
                                <p><strong>Ponto:</strong> ${pontoColeta ? pontoColeta.nome_ponto : 'N/A'}</p>
                                <p><strong>Status:</strong> Coletado</p>
                                <p><strong>Produtor:</strong> ${produtorNome}</p>
                                <p class="text-muted">Postado em: ${dataPostagem}</p>
                                <p class="text-muted">Coletado em: ${dataColeta}</p>
                            </div>
                            <button data-id="${lixo.id_lixo}" data-name="${lixo.nome_lixo}" class="comments-button view-comments-btn">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.764 9.764 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <span>Comentários</span>
                            </button>
                        `;
                        collectedRecicladorLixosDashboardList.appendChild(card);

                        card.querySelector('.view-comments-btn').addEventListener('click', (e) => {
                            const lixoId = Number(e.currentTarget.dataset.id);
                            const lixoName = e.currentTarget.dataset.name;
                            openCommentsModal(lixoId, lixoName);
                        });
                    });
                }
            }

            // --- Lógica do Modal de Comentários ---
            async function openCommentsModal(lixoId, lixoName) {
                currentLixoIdForComments = lixoId;
                lixoNameForComments.textContent = lixoName;
                commentsList.innerHTML = '<p class="comment-text">Carregando comentários...</p>';
                commentMessage.textContent = '';
                newCommentText.value = '';
                commentsModal.classList.remove('hidden');

                await loadComments(lixoId);
            }

            closeCommentsModal.addEventListener('click', () => {
                commentsModal.classList.add('hidden');
                currentLixoIdForComments = null;
            });

            async function loadComments(lixoId) {
                const lixo = simulatedLixos.find(l => l.id_lixo === lixoId);
                commentsList.innerHTML = '';

                if (lixo && lixo.comentarios.length > 0) {
                    lixo.comentarios.forEach(comment => {
                        const commentDiv = document.createElement('div');
                        commentDiv.className = 'comment-item';
                        const commentDate = new Date(comment.data_comentario).toLocaleString('pt-BR');
                        const userComment = simulatedUsers.find(u => u.id === comment.id_usuario_fk);
                        commentDiv.innerHTML = `
                            <p class="comment-author">${userComment ? userComment.nome : 'Usuário Desconhecido'} (${userComment ? userComment.tipo : ''}) <span class="comment-date">- ${commentDate}</span></p>
                            <p class="comment-text">${comment.texto}</p>
                        `;
                        commentsList.appendChild(commentDiv);
                    });
                    commentsList.scrollTop = commentsList.scrollHeight;
                } else {
                    commentsList.innerHTML = '<p class="comment-text">Nenhum comentário ainda. Seja o primeiro!</p>';
                }
            }

            addCommentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                commentMessage.textContent = '';
                commentMessage.className = 'message-text';

                const texto = newCommentText.value.trim();
                if (!texto) {
                    commentMessage.textContent = 'O comentário não pode estar vazio.';
                    commentMessage.classList.add('error');
                    return;
                }

                const lixoIndex = simulatedLixos.findIndex(l => l.id_lixo === currentLixoIdForComments);
                if (lixoIndex !== -1) {
                    const newComment = {
                        id_comentario: simulatedLixos[lixoIndex].comentarios.length > 0 ? Math.max(...simulatedLixos[lixoIndex].comentarios.map(c => c.id_comentario)) + 1 : 1,
                        id_lixo_fk: currentLixoIdForComments,
                        id_usuario_fk: userId,
                        texto,
                        data_comentario: new Date().toISOString()
                    };
                    simulatedLixos[lixoIndex].comentarios.push(newComment);
                    localStorage.setItem('simulatedLixos', JSON.stringify(simulatedLixos));
                    commentMessage.textContent = 'Comentário adicionado com sucesso!';
                    commentMessage.classList.add('success');
                    newCommentText.value = '';
                    await loadComments(currentLixoIdForComments);
                } else {
                    commentMessage.textContent = 'Erro: Lixo não encontrado para adicionar comentário.';
                    commentMessage.classList.add('error');
                }
            });

            // --- Lógica de Logout ---
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('userType');
                localStorage.removeItem('userName');
                localStorage.removeItem('id_usuario');
                localStorage.removeItem('userEmail');
                window.location.href = 'login.html';
            });
        });