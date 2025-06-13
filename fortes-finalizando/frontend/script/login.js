document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('password'); // Alterado de 'senha' para 'password'
    const messageDisplay = document.getElementById('errorMessage'); // Alterado de 'message' para 'errorMessage'

    const simulatedUsers = [
        { id: 1, email: 'admin@fortes.com.br', senha: '123456', nome: 'Produtor Teste', tipo: 'Produtor' },
        { id: 2, email: 'cooperativas@fortes.com.br', senha: '123456', nome: 'Reciclador Teste', tipo: 'Reciclador' }
    ];

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        messageDisplay.textContent = '';
        messageDisplay.classList.add('hidden'); // Esconder a mensagem de erro inicialmente

        const email = emailInput.value;
        const senha = senhaInput.value;

        const user = simulatedUsers.find(u => u.email === email && u.senha === senha);

        if (user) {
            localStorage.setItem('id_usuario', user.id);
            localStorage.setItem('userName', user.nome);
            localStorage.setItem('userType', user.tipo);
            localStorage.setItem('userEmail', user.email);

            messageDisplay.textContent = 'Login bem-sucedido!';
            messageDisplay.classList.remove('hidden'); // Mostrar a mensagem
            messageDisplay.classList.add('text-green-600'); // Estilo de sucesso
            messageDisplay.classList.remove('text-red-600'); // Remover estilo de erro

            // Redireciona para a página correta
            if (user.tipo === 'Produtor') {
                window.location.href = 'produtor.html';
            } else if (user.tipo === 'Reciclador') {
                window.location.href = 'reciclador.html';
            }
        } else {
            messageDisplay.textContent = 'Email ou senha inválidos.';
            messageDisplay.classList.remove('hidden'); // Mostrar a mensagem
            messageDisplay.classList.add('text-red-600'); // Estilo de erro
            messageDisplay.classList.remove('text-green-600'); // Remover estilo de sucesso
        }
    });
});