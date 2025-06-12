        document.addEventListener('DOMContentLoaded', () => {
            // Referências aos elementos HTML (agora com IDs corretos)
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const loginButton = document.getElementById('loginButton');
            const errorMessage = document.getElementById('errorMessage'); // Elemento adicionado

            // Adiciona um ouvinte de evento para o clique no botão de login
            loginButton.addEventListener('click', async (event) => {
                event.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

                // Obtém os valores dos campos de email e senha, removendo espaços em branco
                const email = emailInput.value.trim();
                const senha = passwordInput.value.trim();

                // Esconde e limpa mensagens de erro anteriores
                errorMessage.classList.add('hidden');
                errorMessage.textContent = '';

                // Validação básica no frontend: verifica se os campos não estão vazios
                if (!email || !senha) {
                    errorMessage.textContent = 'Por favor, preencha todos os campos.';
                    errorMessage.classList.remove('hidden');
                    return; // Interrompe a execução se os campos estiverem vazios
                }

                try {
                    // Envia as credenciais para o backend usando a API Fetch
                    // Certifique-se de que seu backend Node.js está rodando em http://localhost:3000
                    const response = await fetch('http://localhost:3000/login', {
                        method: 'POST', // Usa o método POST para enviar dados sensíveis
                        headers: {
                            'Content-Type': 'application/json' // Indica que o corpo da requisição é JSON
                        },
                        body: JSON.stringify({ email, senha }) // Converte o objeto { email, senha } para uma string JSON
                    });

                    // Pega a resposta JSON do backend
                    const data = await response.json();

                    // Verifica se a resposta HTTP indica sucesso (status 2xx)
                    if (response.ok) {
                        // Login bem-sucedido!

                        // Armazena o tipo de usuário e o nome do usuário no localStorage
                        // Isso permite que as páginas de destino saibam quem fez login e qual o tipo
                        localStorage.setItem('id_usuario', data.user.id_usuario); // Guardar o ID do usuário!
                        localStorage.setItem('userType', data.user.tipo_usuario);
                        localStorage.setItem('userName', data.user.nome_usuario);

                        // Redireciona o usuário com base no tipo retornado pelo backend
                        if (data.user.tipo_usuario === 'Produtor') {
                            window.location.href = 'produtor.html'; // Redireciona para a página do produtor
                        } else if (data.user.tipo_usuario === 'Reciclador') {
                            window.location.href = 'reciclador.html'; // Redireciona para a página do reciclador
                        } else {
                            // Caso o backend retorne um tipo de usuário inesperado
                            errorMessage.textContent = 'Tipo de usuário desconhecido. Contate o administrador.';
                            errorMessage.classList.remove('hidden');
                        }
                    } else {
                        // Login falhou (o backend retornou um erro, ex: 401 Unauthorized)
                        // Exibe a mensagem de erro que veio do backend
                        errorMessage.textContent = data.message || 'Erro ao fazer login. Tente novamente.';
                        errorMessage.classList.remove('hidden');
                    }
                } catch (error) {
                    // Captura erros de rede (ex: servidor backend não está rodando, problema de conexão)
                    console.error('Erro na requisição de login:', error);
                    errorMessage.textContent = 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.';
                    errorMessage.classList.remove('hidden');
                }
            });
        });