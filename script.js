
const API_URL = "/api/alunos";

const formulario = document.getElementById("aluno-form");
const tabela = document.getElementById("alunos-tbody");

const campoId = document.getElementById("aluno-id");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoIdade = document.getElementById("idade");
const campoCurso = document.getElementById("curso");

const botaoSalvar = document.getElementById("btn-save");
const botaoCancelar = document.getElementById("btn-cancel");

function mostrarMensagem(texto, erro = false) {
    let mensagem = document.getElementById("mensagem");

    if (!mensagem) {
        mensagem = document.createElement("p");
        mensagem.id = "mensagem";
        formulario.appendChild(mensagem);
    }

    mensagem.textContent = texto;
    mensagem.style.color = erro ? "red" : "green";
}

async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);

    if (resposta.status === 204) {
        return null;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.error || dados.erro || "Erro na API");
    }

    return dados;
}

async function carregarAlunos() {
    try {
        const alunos = await requisicao(API_URL);
        tabela.innerHTML = "";

        alunos.forEach(aluno => {
            const linha = document.createElement("tr");

            [
                aluno.id,
                aluno.nome,
                aluno.email,
                aluno.idade ?? "Não informada",
                aluno.curso
            ].forEach(valor => {
                const celula = document.createElement("td");
                celula.textContent = String(valor);
                linha.appendChild(celula);
            });

            const acoes = document.createElement("td");

            const editar = document.createElement("button");
            editar.type = "button";
            editar.textContent = "Editar";

            editar.onclick = function() {
                campoId.value = aluno.id;
                campoNome.value = aluno.nome;
                campoEmail.value = aluno.email;
                campoIdade.value = aluno.idade ?? "";
                campoCurso.value = aluno.curso;

                botaoSalvar.textContent = "Atualizar Aluno";
                botaoCancelar.style.display = "inline-block";
            };

            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.textContent = "Excluir";

            excluir.onclick = async function() {
                if (!confirm("Deseja excluir este aluno?")) return;

                try {
                    await requisicao(API_URL + "/" + aluno.id, {
                        method: "DELETE"
                    });

                    mostrarMensagem("Aluno excluído!", false);
                    await carregarAlunos();
                } catch (erro) {
                    mostrarMensagem(erro.message, true);
                }
            };

            acoes.appendChild(editar);
            acoes.appendChild(excluir);
            linha.appendChild(acoes);
            tabela.appendChild(linha);
        });

        if (alunos.length === 0) {
            tabela.innerHTML =
                '<tr><td colspan="6">Nenhum aluno cadastrado.</td></tr>';
        }
    } catch (erro) {
        mostrarMensagem("Erro ao carregar: " + erro.message, true);
        console.error(erro);
    }
}

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const aluno = {
        nome: campoNome.value.trim(),
        email: campoEmail.value.trim(),
        idade: Number(campoIdade.value),
        curso: campoCurso.value
    };

    if (
        !aluno.nome ||
        !aluno.email ||
        !campoIdade.value ||
        !Number.isInteger(aluno.idade) ||
        aluno.idade < 1 ||
        !aluno.curso
    ) {
        mostrarMensagem("Preencha todos os campos corretamente.", true);
        return;
    }

    const id = campoId.value;
    const editando = id !== "";

    botaoSalvar.disabled = true;

    try {
        await requisicao(
            editando ? API_URL + "/" + id : API_URL,
            {
                method: editando ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aluno)
            }
        );

        mostrarMensagem(
            editando ? "Aluno atualizado!" : "Aluno cadastrado com sucesso!",
            false
        );

        formulario.reset();
        campoId.value = "";
        botaoSalvar.textContent = "Salvar Aluno";
        botaoCancelar.style.display = "none";

        await carregarAlunos();
    } catch (erro) {
        mostrarMensagem("Não foi possível salvar: " + erro.message, true);
        console.error(erro);
    } finally {
        botaoSalvar.disabled = false;
    }
});

botaoCancelar.onclick = function() {
    formulario.reset();
    campoId.value = "";
    botaoSalvar.textContent = "Salvar Aluno";
    botaoCancelar.style.display = "none";
};

carregarAlunos();
